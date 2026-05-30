// // src/components/schedule/ScheduleDetail.js
// import { useEffect, useState } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import { Card, Button, Row, Col, Badge, Alert } from "react-bootstrap";
// import { authApis, endpoints } from "../../configs/Apis";
// import MySpinner from "../layout/MySpinner";

// const ScheduleDetail = () => {
//   const { id } = useParams(); // scheduleId
//   const navigate = useNavigate();

//   const [schedule, setSchedule] = useState(null);
//   const [seats, setSeats] = useState([]);
//   const [selectedSeats, setSelectedSeats] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     const loadData = async () => {
//       try {
//         setLoading(true);

//         // 1. Lấy thông tin schedule
//         let resSchedule = await authApis().get(endpoints.schedule_detail(id));
//         setSchedule(resSchedule.data);

//         // 2. Lấy danh sách seats
//         let resSeats = await authApis().get(`${endpoints.seats}?schedule=${id}`);
//         setSeats(resSeats.data.results || resSeats.data); // tuỳ backend có pagination không
//       } catch (err) {
//         console.error(err);
//         setError("Không thể tải thông tin chuyến xe!");
//       } finally {
//         setLoading(false);
//       }
//     };

//     loadData();
//   }, [id]);

//   const toggleSeat = (seat) => {
//     if (seat.status !== "available") return;

//     if (selectedSeats.includes(seat.id)) {
//       setSelectedSeats(selectedSeats.filter((s) => s !== seat.id));
//     } else {
//       setSelectedSeats([...selectedSeats, seat.id]);
//     }
//   };

//   const handleContinue = () => {
//     if (selectedSeats.length === 0) {
//       alert("Vui lòng chọn ít nhất một ghế!");
//       return;
//     }
//     // Chuyển sang Booking page, truyền schedule + seatIds
//     navigate("/reservations/add", { state: { schedule, selectedSeats } });
//   };

//   if (loading) return <MySpinner message="Đang tải thông tin chuyến xe..." />;
//   if (error) return <Alert variant="danger">{error}</Alert>;

//   return (
//     <div className="container mt-4">
//       {schedule && (
//         <Card className="mb-4">
//           <Card.Body>
//             <h4>
//               {schedule.route.start_location} → {schedule.route.end_location}
//             </h4>
//             <p>
//               🚌 {schedule.bus.license_plate} | Giá:{" "}
//               <Badge bg="success">{schedule.price} đ</Badge>
//             </p>
//             <p>
//               ⏰ {new Date(schedule.departure_time).toLocaleString()} →{" "}
//               {new Date(schedule.arrival_time).toLocaleString()}
//             </p>
//           </Card.Body>
//         </Card>
//       )}

//       <h5 className="mb-3">Chọn ghế</h5>
//       <Row xs={4} md={6} className="g-2">
//         {seats.map((seat) => {
//           let variant = "secondary";
//           if (seat.status === "available") variant = "outline-success";
//           if (selectedSeats.includes(seat.id)) variant = "warning";
//           if (seat.status === "sold" || seat.status === "reserved") variant = "danger";

//           return (
//             <Col key={seat.id}>
//               <Button
//                 variant={variant}
//                 className="w-100"
//                 onClick={() => toggleSeat(seat)}
//                 disabled={seat.status !== "available"}
//               >
//                 {seat.seat_number}
//               </Button>
//             </Col>
//           );
//         })}
//       </Row>

//       <div className="text-center mt-4">
//         <Button variant="primary" onClick={handleContinue}>
//           Tiếp tục đặt vé ({selectedSeats.length} ghế)
//         </Button>
//       </div>
//     </div>
//   );
// };

// export default ScheduleDetail;
