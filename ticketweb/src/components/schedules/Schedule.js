import { useEffect, useState } from "react";
import { Card, Button, Row, Col, Alert, Pagination } from "react-bootstrap";
import { authApis, endpoints } from "../../configs/Apis";
import MySpinner from "../layout/MySpinner";
import { useNavigate } from "react-router-dom";

const Schedule = () => {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [count, setCount] = useState(0);

  const navigate = useNavigate();

  useEffect(() => {
    const loadSchedules = async () => {
      try {
        setLoading(true);
        let res = await authApis().get(
          `${endpoints.schedules}?page=${page}&page_size=5`
        );
        setSchedules(res.data.results || []);
        setCount(res.data.count || 0);
      } catch (err) {
        console.error(err);
        setError("Không thể tải danh sách lịch trình!");
      } finally {
        setLoading(false);
      }
    };

    loadSchedules();
  }, [page]);

  if (loading) return <MySpinner message="Đang tải lịch trình..." />;

  if (error) return <Alert variant="danger">{error}</Alert>;

  return (
    <div className="container mt-4">
      <h2 className="text-center text-primary mb-4">Danh sách lịch trình</h2>

      <Row>
        {schedules.map((s) => (
          <Col md={6} lg={4} key={s.id} className="mb-4">
            <Card>
              <Card.Body>
                <Card.Title>
                  {s.route?.start?.name} → {s.route?.end?.name}
                </Card.Title>
                <Card.Text>
                  <strong>Ngày giờ:</strong>{" "}
                  {new Date(s.departure_time).toLocaleString("vi-VN")}
                  <br />
                  <strong>Xe:</strong> {s.bus?.license_plate}
                  <br />
                  <strong>Giá vé:</strong>{" "}
                  {s.price?.toLocaleString("vi-VN")} VND
                </Card.Text>

                <div className="d-flex justify-content-between">
                  <Button
                    variant="info"
                    onClick={() => navigate(`/schedules/${s.id}`)}
                  >
                    Xem chi tiết
                  </Button>
                  <Button
                    variant="success"
                    onClick={() => navigate(`/reservations/add/${s.id}`)}
                  >
                    Đặt vé
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Pagination */}
      {count > 5 && (
        <div className="d-flex justify-content-center">
          <Pagination>
            {Array.from({ length: Math.ceil(count / 5) }, (_, i) => (
              <Pagination.Item
                key={i + 1}
                active={i + 1 === page}
                onClick={() => setPage(i + 1)}
              >
                {i + 1}
              </Pagination.Item>
            ))}
          </Pagination>
        </div>
      )}
    </div>
  );
};

export default Schedule;
