import { useEffect, useState } from "react";
import { Form, Button, Card, Alert, Spinner } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import api, { endpoints } from "../../configs/Apis";

const RouteForm = () => {
  const { id } = useParams(); // nếu có id => edit
  const navigate = useNavigate();

  const [route, setRoute] = useState({
    start_location: "",
    end_location: "",
    distance_km: "",
    estimated_time_minutes: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load dữ liệu nếu đang edit
  useEffect(() => {
    const loadRoute = async () => {
      if (!id) return;
      setLoading(true);
      try {
        let res = await api.get(endpoints.route_detail(id));
        setRoute({
          start_location: res.data.start_location || "",
          end_location: res.data.end_location || "",
          distance_km: res.data.distance_km || "",
          estimated_time_minutes: res.data.estimated_time_minutes || "",
        });
      } catch (err) {
        console.error("Lỗi khi tải tuyến:", err);
        setError("Không thể tải thông tin tuyến.");
      } finally {
        setLoading(false);
      }
    };

    loadRoute();
  }, [id]);

  const handleChange = (e) => {
    setRoute({
      ...route,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("access_token");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const payload = {
        ...route,
        distance_km: route.distance_km === "" ? null : route.distance_km,
        estimated_time_minutes:
          route.estimated_time_minutes === "" ? null : route.estimated_time_minutes,
      };

      let res;
      if (id) {
        // update
        res = await api.put(endpoints.route_detail(id), payload, config);
      } else {
        // create
        res = await api.post(endpoints.route_add, payload, config);
      }

      if (res.status === 200 || res.status === 201) {
        navigate(`/routes/${res.data.id}`);
      }
    } catch (err) {
      console.error("Lỗi khi lưu tuyến:", err);
      setError("Không thể lưu tuyến. Vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  };

  if (loading && !route.start_location && id) {
    // chỉ show spinner khi đang load edit
    return <Spinner animation="border" />;
  }

  return (
    <div className="container mt-4">
      <Card>
        <Card.Body>
          <Card.Title>{id ? "Chỉnh sửa tuyến" : "Thêm tuyến mới"}</Card.Title>

          {error && <Alert variant="danger">{error}</Alert>}

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Điểm bắt đầu *</Form.Label>
              <Form.Control
                type="text"
                name="start_location"
                value={route.start_location}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Điểm kết thúc *</Form.Label>
              <Form.Control
                type="text"
                name="end_location"
                value={route.end_location}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Khoảng cách (km)</Form.Label>
              <Form.Control
                type="number"
                step="0.01"
                name="distance_km"
                value={route.distance_km}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Thời gian dự kiến (phút)</Form.Label>
              <Form.Control
                type="number"
                name="estimated_time_minutes"
                value={route.estimated_time_minutes}
                onChange={handleChange}
              />
            </Form.Group>

            <Button variant="primary" type="submit" disabled={loading}>
              {loading ? <Spinner size="sm" animation="border" /> : "Lưu tuyến"}
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
};

export default RouteForm;
