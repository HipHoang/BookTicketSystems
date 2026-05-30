# managements/signals.py
from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Schedule, Seat

@receiver(post_save, sender=Schedule)
def create_seats_for_schedule(sender, instance, created, **kwargs):
    if created:
        bus_capacity = instance.bus.capacity
        seats = [
            Seat(schedule=instance, seat_number=i)
            for i in range(1, bus_capacity + 1)
        ]
        Seat.objects.bulk_create(seats)
