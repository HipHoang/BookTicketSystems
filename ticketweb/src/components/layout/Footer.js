// src/components/layout/Footer.js
import { Container, Row, Col } from "react-bootstrap";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-dark text-white mt-5 py-4">
      <Container>
        <Row>
          {/* Cột 1 - Giới thiệu */}
          <Col md={4} sm={12} className="mb-3">
            <h5 className="fw-bold">🚍 Bus 45</h5>
            <p>
              Hệ thống đặt vé xe 45 chỗ thông minh, giúp hành khách dễ dàng tìm,
              đặt và quản lý vé xe. Đồng thời hỗ trợ các nhà xe quản lý phương
              tiện, tuyến đường, lịch trình hiệu quả.
            </p>
          </Col>

          {/* Cột 2 - Liên kết nhanh */}
          <Col md={4} sm={6} className="mb-3">
            <h5 className="fw-bold">🔗 Liên kết nhanh</h5>
            <ul className="list-unstyled">
              <li>
                <Link to="/" className="text-white text-decoration-none">
                  Trang chủ
                </Link>
              </li>
              <li>
                <Link to="/routes" className="text-white text-decoration-none">
                  Tuyến đường
                </Link>
              </li>
              <li>
                <Link to="/schedules" className="text-white text-decoration-none">
                  Lịch chạy
                </Link>
              </li>
              <li>
                <Link to="/reservations" className="text-white text-decoration-none">
                  Vé của tôi
                </Link>
              </li>
              <li>
                <Link to="/companies" className="text-white text-decoration-none">
                  Nhà xe
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-white text-decoration-none">
                  Liên hệ
                </Link>
              </li>
            </ul>
          </Col>

          {/* Cột 3 - Liên hệ */}
          <Col md={4} sm={6} className="mb-3">
            <h5 className="fw-bold">📞 Liên hệ</h5>
            <p>Email: support@bus45.vn</p>
            <p>Hotline: 0123 456 789</p>
            <p>Địa chỉ: 123 Lê Lợi, Q.1, TP.HCM</p>
            <div className="d-flex gap-3 mt-2">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                className="text-white"
              >
                <i className="bi bi-facebook fs-5"></i>
              </a>
              <a
                href="https://zalo.me"
                target="_blank"
                rel="noreferrer"
                className="text-white"
              >
                <i className="bi bi-chat-dots fs-5"></i>
              </a>
              <a
                href="https://maps.google.com"
                target="_blank"
                rel="noreferrer"
                className="text-white"
              >
                <i className="bi bi-geo-alt fs-5"></i>
              </a>
            </div>
          </Col>
        </Row>

        {/* Bản quyền */}
        <hr className="border-light" />
        <p className="text-center mb-0">
          © {new Date().getFullYear()} Bus45. All rights reserved.
        </p>
      </Container>
    </footer>
  );
};

export default Footer;
