import hashlib
import hmac
import json

import requests
from django.db import transaction
from django.http import JsonResponse
from django.utils.crypto import get_random_string
from django.views.decorators.csrf import csrf_exempt
from rest_framework import viewsets, generics, status
from rest_framework.decorators import action
from rest_framework.parsers import MultiPartParser, JSONParser
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response

from managements import paginators
from managements.paginators import Pagination
from managements.perms import *
from managements.serializers import *
from .models import Seat, Reservation, ReservationDetail, Payment
from .serializers import SeatSerializer, ReservationSerializer, PaymentSerializer


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


class CompanyViewSet(viewsets.ModelViewSet):
    queryset = Company.objects.filter(active=True)
    serializer_class = CompanySerializer
    parser_classes = [JSONParser, MultiPartParser]
    pagination_class = Pagination

    def get_permissions(self):
        if self.action in ['update', 'partial_update', 'destroy']:
            return [IsAuthenticated(), AdminCompanyPermission()]
        elif self.action == "create":
            return [IsAuthenticated()]
        return [AllowAny()]

    def get_queryset(self):
        queryset = self.queryset
        q = self.request.query_params.get('q')
        if q:
            queryset = queryset.filter(name__icontains=q)
        return queryset

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user, approved=False)

    @action(methods=['post'], url_path='approve/(?P<pk>[^/.]+)', detail=False)
    def approve_company(self, request, pk=None):
        if not request.user.is_staff:  # hoặc role=Admin
            return Response({"message": "Bạn không có quyền"}, status=status.HTTP_403_FORBIDDEN)

        company = Company.objects.filter(pk=pk).first()
        if not company:
            return Response({"message": "Không tìm thấy công ty"}, status=status.HTTP_404_NOT_FOUND)

        company.approved = True
        company.save(update_fields=['approved'])

        company.owner.role = 'company'
        company.owner.save(update_fields=['role'])

        return Response({"message": "Đã duyệt công ty thành công"}, status=status.HTTP_200_OK)


class BusViewSet(viewsets.ModelViewSet):
    queryset = Bus.objects.filter(active=True)
    serializer_class = BusSerializer
    parser_classes = [JSONParser, MultiPartParser]
    pagination_class = Pagination

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAuthenticated(), AdminCompanyPermission()]
        return [AllowAny()]

    def get_queryset(self):
        queryset = self.queryset
        company_id = self.request.query_params.get('company_id')
        if company_id:
            queryset = queryset.filter(company_id=company_id)
        return queryset


class RouteViewSet(viewsets.ModelViewSet):
    queryset = Route.objects.filter(active=True)
    serializer_class = RouteSerializer
    pagination_class = Pagination

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            # chỉ admin mới thêm/sửa/xóa route
            return [IsAuthenticated(), AdminPermission()]
        return [AllowAny()]

    @action(detail=True, methods=["get"])
    def schedules(self, request, pk=None):
        """Trả về danh sách Schedule thuộc Route"""
        route = self.get_object()
        schedules = route.schedules.all()
        return Response(ScheduleSerializer(schedules, many=True).data)


class StopViewSet(viewsets.ModelViewSet):
    queryset = Stop.objects.filter(active=True)
    serializer_class = StopSerializer
    pagination_class = Pagination

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAuthenticated(), AdminCompanyPermission()]
        return [AllowAny()]

    def get_queryset(self):
        queryset = self.queryset
        route_id = self.request.query_params.get('route_id')
        if route_id:
            queryset = queryset.filter(route_id=route_id)
        return queryset


class ScheduleViewSet(viewsets.ModelViewSet):
    queryset = Schedule.objects.filter(active=True)
    serializer_class = ScheduleSerializer

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAuthenticated(), AdminCompanyPermission()]
        return [IsAuthenticated()]


# -------------------------
# Seat
# -------------------------
class SeatViewSet(viewsets.ModelViewSet):
    queryset = Seat.objects.filter(active=True)
    serializer_class = SeatSerializer
    filterset_fields = ['schedule']
    pagination_class = None

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        qs = super().get_queryset()
        schedule_id = self.request.query_params.get("schedule")
        if schedule_id:
            qs = qs.filter(schedule_id=schedule_id)
        return qs


