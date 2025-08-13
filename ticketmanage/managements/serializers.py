from rest_framework import serializers
from rest_framework.serializers import *
from managements.models import *

class UserSerializer(ModelSerializer):
    confirm_password = serializers.CharField(write_only=True, required=True)
    avatar_url = serializers.SerializerMethodField()

    def get_avatar_url(self, user):
        if user.avatar and hasattr(user.avatar, 'url'):
            return user.avatar.url
        return None

    def validate(self, attrs):
        if attrs.get('password') != attrs.get('confirm_password'):
            raise serializers.ValidationError({"password": "Mật khẩu xác nhận không khớp."})
        return attrs

    def create(self, validated_data):
        validated_data.pop('confirm_password')  # Xoá confirm_password trước khi lưu
        u = User(**validated_data)
        u.role = validated_data.get('role', 0) # mặc định
        u.set_password(validated_data['password'])  # mã hoá mật khẩu
        u.save()
        return u

    class Meta:
        model = User
        fields = ["id", "username", "password", "confirm_password", "avatar", "avatar_url", "first_name", "last_name", "email", "role"]
        extra_kwargs = {
            'password': {
                'write_only': True,
                'required': False
            }
        }

class ChangePasswordSerializer(serializers.Serializer):
    current_password = serializers.CharField(write_only=True, required=True)
    new_password = serializers.CharField(write_only=True, required=True)
    confirm_password = serializers.CharField(write_only=True, required=True)

    def validate_current_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("Mật khẩu hiện tại không đúng.")
        return value

    def validate(self, attrs):
        if attrs['new_password'] != attrs['confirm_password']:
            raise serializers.ValidationError("Mật khẩu mới và mật khẩu xác nhận không khớp.")
        return attrs

class CompanySerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()

    def get_image_url(self, obj):
        if obj.image and hasattr(obj.image, 'url'):
            return obj.image.url
        return None

    class Meta:
        model = Company
        fields = "__all__"


class BusSerializer(serializers.ModelSerializer):
    company = CompanySerializer(read_only=True)
    image_url = serializers.SerializerMethodField()

    def get_image_url(self, obj):
        if obj.image and hasattr(obj.image, 'url'):
            return obj.image.url
        return None

    class Meta:
        model = Bus
        fields = "__all__"


# -------------------------
# Route & Stop
# -------------------------
class RouteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Route
        fields = "__all__"


class StopSerializer(serializers.ModelSerializer):
    route = RouteSerializer(read_only=True)
    class Meta:
        model = Stop
        fields = "__all__"


# -------------------------
# Schedule & Seat
# -------------------------
class ScheduleSerializer(serializers.ModelSerializer):
    bus = BusSerializer(read_only=True)
    route = RouteSerializer(read_only=True)
    class Meta:
        model = Schedule
        fields = "__all__"


class SeatSerializer(serializers.ModelSerializer):
    schedule = ScheduleSerializer(read_only=True)
    class Meta:
        model = Seat
        fields = "__all__"


# -------------------------
# Reservation
# -------------------------
class ReservationDetailSerializer(serializers.ModelSerializer):
    seat = SeatSerializer(read_only=True)
    class Meta:
        model = ReservationDetail
        fields = "__all__"


class ReservationSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    schedule = ScheduleSerializer(read_only=True)
    details = ReservationDetailSerializer(many=True, read_only=True)

    class Meta:
        model = Reservation
        fields = "__all__"


# -------------------------
# Payment
# -------------------------
class PaymentSerializer(serializers.ModelSerializer):
    reservation = ReservationSerializer(read_only=True)

    class Meta:
        model = Payment
        fields = "__all__"


# -------------------------
# Promotion
# -------------------------
class PromotionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Promotion
        fields = "__all__"


class PromotionUsageSerializer(serializers.ModelSerializer):
    promotion = PromotionSerializer(read_only=True)
    user = UserSerializer(read_only=True)

    class Meta:
        model = PromotionUsage
        fields = "__all__"


# -------------------------
# Driver & Assignment
# -------------------------
class DriverSerializer(serializers.ModelSerializer):
    company = CompanySerializer(read_only=True)
    class Meta:
        model = Driver
        fields = "__all__"


class DriverAssignmentSerializer(serializers.ModelSerializer):
    driver = DriverSerializer(read_only=True)
    schedule = ScheduleSerializer(read_only=True)

    class Meta:
        model = DriverAssignment
        fields = "__all__"


# -------------------------
# Review
# -------------------------
class ReviewSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    company = CompanySerializer(read_only=True)
    schedule = ScheduleSerializer(read_only=True)

    class Meta:
        model = Review
        fields = "__all__"


# -------------------------
# Notification
# -------------------------
class NotificationSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = Notification
        fields = "__all__"


# -------------------------
# GPS
# -------------------------
class GPSPointSerializer(serializers.ModelSerializer):
    bus = BusSerializer(read_only=True)

    class Meta:
        model = GPSPoint
        fields = "__all__"


# -------------------------
# Agent & AgentSale
# -------------------------
class AgentSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    company = CompanySerializer(read_only=True)

    class Meta:
        model = Agent
        fields = "__all__"


class AgentSaleSerializer(serializers.ModelSerializer):
    agent = AgentSerializer(read_only=True)
    reservation = ReservationSerializer(read_only=True)

    class Meta:
        model = AgentSale
        fields = "__all__"


# -------------------------
# Chat Message
# -------------------------
class ChatMessageSerializer(serializers.ModelSerializer):
    sender = UserSerializer(read_only=True)
    receiver = UserSerializer(read_only=True)

    class Meta:
        model = ChatMessage
        fields = "__all__"
