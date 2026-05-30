from django.core.management.base import BaseCommand
from managements.models import Schedule, Seat

class Command(BaseCommand):
    help = "Tạo dữ liệu ghế cho các Schedule chưa có ghế"

    def handle(self, *args, **kwargs):
        schedules = Schedule.objects.all()
        count = 0

        for schedule in schedules:
            if not schedule.seats.exists():  # nếu chưa có ghế
                capacity = schedule.bus.capacity or 42  # fallback mặc định
                seats = [
                    Seat(schedule=schedule, seat_number=i, status="available")
                    for i in range(1, capacity + 1)
                ]
                Seat.objects.bulk_create(seats)
                count += 1
                self.stdout.write(
                    self.style.SUCCESS(f"✅ Tạo {capacity} ghế cho Schedule {schedule.id}")
                )
            else:
                self.stdout.write(
                    self.style.WARNING(f"⚠ Schedule {schedule.id} đã có ghế, bỏ qua.")
                )

        self.stdout.write(
            self.style.SUCCESS(f"🎉 Hoàn tất! Đã seed ghế cho {count} schedule mới.")
        )