# -------------------------
# Reservation
# -------------------------
class ReservationViewSet(viewsets.ModelViewSet):
    queryset = Reservation.objects.filter(active=True)
    serializer_class = ReservationSerializer

    def get_permissions(self):
        if self.action in ['create', 'get_by_code']:
            return [permissions.AllowAny()]
        if self.action in ['update', 'partial_update', 'destroy', 'my_reservations']:
            return [permissions.IsAuthenticated()]
        if self.action in ['retrieve', 'list']:
            return [permissions.IsAuthenticated()]
        return [permissions.IsAuthenticated()]

    @transaction.atomic
    def create(self, request, *args, **kwargs):
        data = request.data
        schedule_id = data.get("schedule_id")
        seat_ids = data.get("seat_ids", [])
        contact_name = data.get("contact_name")
        contact_phone = data.get("contact_phone")
        contact_email = data.get("contact_email")
        payment_method = data.get("payment_method", "cash")

        if not schedule_id or not seat_ids:
            return Response({"error": "Thiếu schedule_id hoặc seat_ids"}, status=status.HTTP_400_BAD_REQUEST)

        # ✅ Tạo reservation với trạng thái pending
        reservation = Reservation.objects.create(
            user=request.user if request.user.is_authenticated else None,
            schedule_id=schedule_id,
            booking_code=get_random_string(10).upper(),
            total_amount=data.get("total_amount", 0),
            contact_name=contact_name,
            contact_phone=contact_phone,
            status="pending",
            note=json.dumps(seat_ids)  # lưu seat_ids để IPN xử lý
        )

        # ✅ Chỉ cash mới tạo chi tiết ngay
        if payment_method == "cash":
            for sid in seat_ids:
                ReservationDetail.objects.create(
                    reservation=reservation,
                    seat_id=sid,
                    passenger_name=contact_name if not request.user.is_authenticated else request.user.get_full_name(),
                    passenger_phone=contact_phone if not request.user.is_authenticated else request.user.phone,
                    passenger_email=contact_email if not request.user.is_authenticated else request.user.email,
                )
            Seat.objects.filter(id__in=seat_ids).update(status="reserved")
            reservation.status = "confirmed"
            reservation.save(update_fields=["status"])

        return Response(ReservationSerializer(reservation).data, status=status.HTTP_201_CREATED)

    @action(methods=['get'], url_path='my', detail=False)
    def my_reservations(self, request):
        reservations = Reservation.objects.filter(user=request.user)
        serializer = ReservationSerializer(reservations, many=True)
        return Response(serializer.data)

    @action(methods=['get'], url_path='by-code/(?P<code>[^/.]+)', detail=False)
    def get_by_code(self, request, code):
        try:
            reservation = Reservation.objects.get(booking_code=code, active=True)
            serializer = ReservationSerializer(reservation)
            return Response(serializer.data)
        except Reservation.DoesNotExist:
            return Response({"error": "Không tìm thấy vé"}, status=404)

