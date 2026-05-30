// src/components/auth/Register.js
import { useState } from "react";
import { Form, Button, Card, Alert } from "react-bootstrap";
import { useNavigate, Link } from "react-router-dom";
import api, { endpoints } from "../../configs/Apis";
import MySpinner from "../layout/MySpinner";

const Register = () => {
  const [formData, setFormData] = useState({
    username: "",
    first_name: "",
    last_name: "",
    email: "",
    phone: "",               // NEW
    gender: "male",          // NEW: 'male' | 'female' | 'other'
    password: "",
    confirm_password: "",
    avatar: null,            // file upload
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      setFormData({ ...formData, [name]: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (formData.password !== formData.confirm_password) {
      setError("Mật khẩu xác nhận không khớp!");
      return;
    }

    try {
      setLoading(true);

      let registerData = new FormData();
      for (let key in formData) {
        if (formData[key] !== null)
          registerData.append(key, formData[key]);
      }

      await api.post(endpoints.register, registerData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("Đăng ký thành công! Vui lòng đăng nhập.");
      navigate("/login");
    } catch (err) {
      // DRF có thể trả về detail hoặc object lỗi theo field
      const data = err.response?.data;
      const msg =
        data?.detail ||
        (typeof data === "object" ? JSON.stringify(data) : "Đăng ký thất bại!");
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="mx-auto mt-5" style={{ maxWidth: "600px" }}>
      <Card.Body>
        <h3 className="text-center mb-4 text-primary">Đăng ký tài khoản</h3>

        {error && <Alert variant="danger">{error}</Alert>}

        {loading ? (
          <MySpinner message="Đang xử lý đăng ký..." />
        ) : (
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Tên đăng nhập</Form.Label>
              <Form.Control
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Họ</Form.Label>
              <Form.Control
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Tên</Form.Label>
              <Form.Control
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </Form.Group>

            {/* NEW: Phone */}
            <Form.Group className="mb-3">
              <Form.Label>Số điện thoại</Form.Label>
              <Form.Control
                type="tel"
                name="phone"
                placeholder="0123456789"
                value={formData.phone}
                onChange={handleChange}
              />
            </Form.Group>

            {/* NEW: Gender */}
            <Form.Group className="mb-3">
              <Form.Label>Giới tính</Form.Label>
              <Form.Select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
              >
                <option value="male">Nam</option>
                <option value="female">Nữ</option>
                <option value="other">Khác</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Mật khẩu</Form.Label>
              <Form.Control
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Xác nhận mật khẩu</Form.Label>
              <Form.Control
                type="password"
                name="confirm_password"
                value={formData.confirm_password}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Avatar</Form.Label>
              <Form.Control
                type="file"
                name="avatar"
                accept="image/*"
                onChange={handleChange}
              />
            </Form.Group>

            <div className="d-grid">
              <Button type="submit" variant="success">
                Đăng ký
              </Button>
            </div>
          </Form>
        )}
        <div className="text-left mt-3">
          <p>
            Đã có tài khoản?{" "}
            <Link to="/login">
              Đăng nhập
            </Link>
          </p>
        </div>
      </Card.Body>
    </Card>
  );
};

export default Register;
