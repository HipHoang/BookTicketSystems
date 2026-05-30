import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Card, Button, Form, Row, Col } from "react-bootstrap";
import api, { endpoints } from "../configs/Apis";
import { FaExchangeAlt } from "react-icons/fa";
import MySpinner from "./layout/MySpinner";

// Map ảnh mặc định theo tuyến
const routeImages = {
  "hà nội-sài gòn": "https://res.cloudinary.com/dy9g3l14t/image/upload/v1756728000/hn-sg.jpg",
  "hà nội-đà nẵng": "https://res.cloudinary.com/dy9g3l14t/image/upload/v1756728050/hn-dn.jpg",
  "sài gòn-đà lạt": "https://res.cloudinary.com/dy9g3l14t/image/upload/v1756728100/sg-dl.jpg",
  "sài gòn-nha trang": "https://res.cloudinary.com/dy9g3l14t/image/upload/v1756728150/sg-nt.jpg",
};

// Ảnh fallback chung
const defaultRouteImage =
  "https://res.cloudinary.com/dy9g3l14t/image/upload/v1756727686/Cac-tien-ich-va-dich-vu-tren-xe-khach-o-Viet-Nam-14_jivjh7.jpg";

const Home = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState({
    start_location: "",
    end_location: "",
    date: "",
  });
  const [popularRoutes, setPopularRoutes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPopularRoutes = async () => {
      setLoading(true);
      try {
        const res = await api.get(endpoints.routes);
        const allRoutes = res.data.results || res.data;

        // Lấy 4 tuyến đầu tiên
        const fetchedPopularRoutes = Array.isArray(allRoutes)
          ? allRoutes.slice(0, 4)
          : [];
        setPopularRoutes(fetchedPopularRoutes);
      } catch (error) {
        console.error("Lỗi khi lấy các tuyến phổ biến:", error);
        setPopularRoutes([]);
      } finally {
        setLoading(false);
      }
    };
    fetchPopularRoutes();
  }, []);

  const handleChange = (e) => {
    setSearch({ ...search, [e.target.name]: e.target.value });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(
      `/routes?start=${search.start_location}&end=${search.end_location}&date=${search.date}`
    );
  };

  const handleSwapLocations = () => {
    setSearch((prevSearch) => ({
      ...prevSearch,
      start_location: prevSearch.end_location,
      end_location: prevSearch.start_location,
    }));
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN").format(amount) + "đ";
  };

  const getRouteImage = (start, end) => {
    const key = `${start.toLowerCase()}-${end.toLowerCase()}`;
    return routeImages[key] || defaultRouteImage;
  };

  if (loading) {
    return <MySpinner message="Đang tải dữ liệu..." />;
  }

  return (
    <div style={{ backgroundColor: "#f5f5f5", minHeight: "100vh" }}>
      {/* Hero Section */}
      <div
        className="text-center text-white py-5 position-relative"
        style={{
          backgroundImage: `url(${defaultRouteImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.4)",
            zIndex: 0,
          }}
        ></div>
        <div className="container position-relative" style={{ zIndex: 1 }}>
          <h1 className="display-4 fw-bold">Đặt vé xe khách trực tuyến</h1>
          <p className="lead fw-normal">
            Nhanh chóng – An toàn – Giá rẻ. Trải nghiệm hành trình thoải mái nhất!
          </p>
          <div
            className="mt-4 p-4 rounded-3 shadow"
            style={{ backgroundColor: "rgba(255, 255, 255, 0.9)" }}
          >
            <Form onSubmit={handleSearch}>
              <Row className="align-items-center">
                <Col md={4} className="mb-3 mb-md-0">
                  <Form.Group>
                    <Form.Label className="fw-bold text-dark">
                      Nơi xuất phát
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="start_location"
                      value={search.start_location}
                      onChange={handleChange}
                      placeholder="VD: Hà Nội"
                      required
                    />
                  </Form.Group>
                </Col>
                <Col
                  xs="auto"
                  className="d-flex align-items-center justify-content-center mb-3 mb-md-0"
                >
                  <Button
                    variant="outline-primary"
                    onClick={handleSwapLocations}
                    className="rounded-circle"
                  >
                    <FaExchangeAlt />
                  </Button>
                </Col>
                <Col md={4} className="mb-3 mb-md-0">
                  <Form.Group>
                    <Form.Label className="fw-bold text-dark">Nơi đến</Form.Label>
                    <Form.Control
                      type="text"
                      name="end_location"
                      value={search.end_location}
                      onChange={handleChange}
                      placeholder="VD: Sài Gòn"
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={3} className="mb-3 mb-md-0">
                  <Form.Group>
                    <Form.Label className="fw-bold text-dark">Ngày đi</Form.Label>
                    <Form.Control
                      type="date"
                      name="date"
                      value={search.date}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={1} className="d-flex align-items-end">
                  <Button
                    type="submit"
                    variant="warning"
                    className="w-100 fw-bold"
                  >
                    Tìm
                  </Button>
                </Col>
              </Row>
            </Form>
          </div>
        </div>
      </div>

      {/* Popular Routes */}
      <div className="container mt-5">
        <h4 className="mb-3">Tuyến đường phổ biến</h4>
        <Row>
          {popularRoutes.length > 0 ? (
            popularRoutes.map((route) => (
              <Col key={route.id} md={3} className="mb-4">
                <Card
                  className="shadow-sm border-0"
                  onClick={() => navigate(`/routes/${route.id}`)}
                  style={{ cursor: "pointer", overflow: "hidden" }}
                >
                  <div style={{ position: "relative", height: "200px" }}>
                    <Card.Img
                      variant="top"
                      src={getRouteImage(route.start_location, route.end_location)}
                      alt={`${route.start_location} → ${route.end_location}`}
                      style={{ height: "100%", objectFit: "cover" }}
                    />
                    <div
                      style={{
                        position: "absolute",
                        bottom: 0,
                        left: 0,
                        right: 0,
                        padding: "1rem",
                        background:
                          "linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 100%)",
                      }}
                    >
                      <Card.Title className="text-white fw-bold">
                        {route.start_location} → {route.end_location}
                      </Card.Title>
                      {route.min_price && (
                        <Card.Text className="text-white">
                          Từ {formatCurrency(route.min_price)}
                        </Card.Text>
                      )}
                    </div>
                  </div>
                </Card>
              </Col>
            ))
          ) : (
            <Col>
              <p>Không có tuyến phổ biến nào được tìm thấy.</p>
            </Col>
          )}
        </Row>
      </div>
    </div>
  );
};

export default Home;