# -------------------------
# Payment
# -------------------------
class PaymentViewSet(viewsets.ModelViewSet):
    queryset = Payment.objects.filter(active=True)
    serializer_class = PaymentSerializer

    def get_permissions(self):
        # Cho phép guest tạo payment (đi chung với guest booking)
        if self.action in ['create', 'confirm_momo']:
            return [AllowAny()]
        return [IsAuthenticated()]

    @transaction.atomic
    def create(self, request, *args, **kwargs):
        data = request.data
        reservation_id = data.get("reservation_id")
        payment_method = data.get("payment_method", "cash")
        amount = data.get("amount", 0)

        if not reservation_id:
            return Response({"error": "Thiếu reservation_id"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            reservation = Reservation.objects.select_for_update().get(id=reservation_id, active=True)
        except Reservation.DoesNotExist:
            return Response({"error": "Reservation không tồn tại"}, status=status.HTTP_404_NOT_FOUND)

        payment = Payment.objects.create(
            reservation=reservation,
            amount=amount,
            payment_method=payment_method,
            status='pending'
        )

        if payment_method == 'cash':
            # ✅ FIX: Cập nhật trạng thái và ghế cho thanh toán tiền mặt
            reservation.status = 'confirmed'
            reservation.save(update_fields=['status'])
            seat_ids = reservation.details.values_list("seat_id", flat=True)
            Seat.objects.filter(id__in=seat_ids).update(status="reserved")

        serializer = PaymentSerializer(payment)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(methods=["post"], detail=False, url_path="confirm-momo")
    def confirm_momo(self, request):
        """
        Nhận callback từ frontend sau khi MoMo redirect
        """
        order_id = request.data.get("orderId")
        result_code = request.data.get("resultCode")

        try:
            payment = Payment.objects.get(order_code=order_id)  # hoặc map theo reservation
            if result_code == "0":
                payment.status = "paid"
                payment.reservation.status = "confirmed"
                payment.reservation.save()
                seat_ids = payment.reservation.details.values_list("seat_id", flat=True)
                Seat.objects.filter(id__in=seat_ids).update(status="reserved")
                payment.save()
                return Response({"message": "success", "reservation_id": payment.reservation.id})
            else:
                payment.status = "failed"
                payment.save()
                return Response({"message": "failed"}, status=400)
        except Payment.DoesNotExist:
            return Response({"error": "Không tìm thấy payment"}, status=404)


# -------------------------
# MoMo sandbox (demo)
# -------------------------

# MoMo SANDBOX CONFIG (demo công khai)
MOMO_ENDPOINT = "https://test-payment.momo.vn/gw_payment/transactionProcessor"
MOMO_PARTNER_CODE = "MOMO"
MOMO_ACCESS_KEY = "F8BBA842ECF85"
MOMO_SECRET_KEY = "K951B6PE1waDMi640xX08PD3vg6EkVlz"
MOMO_RETURN_URL = "http://localhost:3000/payment_return"
MOMO_NOTIFY_URL = "http://localhost:8000/api/momo/ipn/"


@csrf_exempt
def momo_payment(request):
    """
    FE gọi để lấy payUrl. FE đang gửi: { orderId: "ORDER_<reservationId>_<ts>", amount }
    Tại đây ta:
      - Parse reservationId từ orderId
      - Tạo/ghi nhận Payment(method=momo, pending) nếu chưa có
      - Gọi MoMo để lấy payUrl
    """
    if request.method != "POST":
        return JsonResponse({"error": "Invalid request"}, status=400)

    data = json.loads(request.body)
    order_id = data.get("orderId")
    amount = str(data.get("amount", "0"))

    if not order_id or amount == "0":
        return JsonResponse({"error": "Thiếu orderId/amount"}, status=400)

    # Parse reservationId từ orderId = ORDER_<id>_<ts>
    try:
        parts = order_id.split("_")
        reservation_id = int(parts[1])
    except Exception:
        return JsonResponse({"error": "orderId không hợp lệ"}, status=400)

    # Đảm bảo có payment record pending cho momo
    with transaction.atomic():
        try:
            reservation = Reservation.objects.select_for_update().get(id=reservation_id, active=True)
        except Reservation.DoesNotExist:
            return JsonResponse({"error": "Reservation không tồn tại"}, status=404)

        payment, created = Payment.objects.get_or_create(
            reservation=reservation,
            payment_method='momo',
            defaults=dict(amount=amount, status='pending', transaction_id=order_id)
        )
        if not created:
            # cập nhật lại amount/transaction_id
            payment.amount = amount
            payment.transaction_id = order_id
            payment.status = 'pending'
            payment.save(update_fields=['amount', 'transaction_id', 'status'])

    order_info = "Thanh toán vé xe khách"
    request_id = order_id
    extra_data = ""  # có thể truyền thêm, demo để trống

    raw_signature = (
        f"partnerCode={MOMO_PARTNER_CODE}"
        f"&accessKey={MOMO_ACCESS_KEY}"
        f"&requestId={request_id}"
        f"&amount={amount}"
        f"&orderId={order_id}"
        f"&orderInfo={order_info}"
        f"&returnUrl={MOMO_RETURN_URL}"
        f"&notifyUrl={MOMO_NOTIFY_URL}"
        f"&extraData={extra_data}"
    )
    signature = hmac.new(
        MOMO_SECRET_KEY.encode(),
        raw_signature.encode(),
        hashlib.sha256
    ).hexdigest()

    payload = {
        "partnerCode": MOMO_PARTNER_CODE,
        "accessKey": MOMO_ACCESS_KEY,
        "requestId": request_id,
        "amount": amount,
        "orderId": order_id,
        "orderInfo": order_info,
        "returnUrl": MOMO_RETURN_URL,
        "notifyUrl": MOMO_NOTIFY_URL,
        "extraData": extra_data,
        "requestType": "captureMoMoWallet",
        "signature": signature,
    }

    res = requests.post(MOMO_ENDPOINT, json=payload, headers={"Content-Type": "application/json"})
    return JsonResponse(res.json())


@csrf_exempt
def momo_ipn(request):
    if request.method != "POST":
        return JsonResponse({"error": "Invalid request"}, status=400)

    data = json.loads(request.body or "{}")
    order_id = data.get("orderId")
    error_code = str(data.get("errorCode"))
    trans_id = data.get("transId")

    if not order_id:
        return JsonResponse({"message": "Missing orderId"}, status=200)

    try:
        parts = order_id.split("_")
        reservation_id = int(parts[1])
    except Exception:
        return JsonResponse({"message": "Bad orderId"}, status=200)

    with transaction.atomic():
        try:
            payment = Payment.objects.select_for_update().get(
                transaction_id=order_id,
                reservation_id=reservation_id,
                payment_method='momo'
            )
        except Payment.DoesNotExist:
            return JsonResponse({"message": "Payment not found"}, status=200)

        reservation = payment.reservation
        seat_ids = json.loads(reservation.note or "[]")

        if error_code == "0":
            # ✅ Thanh toán thành công → tạo detail + giữ ghế
            payment.status = 'paid'
            payment.momo_request_id = str(trans_id) if trans_id else payment.momo_request_id
            payment.save(update_fields=['status', 'momo_request_id'])

            for sid in seat_ids:
                ReservationDetail.objects.create(
                    reservation=reservation,
                    seat_id=sid,
                    passenger_name=reservation.contact_name,
                    passenger_phone=reservation.contact_phone,
                    passenger_email="",
                )
            Seat.objects.filter(id__in=seat_ids).update(status="reserved")
            reservation.status = 'confirmed'
            reservation.save(update_fields=['status'])

        else:
            # ❌ Thanh toán thất bại → xóa reservation để giải phóng
            payment.status = 'failed'
            payment.save(update_fields=['status'])
            reservation.delete()  # cascade xóa luôn ReservationDetail nếu có

    return JsonResponse({"message": "IPN processed"})

# -------------------------
# Promotion
# -------------------------
class PromotionViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Promotion.objects.filter(active=True)
    serializer_class = PromotionSerializer

    def get_permissions(self):
        return [IsAuthenticated()]

    @action(methods=['get'], url_path='check/(?P<code>[^/.]+)', detail=False)
    def check_code(self, request, code=None):
        promotion = Promotion.objects.filter(code=code).first()
        if not promotion:
            return Response({"valid": False}, status=status.HTTP_404_NOT_FOUND)
        return Response(
            {"valid": True, "discount_type": promotion.discount_type, "discount_value": promotion.discount_value})


class PromotionUsageViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = PromotionUsage.objects.filter(active=True)
    serializer_class = PromotionUsageSerializer
    permission_classes = [IsAuthenticated]


class DriverViewSet(viewsets.ModelViewSet):
    queryset = Driver.objects.filter(active=True)
    serializer_class = DriverSerializer

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAuthenticated(), AdminCompanyPermission()]
        return [IsAuthenticated()]


class DriverAssignmentViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = DriverAssignment.objects.filter(active=True)
    serializer_class = DriverAssignmentSerializer
    permission_classes = [IsAuthenticated]


# -------------------------
# Review
# -------------------------
class ReviewViewSet(viewsets.ModelViewSet):
    queryset = Review.objects.filter(active=True)
    serializer_class = ReviewSerializer

    def get_permissions(self):
        if self.action in ['create']:
            return [IsAuthenticated(), PassengerPermission()]
        return [IsAuthenticated()]


# -------------------------
# Notification
# -------------------------
class NotificationViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Notification.objects.filter(active=True)
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]

    @action(methods=['put'], url_path='mark-read/(?P<id>[^/.]+)', detail=False)
    def mark_read(self, request, id=None):
        notif = Notification.objects.filter(id=id, user=request.user).first()
        if not notif:
            return Response({"message": "Không tìm thấy thông báo."}, status=status.HTTP_404_NOT_FOUND)
        notif.is_read = True
        notif.save(update_fields=['is_read'])
        return Response({"message": "Đã đánh dấu đã đọc."})


