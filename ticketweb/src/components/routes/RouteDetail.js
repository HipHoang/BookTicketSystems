import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api, { endpoints } from "../../configs/Apis";
import { Card, Spinner, Alert, Row, Col, Button } from "react-bootstrap";
import { FaStar, FaCircle, FaInfoCircle } from 'react-icons/fa';
import { MdOutlineAirlineSeatReclineExtra } from 'react-icons/md';
import { AiOutlineCheckCircle } from 'react-icons/ai';

const RouteDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [route, setRoute] = useState(null);
    const [schedules, setSchedules] = useState([]);
    const [loading, setLoading] = useState(true);

    const [seats, setSeats] = useState({});
    const [expandedSchedule, setExpandedSchedule] = useState(null);
    const [selectedSeats, setSelectedSeats] = useState([]);

    useEffect(() => {
        const loadRouteDetail = async () => {
            try {
                let res = await api.get(endpoints.route_detail(id));
                setRoute(res.data);

                let schRes = await api.get(endpoints.route_schedules(id));
                const fetchedSchedules = schRes.data;
                setSchedules(fetchedSchedules);

                const seatsPromises = fetchedSchedules.map(async (schedule) => {
                    try {
                        const seatRes = await api.get(`/seats/?schedule=${schedule.id}`);
                        return { scheduleId: schedule.id, data: seatRes.data.results || seatRes.data };
                    } catch (err) {
                        console.error(`Lỗi khi tải ghế cho chuyến ${schedule.id}:`, err);
                        return { scheduleId: schedule.id, data: [] };
                    }
                });

                const allSeats = await Promise.all(seatsPromises);
                const seatsMap = allSeats.reduce((acc, curr) => {
                    acc[curr.scheduleId] = curr.data;
                    return acc;
                }, {});
                setSeats(seatsMap);

            } catch (err) {
                console.error("Lỗi khi load chi tiết tuyến:", err);
            } finally {
                setLoading(false);
            }
        };

        loadRouteDetail();
    }, [id]);

    const toggleSeats = async (scheduleId) => {
        if (expandedSchedule === scheduleId) {
            setExpandedSchedule(null);
            setSelectedSeats([]);
            return;
        }

        setExpandedSchedule(scheduleId);
    };

    const handleSelectSeat = (seat) => {
        if (seat.status !== "available") return;
        if (selectedSeats.includes(seat.id)) {
            setSelectedSeats(selectedSeats.filter(seatId => seatId !== seat.id));
        } else {
            setSelectedSeats([...selectedSeats, seat.id]);
        }
    };

    const formatCurrency = (amount) => {
        // Cập nhật hàm này để định dạng theo yêu cầu
        return new Intl.NumberFormat('vi-VN').format(amount) + 'đ';
    };

    if (loading) return <Spinner animation="border" />;
    if (!route) return <Alert variant="danger">Không tìm thấy tuyến đường!</Alert>;

    return (
        <div className="container mt-4">
            <h4 className="mb-4 text-center">Các chuyến xe cho tuyến {route.start_location} → {route.end_location}</h4>
            <div className="d-flex flex-column gap-3">
                {schedules.length > 0 ? (
                    schedules.map((s) => {
                        const availableSeats = seats[s.id] ? seats[s.id].filter(seat => seat.status === 'available').length : 0;
                        return (
                            <Card key={s.id} className="shadow-sm mb-3">
                                <Card.Body className="p-3">
                                    <Row className="align-items-center g-3">
                                        <Col xs={12} md={8} className="d-flex align-items-start gap-3">
                                            <div className="d-flex flex-column gap-2" style={{ flexShrink: 0 }}>
                                                <div className="badge bg-success text-white fw-bold d-flex align-items-center gap-1" style={{ padding: '8px 12px' }}>
                                                    <AiOutlineCheckCircle size={14} /> Xác nhận tức thì
                                                </div>
                                                <img
                                                    src={s.bus?.image_url || "/bus-default.jpg"}
                                                    alt="Bus"
                                                    style={{ width: "100px", height: "auto", borderRadius: "8px", objectFit: "cover" }}
                                                    onError={(e) => { e.target.src = "/bus-default.jpg"; }}
                                                />
                                            </div>
                                            <div className="d-flex flex-column justify-content-between h-100 flex-grow-1">
                                                <div>
                                                    <div className="d-flex align-items-center gap-2 mb-1">
                                                        <span className="fw-bold text-dark" style={{ fontSize: "1.1rem" }}>{s.bus?.company?.name}</span>
                                                        <span className="badge bg-primary text-white d-flex align-items-center gap-1">
                                                            <FaStar size={12} /> {s.bus?.rating || 'N/A'}
                                                        </span>
                                                        <span className="text-secondary" style={{ fontSize: '0.8rem' }}>({s.bus?.review_count || 0})</span>
                                                    </div>
                                                    <div className="text-secondary d-flex align-items-center gap-2 mb-2">
                                                        <MdOutlineAirlineSeatReclineExtra size={18} />
                                                        <span>Ghế ngồi {s.bus?.capacity} chỗ</span>
                                                    </div>
                                                    <div className="d-flex flex-column position-relative" style={{ borderLeft: "2px dashed #ccc", paddingLeft: "1rem" }}>
                                                        <div className="d-flex align-items-center gap-2 mb-1">
                                                            <FaCircle size={10} color="#007bff" style={{ position: "absolute", left: -6 }} />
                                                            <span className="fw-bold">{new Date(s.departure_time).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</span>
                                                            <span className="text-dark">· BẾN XE {s.start_location?.toUpperCase()}</span>
                                                        </div>
                                                        <div className="text-secondary ms-4" style={{ fontSize: '0.9rem' }}>
                                                            {route.estimated_time_minutes} phút
                                                        </div>
                                                        <div className="d-flex align-items-center gap-2 mt-1">
                                                            <FaCircle size={10} color="#dc3545" style={{ position: "absolute", left: -6 }} />
                                                            <span className="fw-bold">{new Date(s.arrival_time).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</span>
                                                            <span className="text-dark">· BẾN XE {s.end_location?.toUpperCase()}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </Col>
                                        <Col xs={12} md={4} className="d-flex flex-column align-items-end text-end">
                                            <div className="fw-bold text-danger mb-2" style={{ fontSize: "1.8rem" }}>
                                                {formatCurrency(s.price)}
                                            </div>
                                            <div className="mb-2 text-success fw-bold" style={{ fontSize: '1rem' }}>
                                                {`Còn ${availableSeats} chỗ trống`}
                                            </div>
                                            <Button
                                                variant="warning"
                                                className="fw-bold text-white rounded-pill px-4 py-2"
                                                onClick={() => toggleSeats(s.id)}
                                            >
                                                Chọn chuyến
                                            </Button>
                                        </Col>
                                    </Row>
                                    <hr className="my-3" />
                                    <div className="d-flex justify-content-start gap-4">
                                        <div className="d-flex align-items-center gap-2 text-primary">
                                            <FaInfoCircle /> Trả tận nơi
                                        </div>
                                        <div className="d-flex align-items-center gap-2 text-success">
                                            <FaInfoCircle /> Theo dõi hành trình xe
                                        </div>
                                    </div>
                                    <div className="mt-2 text-info d-flex align-items-center gap-2">
                                        <FaInfoCircle />
                                        <span className="fw-bold">Thông báo:</span>
                                        <span className="text-secondary"> Vé chặng thuộc chuyến {new Date(s.departure_time).toLocaleDateString('vi-VN')} Hà Nội (Nước Ngầm)...</span>
                                    </div>
                                </Card.Body>

                                {expandedSchedule === s.id && (
                                    <Card.Footer>
                                        <Row>
                                            <Col xs={12} md={4} className="d-flex flex-column justify-content-center">
                                                <div className="fw-bold mb-3" style={{ fontSize: "1.1rem" }}>Chú thích</div>
                                                <div className="d-flex flex-column gap-3">
                                                    <div className="d-flex align-items-center gap-2">
                                                        <span className="border rounded d-flex justify-content-center align-items-center"
                                                            style={{
                                                                width: 36, height: 36, background: "#e53935", border: "2px solid #b71c1c",
                                                                boxShadow: "0 2px 8px #b71c1c44"
                                                            }}>
                                                            <span className="text-white fw-bold" style={{ fontSize: 20 }}>✗</span>
                                                        </span>
                                                        <span style={{ color: "#e53935", fontWeight: 600, fontSize: "1rem" }}>Ghế đã bán</span>
                                                    </div>
                                                    <div className="d-flex align-items-center gap-2">
                                                        <span className="border rounded d-flex justify-content-center align-items-center"
                                                            style={{
                                                                width: 36, height: 36, background: "#009688", border: "2px solid #00695c",
                                                                boxShadow: "0 2px 8px #00968844"
                                                            }}>
                                                            <span className="text-white fw-bold" style={{ fontSize: 20 }}>✓</span>
                                                        </span>
                                                        <span style={{ color: "#009688", fontWeight: 600, fontSize: "1rem" }}>Đang chọn</span>
                                                    </div>
                                                    <div className="d-flex align-items-center gap-2">
                                                        <span className="border rounded d-flex justify-content-center align-items-center"
                                                            style={{
                                                                width: 36, height: 36, background: "#fff", border: "2px solid #1976d2",
                                                                boxShadow: "0 2px 8px #1976d244"
                                                            }}>
                                                            <span style={{ fontSize: 20, color: "#1976d2" }}>▢</span>
                                                        </span>
                                                        <span style={{ color: "#1976d2", fontWeight: 600, fontSize: "1rem" }}>Còn trống</span>
                                                    </div>
                                                </div>
                                            </Col>
                                            <Col xs={12} md={8}>
                                                <Row>
                                                    <Col xs={12} md={6}>
                                                        <div className="fw-bold text-center mb-2" style={{ fontSize: "1.1rem" }}>Tầng dưới</div>
                                                        <div style={{
                                                            background: "#f8f9fa", borderRadius: "12px", padding: "18px 0", minHeight: 220,
                                                            boxShadow: "0 2px 8px #0001"
                                                        }}>
                                                            <div style={{
                                                                display: "grid", gridTemplateColumns: "repeat(3, 44px)", gap: "16px",
                                                                justifyContent: "center"
                                                            }}>
                                                                {seats[s.id] && seats[s.id]
                                                                    .filter(seat => seat.seat_number >= 1 && seat.seat_number <= 21)
                                                                    .map((seat) => {
                                                                        const isSelected = selectedSeats.includes(seat.id);
                                                                        return (
                                                                            <div
                                                                                key={seat.id}
                                                                                onClick={() => handleSelectSeat(seat)}
                                                                                style={{
                                                                                    width: 44, height: 44, borderRadius: 12,
                                                                                    backgroundColor: isSelected ? "#009688" : seat.status === "available" ? "#fff" : "#e53935",
                                                                                    color: isSelected ? "#fff" : seat.status === "available" ? "#1976d2" : "#fff",
                                                                                    fontWeight: "bold", fontSize: "1.1rem",
                                                                                    boxShadow: isSelected ? "0 2px 12px #00968888" : seat.status === "available" ? "0 2px 8px #1976d244" : "0 2px 8px #b71c1c44",
                                                                                    border: isSelected ? "2px solid #009688" : seat.status === "available" ? "2px solid #1976d2" : "2px solid #b71c1c",
                                                                                    display: "flex", flexDirection: "column", alignItems: "center",
                                                                                    justifyContent: "center", cursor: seat.status === "available" ? "pointer" : "not-allowed",
                                                                                    opacity: seat.status === "available" || isSelected ? 1 : 0.7, transition: "all 0.2s"
                                                                                }}
                                                                                title={`A${seat.seat_number}`}
                                                                            >
                                                                                <span style={{ fontSize: 20 }}>
                                                                                    {isSelected ? "✓" : seat.status === "available" ? "▢" : "✗"}
                                                                                </span>
                                                                                <span style={{ fontSize: 14, fontWeight: 600 }}>{`A${seat.seat_number}`}</span>
                                                                            </div>
                                                                        );
                                                                    })}
                                                            </div>
                                                        </div>
                                                    </Col>
                                                    <Col xs={12} md={6}>
                                                        <div className="fw-bold text-center mb-2" style={{ fontSize: "1.1rem" }}>Tầng trên</div>
                                                        <div style={{
                                                            background: "#f8f9fa", borderRadius: "12px", padding: "18px 0", minHeight: 220,
                                                            boxShadow: "0 2px 8px #0001"
                                                        }}>
                                                            <div style={{
                                                                display: "grid", gridTemplateColumns: "repeat(3, 44px)", gap: "16px",
                                                                justifyContent: "center"
                                                            }}>
                                                                {seats[s.id] && seats[s.id]
                                                                    .filter(seat => seat.seat_number >= 22 && seat.seat_number <= 42)
                                                                    .map((seat) => {
                                                                        const isSelected = selectedSeats.includes(seat.id);
                                                                        const floorSeatNumber = seat.seat_number - 21;
                                                                        return (
                                                                            <div
                                                                                key={seat.id}
                                                                                onClick={() => handleSelectSeat(seat)}
                                                                                style={{
                                                                                    width: 44, height: 44, borderRadius: 12,
                                                                                    backgroundColor: isSelected ? "#009688" : seat.status === "available" ? "#fff" : "#e53935",
                                                                                    color: isSelected ? "#fff" : seat.status === "available" ? "#1976d2" : "#fff",
                                                                                    fontWeight: "bold", fontSize: "1.1rem",
                                                                                    boxShadow: isSelected ? "0 2px 12px #00968888" : seat.status === "available" ? "0 2px 8px #1976d244" : "0 2px 8px #b71c1c44",
                                                                                    border: isSelected ? "2px solid #009688" : seat.status === "available" ? "2px solid #1976d2" : "2px solid #b71c1c",
                                                                                    display: "flex", flexDirection: "column", alignItems: "center",
                                                                                    justifyContent: "center", cursor: seat.status === "available" ? "pointer" : "not-allowed",
                                                                                    opacity: seat.status === "available" || isSelected ? 1 : 0.7, transition: "all 0.2s"
                                                                                }}
                                                                                title={`B${floorSeatNumber}`}
                                                                            >
                                                                                <span style={{ fontSize: 20 }}>
                                                                                    {isSelected ? "✓" : seat.status === "available" ? "▢" : "✗"}
                                                                                </span>
                                                                                <span style={{ fontSize: 14, fontWeight: 600 }}>{`B${floorSeatNumber}`}</span>
                                                                            </div>
                                                                        );
                                                                    })}
                                                            </div>
                                                        </div>
                                                    </Col>
                                                </Row>
                                                <div className="d-flex justify-content-between align-items-center mt-4">
                                                    <div>
                                                        <span className="fw-bold" style={{ fontSize: "1.1rem" }}>Tổng cộng:</span>{" "}
                                                        <span className="text-danger fw-bold" style={{ fontSize: "1.2rem" }}>
                                                            {formatCurrency(selectedSeats.length * s.price)}
                                                        </span>
                                                    </div>
                                                    <Button
                                                        variant="primary"
                                                        style={{
                                                            fontWeight: "bold",
                                                            fontSize: "1.1rem",
                                                            padding: "8px 32px",
                                                            opacity: selectedSeats.length === 0 ? 0.6 : 1,
                                                            pointerEvents: selectedSeats.length === 0 ? "none" : "auto",
                                                            boxShadow: selectedSeats.length > 0 ? "0 2px 8px #1976d2" : "none"
                                                        }}
                                                        disabled={selectedSeats.length === 0}
                                                        onClick={() => {
                                                            if (selectedSeats.length > 0) {
                                                                navigate("/checkout", {
                                                                    state: {
                                                                        schedule: s,
                                                                        selectedSeats: seats[s.id].filter(seat => selectedSeats.includes(seat.id))
                                                                    }
                                                                });
                                                            }
                                                        }}
                                                    >
                                                        Tiếp tục
                                                    </Button>
                                                </div>
                                            </Col>
                                        </Row>
                                    </Card.Footer>
                                )}
                            </Card>
                        );
                    })
                ) : (
                    <Alert variant="info">Chưa có chuyến xe nào cho tuyến này.</Alert>
                )}
            </div>
        </div>
    );
};

export default RouteDetail;