from django.contrib.auth.hashers import make_password
from django.db import models
from django.contrib.auth.models import AbstractUser
from ckeditor.fields import RichTextField
from cloudinary.models import CloudinaryField
from enum import IntEnum
from django.utils import timezone

class BaseModel(models.Model):
    created_date = models.DateField(auto_now_add=True, null=True)
    updated_date = models.DateField(auto_now=True, null=True)
    active = models.BooleanField(default=True)

    class Meta:
        abstract = True
        ordering = ['-id']

class Role(IntEnum):
    Admin = 0
    Passenger = 1
    Company = 2
    Agent = 3

    @classmethod
    def choices(cls):
        return [(role.value, role.name.capitalize()) for role in cls]

class User(AbstractUser):
    avatar = CloudinaryField('avatar', null=True, blank=True, folder='avatar', default='')
    email = models.EmailField(unique=True, null=False, max_length=255)
    role = models.IntegerField(choices=Role.choices(), default=Role.Passenger.value)
    phone = models.CharField(max_length=30, unique=True, null=True, blank=True)
    gender = models.CharField(max_length=10, choices=(
        ('male', 'Male'),
        ('female', 'Female'),
        ('other', 'Other')
    ), null=True, blank=True)

    def save(self, *args, **kwargs):
        if not self.password.startswith('pbkdf2_'):
            self.password = make_password(self.password)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.username


# -------------------------
# Company (Nhà xe)
# -------------------------
class Company(BaseModel):
    name = models.CharField(max_length=200)
    address = models.CharField(max_length=300, null=True, blank=True)
    phone = models.CharField(max_length=30, null=True, blank=True)
    email = models.EmailField(null=True, blank=True)
    description = RichTextField(blank=True, null=True)
    image = CloudinaryField('company_image', null=True, blank=True, folder='company', default='')
    def __str__(self):
        return self.name

class Bus(BaseModel):
    STATUS_CHOICES = (
        ('active', 'Active'),
        ('maintenance', 'Maintenance'),
        ('retired', 'Retired'),
    )

    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='buses')
    license_plate = models.CharField(max_length=50, unique=True)
    capacity = models.PositiveSmallIntegerField(default=45)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    image = CloudinaryField('bus_image', null=True, blank=True, folder='bus', default='')

    def __str__(self):
        return f"{self.license_plate} ({self.capacity} seats)"

class Route(BaseModel):
    start_location = models.CharField(max_length=200)
    end_location = models.CharField(max_length=200)
    distance_km = models.DecimalField(max_digits=7, decimal_places=2, null=True, blank=True)
    estimated_time_minutes = models.IntegerField(null=True, blank=True)

    def __str__(self):
        return f"{self.start_location} → {self.end_location}"

class Stop(BaseModel):
    route = models.ForeignKey(Route, on_delete=models.SET_NULL, null=True, blank=True, related_name='stops')
    name = models.CharField(max_length=200)
    address = models.CharField(max_length=300, null=True, blank=True)
    order_in_route = models.PositiveSmallIntegerField(null=True, blank=True)

    class Meta:
        ordering = ['order_in_route']

    def __str__(self):
        return self.name


# -------------------------
# Schedule
# -------------------------
class Schedule(BaseModel):
    STATUS_CHOICES = (
        ('scheduled', 'Scheduled'),
        ('cancelled', 'Cancelled'),
        ('completed', 'Completed'),
        ('delayed', 'Delayed'),
    )

    bus = models.ForeignKey(Bus, on_delete=models.RESTRICT, related_name='schedules')
    route = models.ForeignKey(Route, on_delete=models.RESTRICT, related_name='schedules')
    departure_time = models.DateTimeField()
    arrival_time = models.DateTimeField()
    price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='scheduled')

    def __str__(self):
        return f"{self.route} @ {self.departure_time}"


# -------------------------
# Seat
# -------------------------
class Seat(BaseModel):
    STATUS_CHOICES = (
        ('available', 'Available'),
        ('reserved', 'Reserved'),
        ('sold', 'Sold'),
    )

    schedule = models.ForeignKey(Schedule, on_delete=models.CASCADE, related_name='seats')
    seat_number = models.PositiveSmallIntegerField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='available')

    class Meta:
        unique_together = ('schedule', 'seat_number')
        ordering = ['seat_number']

    def __str__(self):
        return f"{self.seat_number} - {self.schedule}"


# -------------------------
# Reservation & Details
# -------------------------
class Reservation(BaseModel):
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('cancelled', 'Cancelled'),
        ('completed', 'Completed'),
    )

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reservations')
    schedule = models.ForeignKey(Schedule, on_delete=models.RESTRICT, related_name='reservations')
    booking_code = models.CharField(max_length=50, unique=True)
    booking_date = models.DateTimeField(default=timezone.now)
    total_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    note = models.CharField(max_length=500, null=True, blank=True)

    def __str__(self):
        return self.booking_code


