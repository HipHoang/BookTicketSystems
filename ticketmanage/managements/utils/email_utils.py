# managements/utils/email_utils.py
import qrcode
import io
from django.core.mail import EmailMessage
from django.conf import settings

def send_ticket_email(reservation_detail):
    """Gửi email vé xe kèm mã QR"""
    passenger_email = reservation_detail.passenger_email
    if not passenger_email:
        return

    # Nội dung email
    subject = "Vé xe khách của bạn"
    body = f"""
    Xin chào {reservation_detail.passenger_name},

    Bạn đã đặt vé thành công!
    Mã đặt chỗ: {reservation_detail.reservation.booking_code}
    Tuyến: {reservation_detail.reservation.schedule.route.start_location} → {reservation_detail.reservation.schedule.route.end_location}
    Giờ khởi hành: {reservation_detail.reservation.schedule.departure_time}
    Ghế: {reservation_detail.seat.seat_number}
    Tổng tiền: {reservation_detail.reservation.total_amount} VND

    Vui lòng có mặt trước giờ khởi hành ít nhất 15 phút.
    """

    # Tạo QR code từ booking_code
    qr = qrcode.make(reservation_detail.reservation.booking_code)
    buf = io.BytesIO()
    qr.save(buf, format="PNG")
    buf.seek(0)

    # Gửi email
    email = EmailMessage(subject, body, settings.DEFAULT_FROM_EMAIL, [passenger_email])
    email.attach("ticket_qr.png", buf.getvalue(), "image/png")
    email.send(fail_silently=True)
