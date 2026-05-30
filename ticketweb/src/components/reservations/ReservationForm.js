// import { useLocation, useNavigate } from "react-router-dom";
// import { useState } from "react";
// import api, { endpoints } from "../../configs/Apis";
// import { Card, Button, Form } from "react-bootstrap";

// const ReservationForm = () => {
//   const { state } = useLocation();
//   const navigate = useNavigate();

//   const { schedule, selectedSeats } = state || {};
//   const [passengerInfo, setPassengerInfo] = useState({
//     name: "",
//     phone: "",
//     email: ""
//   });

//   if (!schedule || !selectedSeats) {
//     return <p>Vui lòng chọn chuyến và ghế trước.</p>;
//   }

//   const totalPrice = selectedSeats.length * schedule.price;

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setPassengerInfo({ ...passengerInfo, [name]: value });
//   };

//   const handlePayment = async () => {
//     try {
//       // Gọi API tạo Reservation
//       let res = await api.post(endpoints.reservations, {
//         schedule: schedule.id,
//         seats: selectedSeats.map((s) => s.id),
//         passenger_name: passengerInfo.name,
//         passenger_phone: passengerInfo.phone,
//         total_amount: totalPrice,
//       });

//       alert("Đặt vé thành công!");
//       navigate(`/reservations/${res.data.id}`);
//     } catch (err) {
//       console.error("Lỗi khi tạo reservation:", err);
//       alert("Đặt vé thất bại!");
//     }
//   };

//   return (
//     <Card className="mt-4">
//       <Card.Body>
//         <h3>Xác nhận đặt vé</h3>
//         <p>
//           <strong>Tuyến:</strong> {schedule.route.start_location} → {schedule.route.end_location}
//         </p>
//         <p>
//           <strong>Xe:</strong> {schedule.bus.license_plate}
//         </p>
//         <p>
//           <strong>Ghế đã chọn:</strong> {selectedSeats.map((s) => s.seat_number).join(", ")}
//         </p>
//         <p>
//           <strong>Tổng tiền:</strong> {totalPrice} VND
//         </p>

//         <Form>
//           <Form.Group className="mb-3">
//             <Form.Label>Họ tên hành khách</Form.Label>
//             <Form.Control type="text" name="name" value={passengerInfo.name} onChange={handleChange} />
//           </Form.Group>
//           <Form.Group className="mb-3">
//             <Form.Label>Số điện thoại</Form.Label>
//             <Form.Control type="text" name="phone" value={passengerInfo.phone} onChange={handleChange} />
//           </Form.Group>
//           <Form.Group className="mb-3">
//             <Form.Label>Email</Form.Label>
//             <Form.Control type="email" name="email" value={passengerInfo.email} onChange={handleChange} />
//           </Form.Group>
//         </Form>

//         <Button variant="success" onClick={handlePayment}>
//           Thanh toán
//         </Button>
//       </Card.Body>
//     </Card>
//   );
// };

// export default ReservationForm;
