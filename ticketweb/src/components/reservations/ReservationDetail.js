// src/components/reservations/ReservationDetail.js
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, Spinner } from "react-bootstrap";
import api, { endpoints } from "../../configs/Apis";
import { QRCodeCanvas } from "qrcode.react";
import { FaTicketAlt, FaBus,FaChair, FaMoneyBillWave, FaArrowRight, FaUser, FaPhone, FaEnvelope, FaHashtag } from "react-icons/fa";

const ReservationDetail = () => {
  const { code } = useParams();
  const [reservation, setReservation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadReservation = async () => {
      try {
        let res = await api.get(endpoints["reservation_by_code"](code));
        setReservation(res.data);
      } catch (err) {
        console.error("Lỗi khi load chi tiết vé:", err);
        setReservation(null);
      } finally {
        setLoading(false);
      }
    };
    loadReservation();
  }, [code]);

  if (loading)
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" variant="primary" />
        <p>Đang tải thông tin vé...</p>
      </div>
    );

  if (!reservation)
    return (
      <div className="text-center mt-5">
        <p className="text-danger">Không tìm thấy thông tin vé!</p>
        <Link to="/" className="btn btn-secondary">
          Quay lại Trang chủ
        </Link>
      </div>
    );

  const schedule = reservation.schedule;
  const seats = reservation.details || [];

  const getSeatLabel = (seatNumber) => {
    if (seatNumber >= 1 && seatNumber <= 21) return `A${seatNumber}`;
    if (seatNumber >= 22 && seatNumber <= 43) return `B${seatNumber - 21}`;
    return seatNumber;
  };

  // 👉 Xác định thông tin người đặt
  const customerName = reservation.user
    ? `${reservation.user.last_name} ${reservation.user.first_name}`
    : reservation.contact_name;

  const customerPhone = reservation.user
    ? reservation.user.phone
    : reservation.contact_phone;

  const customerEmail = reservation.user
    ? reservation.user.email
    : (reservation.details?.[0]?.passenger_email || "");

  return (
    <div className="container mt-5">
      <Card className="p-4 shadow-lg rounded-4 border-0" style={{ background: "#f8fafc" }}>
        {/* Header */}
        <div className="d-flex align-items-center mb-4 justify-content-center">
          <FaTicketAlt size={40} className="text-success me-3" />
          <h2 className="mb-0 text-success fw-bold">Đặt vé thành công!</h2>
        </div>

        <div className="row g-4">
          {/* Thông tin chuyến đi */}
          <div className="col-md-6">
            <h5 className="fw-bold mb-3 text-dark">🚌 Thông tin chuyến đi</h5>
            <div className="bg-white rounded-3 p-3 shadow-sm border mb-3">
              <p className="mb-2">
                <FaArrowRight className="me-2 text-primary" />
                <strong>Tuyến:</strong> {schedule.route.start_location} → {schedule.route.end_location}
              </p>
              <p className="mb-2">
                <strong>Khởi hành:</strong> {new Date(schedule.departure_time).toLocaleString()}
              </p>
              <p className="mb-2">
                <FaBus className="me-2 text-success" />
                <strong>Xe:</strong> {schedule.bus.license_plate} ({schedule.bus.capacity} ghế)
              </p>
              <p className="mb-0">
                <strong>Trạng thái:</strong>{" "}
                <span className="badge bg-info">{reservation.status}</span>
              </p>
            </div>

            <div className="bg-white rounded-3 p-3 shadow-sm border">
              <h6 className="fw-bold mb-2">
                <FaChair className="me-2 text-warning" /> Ghế đã chọn:
              </h6>
              <div className="d-flex flex-wrap gap-2">
                {seats.length === 0 ? (
                  <span className="text-muted">Chưa chọn ghế</span>
                ) : (
                  seats
                    .sort((a, b) => a.seat.seat_number - b.seat.seat_number)
                    .map((s) => (
                      <span
                        key={s.seat.id}
                        className="px-3 py-2 rounded-pill border border-primary bg-light text-primary fw-bold"
                        style={{ minWidth: 48, textAlign: "center" }}
                      >
                        {getSeatLabel(Number(s.seat.seat_number))}
                      </span>
                    ))
                )}
              </div>
            </div>
          </div>

          {/* Thông tin khách hàng + QR */}
          <div className="col-md-6">
            <h5 className="fw-bold mb-3 text-dark">👤 Thông tin khách hàng</h5>
            <div className="bg-white rounded-3 p-3 shadow-sm border mb-3">
              <p className="mb-2">
                <FaUser className="me-2 text-primary" />
                <strong>Họ tên:</strong> {customerName}
              </p>
              <p className="mb-2">
                <FaPhone className="me-2 text-success" />
                <strong>SĐT:</strong> {customerPhone}
              </p>
              {customerEmail && (
                <p className="mb-2">
                  <FaEnvelope className="me-2 text-danger" />
                  <strong>Email:</strong> {customerEmail}
                </p>
              )}
              <p className="mb-0">
                <FaHashtag className="me-2 text-warning" />
                <strong>Mã vé:</strong>{" "}
                <span className="badge bg-dark">{reservation.booking_code}</span>
              </p>
            </div>

            <div className="text-center bg-white rounded-3 p-3 shadow-sm border">
              <div className="bg-white border border-danger rounded-3 p-3 d-inline-block shadow-sm">
            <h6 className="mb-1 text-danger">
              <FaMoneyBillWave className="me-2" />
              Tổng tiền
            </h6>
            <span className="text-danger fw-bold fs-3">
              {parseFloat(reservation.total_amount).toLocaleString("vi-VN")} đ
            </span>
          </div>
            </div>
          </div>
        </div>

        {/* Tổng tiền */}
        <div className="text-center mt-4">
          
          <p className="fw-semibold mb-2">📲 Quét mã QR khi lên xe</p>
              <QRCodeCanvas value={reservation.booking_code} size={150} />
        </div>

        {/* Nút */}
        <div className="text-center mt-4">
          <Link to="/" className="btn btn-primary px-4 rounded-pill fw-bold shadow">
            Về Trang chủ
          </Link>
        </div>
      </Card>
    </div>
  );
};

export default ReservationDetail;
