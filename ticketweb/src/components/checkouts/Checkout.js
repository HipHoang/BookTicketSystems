// src/components/checkouts/Checkout.js
import React, { useContext, useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { MyUserContext } from "../../configs/MyContexts";
import api, { authApis, endpoints } from "../../configs/Apis";
import { Button, Card, Form } from "react-bootstrap";

const Checkout = () => {
  const user = useContext(MyUserContext);
  const location = useLocation();
  const navigate = useNavigate();

  const [schedule, setSchedule] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);

  const [passengerName, setPassengerName] = useState(
    user ? `${user.last_name} ${user.first_name}` : ""
  );
  const [passengerPhone, setPassengerPhone] = useState(user ? user.phone : "");
  const [passengerEmail, setPassengerEmail] = useState(user ? user.email : "");
  const [paymentMethod, setPaymentMethod] = useState("cash"); // mặc định tiền mặt
  const [loading, setLoading] = useState(false);

  // 🔹 Khôi phục dữ liệu từ location.state hoặc sessionStorage
  useEffect(() => {
    if (location.state?.schedule && location.state?.selectedSeats) {
      setSchedule(location.state.schedule);
      setSelectedSeats(location.state.selectedSeats);
      sessionStorage.setItem("checkout_data", JSON.stringify(location.state));
    } else {
      const saved = sessionStorage.getItem("checkout_data");
      if (saved) {
        const parsed = JSON.parse(saved);
        setSchedule(parsed.schedule);
        setSelectedSeats(parsed.selectedSeats);
      }
    }
  }, [location.state]);

  if (!schedule) return <p>Không có dữ liệu đặt vé!</p>;

  const totalAmount = (schedule?.price || 0) * selectedSeats.length;

  // -----------------
  // API: tạo reservation
  // -----------------
  const createReservation = async () => {
    const res = await authApis().post(endpoints["reservation_add"], {
      schedule_id: schedule.id,
      seat_ids: selectedSeats.map((s) => s.id),
      contact_name: passengerName,
      contact_phone: passengerPhone,
      contact_email: passengerEmail,
      total_amount: totalAmount,
      note: "Đặt vé qua hệ thống",
    });
    return res.data;
  };

  // -----------------
  // Thanh toán MoMo
  // -----------------
  const handleMoMoPayment = async (reservation) => {
    try {
      let res = await authApis().post("/momo/payment/", {
        orderId: `ORDER_${reservation.id}_${new Date().getTime()}`,
        amount: totalAmount,
      });

      if (res.data && res.data.payUrl) {
        sessionStorage.removeItem("checkout_data");
        window.location.href = res.data.payUrl;
      } else {
        alert("Không lấy được link thanh toán MoMo!");
      }
    } catch (err) {
      console.error("MoMo error:", err);
      alert("Lỗi khi gọi MoMo!");
    }
  };

  // -----------------
// Xác nhận đặt vé
// -----------------
const handleConfirmBooking = async () => {
  if (!user && (!passengerName || !passengerPhone || !passengerEmail)) {
    alert("Vui lòng nhập đầy đủ tên, số điện thoại và email!");
    return;
  }

  try {
    setLoading(true);
    const reservation = await createReservation();

    if (paymentMethod === "momo") {
      await handleMoMoPayment(reservation);
      return;
    }

    // 🔹 Nếu có user => gọi authApis (có token)
    // 🔹 Nếu guest => gọi api (không token)
    if (user) {
      await authApis().post(endpoints["payments"], {
        reservation_id: reservation.id,
        amount: parseFloat(totalAmount),
        payment_method: "cash",
      });
    } else {
      await api.post(endpoints["payments"], {
        reservation_id: reservation.id,
        amount: parseFloat(totalAmount),
        payment_method: "cash",
      });
    }
    sessionStorage.removeItem("checkout_data");
    navigate(`/reservations/code/${reservation.booking_code}`);

  } catch (err) {
    console.error("Booking error:", err);
    //setErr("Tên đăng nhập hoặc mật khẩu không chính xác!");
  } finally {
    setLoading(false);
  }
};


  // Label ghế
  const getSeatLabel = (seatNumber) => {
    if (seatNumber >= 1 && seatNumber <= 21) return `A${seatNumber}`;
    if (seatNumber >= 22 && seatNumber <= 43) return `B${seatNumber - 21}`;
    return seatNumber;
  };

  return (
    <div className="container mt-4">
      <Card className="p-4 shadow rounded-3">
        <h2 className="mb-3">Xác nhận đặt vé</h2>

        <div className="mb-3">
          <strong>Tuyến:</strong> {schedule.route.start_location} →{" "}
          {schedule.route.end_location} <br />
          <strong>Khởi hành:</strong>{" "}
          {new Date(schedule.departure_time).toLocaleString()} <br />
          <strong>Xe:</strong> {schedule.bus.license_plate} (
          {schedule.bus.capacity} ghế)
        </div>

        <div className="mb-3">
          <strong>Ghế đã chọn:</strong>{" "}
          {selectedSeats.map((s) => getSeatLabel(s.seat_number)).join(", ")}
        </div>

        <div className="mb-3">
          <strong>Tổng tiền:</strong>{" "}
          <span className="text-danger fw-bold" style={{ fontSize: "1.3rem" }}>
            {totalAmount.toLocaleString("vi-VN")} đ
          </span>
        </div>

        {/* Nếu chưa login thì hiển thị form nhập thông tin */}
        {!user ? (
          <>
            <div className="alert alert-info">
              Bạn chưa đăng nhập.{" "}
              <Link to={`/login?next=/checkout`}>Đăng nhập</Link> để tự động
              điền thông tin.
            </div>
            <Form.Group className="mb-3">
              <Form.Label>
                Tên hành khách <span style={{ color: "red" }}>*</span>
              </Form.Label>
              <Form.Control
                type="text"
                value={passengerName}
                onChange={(e) => setPassengerName(e.target.value)}
                placeholder="Nhập tên hành khách"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>
                Số điện thoại <span style={{ color: "red" }}>*</span>
              </Form.Label>
              <Form.Control
                type="text"
                value={passengerPhone}
                onChange={(e) => setPassengerPhone(e.target.value)}
                placeholder="Nhập số điện thoại"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>
                Email <span style={{ color: "red" }}>*</span>
              </Form.Label>
              <Form.Control
                type="email"
                value={passengerEmail}
                onChange={(e) => setPassengerEmail(e.target.value)}
                placeholder="Nhập email"
              />
            </Form.Group>
          </>
        ) : (
          <div className="mb-3">
            <strong>Khách hàng:</strong> {user.last_name} {user.first_name} (
            {user.phone})
          </div>
        )}

        {/* Chọn phương thức thanh toán */}
        <Form.Group className="mb-3">
          <Form.Label>Phương thức thanh toán</Form.Label>
          <div>
            <Form.Check
              type="radio"
              id="payment_cash"
              name="paymentMethod"
              value="cash"
              label="Thanh toán khi lên xe"
              checked={paymentMethod === "cash"}
              onChange={(e) => setPaymentMethod(e.target.value)}
            />
            <Form.Check
              type="radio"
              id="payment_momo"
              name="paymentMethod"
              value="momo"
              label="Thanh toán qua MoMo"
              checked={paymentMethod === "momo"}
              onChange={(e) => setPaymentMethod(e.target.value)}
            />
          </div>
        </Form.Group>

        <Button
          variant="success"
          disabled={loading}
          onClick={handleConfirmBooking}
          style={{
            fontWeight: "bold",
            fontSize: "1.1rem",
            padding: "8px 32px",
          }}
        >
          {loading ? "Đang xử lý..." : "Xác nhận đặt vé"}
        </Button>
      </Card>
    </div>
  );
};

export default Checkout;
