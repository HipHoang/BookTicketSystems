from rest_framework import viewsets, generics, status
from managements.serializers import *
from managements import paginators
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from managements.paginators import Pagination
from managements.perms import *
from rest_framework.parsers import MultiPartParser, JSONParser

class UserViewSet(viewsets.ViewSet, generics.CreateAPIView):
    queryset = User.objects.filter(is_active=True)
    serializer_class = UserSerializer
    pagination_class = Pagination
    parser_classes = [JSONParser, MultiPartParser, ]

    def get_permissions(self):
        if self.action in ["change_password", "update_info", "get_current_user"]:
            return [IsAuthenticated(), OwnerPermission()]
        elif self.action == "create":
            return [AllowAny()]
        elif self.action == "get_all_users":
            return [AdminPermission()]
        return [IsAuthenticated()]

    @action(methods=['get'], url_path='all-users', detail=False)
    def get_all_users(self, request):
        self.check_permissions(request)
        queryset = User.objects.filter(active=True)
        pagination_class = paginators.Pagination()
        paginated_queryset = pagination_class.paginate_queryset(queryset, request, view=self)
        serializer = UserSerializer(paginated_queryset, many=True)
        return pagination_class.get_paginated_response(serializer.data)

    @action(methods=['get'], url_path='current', detail=False)
    def get_current_user(self, request):
        user = request.user
        self.check_object_permissions(request, user)
        serializer = UserSerializer(user)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(methods=['patch'], url_path='change-password', detail=False)
    def change_password(self, request):
        user = request.user
        self.check_object_permissions(request, user)

        serializer = ChangePasswordSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            user.set_password(serializer.validated_data['new_password'])
            user.save(update_fields=['password'])
            return Response({"message": "Mật khẩu đã được thay đổi thành công."}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(methods=['patch'], url_path='update-info', detail=False)
    def update_info(self, request):
        user = request.user  # lấy user hiện tại
        data = request.data.copy()  # ← dòng cần thêm
        serializer = UserSerializer(user, data=data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)