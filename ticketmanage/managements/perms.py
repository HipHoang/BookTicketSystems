from rest_framework import permissions

class OwnerPermission(permissions.IsAuthenticated):
    def has_object_permission(self, request, view, obj):
        # Nếu object là chính user
        if isinstance(obj, request.user.__class__):
            return obj == request.user
        # Nếu object có thuộc tính user
        return hasattr(obj, 'user') and obj.user == request.user

class AdminOrCoachPermission(permissions.BasePermission):
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.role in [0, 3]

class AdminPermission(permissions.BasePermission):
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.role == 0

class PassengerPermission(permissions.BasePermission):
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.role == 1

class CompanyPermission(permissions.BasePermission):
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.role == 2

class AgentPermission(permissions.BasePermission):
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.role == 3