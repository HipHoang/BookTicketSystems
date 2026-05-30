// src/components/checkouts/PaymentReturn.js
import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { authApis } from "../../configs/Apis";
import { Spinner } from "react-bootstrap";

const PaymentReturn = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [statusMsg, setStatusMsg] = useState("Đang xử lý kết quả thanh toán...");

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const resultCode = query.get("resultCode");
    const orderId = query.get("orderId");
    const amount = query.get("amount");

    const confirmPayment = async () => {
      try {
        // gọi API confirm backend
        let res = await authApis().post("/payments/confirm-momo/", {
          orderId,
          resultCode,
          amount,
        });

        if (resultCode === "0") {
          setStatusMsg("✅ Thanh toán thành công! Đang chuyển hướng...");
          setTimeout(() => {
            // Backend nên trả về reservationId, ở đây ví dụ res.data.reservation_id
            navigate(`/reservation/${res.data.reservation_id}`);
          }, 2000);
        } else {
          setStatusMsg("❌ Thanh toán thất bại hoặc bị hủy!");
        }
      } catch (err) {
        console.error("Payment return error:", err);
        setStatusMsg("Có lỗi khi xác nhận thanh toán!");
      }
    };

    confirmPayment();
  }, [location, navigate]);

  return (
    <div className="container mt-5 text-center">
      <Spinner animation="border" className="mb-3" />
      <h4>{statusMsg}</h4>
    </div>
  );
};

export default PaymentReturn;