# -------------------------
# GPS
# -------------------------
class GPSPointViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = GPSPoint.objects.filter(active=True)
    serializer_class = GPSPointSerializer
    permission_classes = [IsAuthenticated]

    @action(methods=['get'], url_path='live', detail=False)
    def live_points(self, request):
        # Giả lập lấy GPS theo thời gian thực
        points = GPSPoint.objects.filter(bus__active=True).order_by('-recorded_at')[:100]
        serializer = GPSPointSerializer(points, many=True)
        return Response(serializer.data)


# -------------------------
# Agent & Sales
# -------------------------
class AgentViewSet(viewsets.ModelViewSet):
    queryset = Agent.objects.filter(active=True)
    serializer_class = AgentSerializer

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAuthenticated(), AdminPermission()]
        return [IsAuthenticated()]


class AgentSaleViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = AgentSale.objects.filter(active=True)
    serializer_class = AgentSaleSerializer
    permission_classes = [IsAuthenticated]


# -------------------------
# Chat
# -------------------------
class ChatMessageViewSet(viewsets.ModelViewSet):
    queryset = ChatMessage.objects.filter(active=True)
    serializer_class = ChatMessageSerializer
    permission_classes = [IsAuthenticated]

    @action(methods=['post'], url_path='send-message', detail=False)
    def send_message(self, request):
        sender = request.user
        receiver_id = request.data.get('receiver_id')
        message = request.data.get('message')
        receiver = User.objects.filter(id=receiver_id).first()
        if not receiver:
            return Response({"message": "Người nhận không tồn tại."}, status=status.HTTP_400_BAD_REQUEST)
        chat = ChatMessage.objects.create(sender=sender, receiver=receiver, message=message)
        return Response({"message": "Đã gửi tin nhắn."}, status=status.HTTP_201_CREATED)

    @action(methods=['post'], url_path='ai-suggest', detail=False)
    def ai_suggest(self, request):
        # Placeholder cho AI gợi ý chuyến đi
        return Response({"suggestions": []})