class ReservationDetail(BaseModel):
    reservation = models.ForeignKey(Reservation, on_delete=models.CASCADE, related_name='details')
    seat = models.ForeignKey(Seat, on_delete=models.RESTRICT, related_name='reservation_details')
    passenger_name = models.CharField(max_length=200, null=True, blank=True)
    passenger_phone = models.CharField(max_length=30, null=True, blank=True)

    class Meta:
        unique_together = ('seat',)

    def __str__(self):
        return f"{self.reservation.booking_code} - {self.seat.seat_number}"


# -------------------------
# Payment
# -------------------------
class Payment(BaseModel):
    METHOD_CHOICES = (
        ('cash', 'Cash'),
        ('bank_transfer', 'Bank transfer'),
        ('momo', 'MoMo'),
        ('credit_card', 'Credit Card'),
    )
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('paid', 'Paid'),
        ('failed', 'Failed'),
        ('refunded', 'Refunded'),
    )

    reservation = models.ForeignKey(Reservation, on_delete=models.CASCADE, related_name='payments')
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    payment_method = models.CharField(max_length=30, choices=METHOD_CHOICES, default='bank_transfer')
    payment_time = models.DateTimeField(default=timezone.now)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')

    def __str__(self):
        return f"{self.reservation.booking_code} - {self.status}"


# -------------------------
# Promotion
# -------------------------
class Promotion(BaseModel):
    DISCOUNT_TYPE = (
        ('percent', 'Percent'),
        ('amount', 'Amount'),
    )

    code = models.CharField(max_length=50, unique=True)
    description = RichTextField(null=True, blank=True)
    discount_type = models.CharField(max_length=10, choices=DISCOUNT_TYPE)
    discount_value = models.DecimalField(max_digits=10, decimal_places=2)
    start_date = models.DateTimeField()
    end_date = models.DateTimeField()
    min_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    usage_limit = models.IntegerField(null=True, blank=True)

    def __str__(self):
        return self.code


class PromotionUsage(BaseModel):
    promotion = models.ForeignKey(Promotion, on_delete=models.CASCADE, related_name='usages')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='promotion_usages')
    reservation = models.ForeignKey(Reservation, on_delete=models.SET_NULL, null=True, blank=True)

    def __str__(self):
        return f"{self.user.username} used {self.promotion.code}"


# -------------------------
# Driver & Assignment
# -------------------------
class Driver(BaseModel):
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='drivers')
    full_name = models.CharField(max_length=200)
    phone = models.CharField(max_length=30, null=True, blank=True)
    license_number = models.CharField(max_length=100, null=True, blank=True)

    def __str__(self):
        return self.full_name


class DriverAssignment(BaseModel):
    ROLE_CHOICES = (
        ('driver', 'Driver'),
        ('assistant', 'Assistant'),
    )

    driver = models.ForeignKey(Driver, on_delete=models.CASCADE, related_name='assignments')
    schedule = models.ForeignKey(Schedule, on_delete=models.CASCADE, related_name='assignments')
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='driver')

    class Meta:
        unique_together = ('driver', 'schedule')

    def __str__(self):
        return f"{self.driver.full_name} - {self.role}"


# -------------------------
# Review
# -------------------------
class Review(BaseModel):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reviews')
    company = models.ForeignKey(Company, on_delete=models.SET_NULL, null=True, blank=True)
    schedule = models.ForeignKey(Schedule, on_delete=models.SET_NULL, null=True, blank=True)
    rating = models.PositiveSmallIntegerField()
    comment = RichTextField(null=True, blank=True)

    def __str__(self):
        return f"Review {self.id} - {self.rating}★"


# -------------------------
# Notification
# -------------------------
class Notification(BaseModel):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    title = models.CharField(max_length=255)
    body = RichTextField(null=True, blank=True)
    is_read = models.BooleanField(default=False)

    def __str__(self):
        return self.title


# -------------------------
# GPS Point
# -------------------------
class GPSPoint(BaseModel):
    bus = models.ForeignKey(Bus, on_delete=models.CASCADE, related_name='gps_points')
    latitude = models.DecimalField(max_digits=10, decimal_places=7)
    longitude = models.DecimalField(max_digits=10, decimal_places=7)
    recorded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.bus.license_plate} @ {self.recorded_at}"


# -------------------------
# Agent & AgentSale
# -------------------------
class Agent(BaseModel):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='agents')
    company = models.ForeignKey(Company, on_delete=models.SET_NULL, null=True, blank=True)
    name = models.CharField(max_length=200)

    def __str__(self):
        return self.name


class AgentSale(BaseModel):
    agent = models.ForeignKey(Agent, on_delete=models.CASCADE, related_name='sales')
    reservation = models.ForeignKey(Reservation, on_delete=models.CASCADE, related_name='agent_sales')
    commission = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)

    def __str__(self):
        return f"{self.agent.name} - {self.reservation.booking_code}"

class ChatMessage(BaseModel):
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_messages')
    receiver = models.ForeignKey(User, on_delete=models.CASCADE, related_name='received_messages')
    message = models.TextField()
    timestamp = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"{self.sender} -> {self.receiver}: {self.message[:30]}"