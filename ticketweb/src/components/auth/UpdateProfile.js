// src/components/auth/UpdateProfile.js
import { useEffect, useState } from "react";
import { Form, Button, Card, Alert } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { authApis, endpoints } from "../../configs/Apis";
import MySpinner from "../layout/MySpinner";

const UpdateProfile = () => {
  const [formData, setFormData] = useState({
    username: "",
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    gender: "male",
    avatar: null,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Load thông tin user hiện tại
  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        let res = await authApis().get(endpoints.profile);
        setFormData({
          username: res.data.username || "",
          first_name: res.data.first_name || "",
          last_name: res.data.last_name || "",
          email: res.data.email || "",
          phone: res.data.phone || "",
          gender: res.data.gender || "male",
          avatar: null,
        });
      } catch (err) {
        setError("Không thể tải thông tin người dùng!");
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, []);

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

    try {
      setLoading(true);

      const updateData = new FormData();
      const allowedFields = [
        "first_name",
        "last_name",
        "email",
        "phone",
        "gender",
        "avatar",
      ];
      allowedFields.forEach((key) => {
        const v = formData[key];
        if (v !== null && v !== undefined && v !== "") {
          updateData.append(key, v);
        }
      });

      await authApis().patch(endpoints.update_info, updateData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("Cập nhật thành công!");
      navigate("/profile");
    } catch (err) {
      const data = err.response?.data;
      const msg =
        data?.detail ||
        (typeof data === "object" ? JSON.stringify(data) : "Cập nhật thất bại!");
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="mx-auto mt-5" style={{ maxWidth: "600px" }}>
      <Card.Body>
        <h3 className="text-center mb-4 text-primary">Cập nhật thông tin</h3>

        {error && <Alert variant="danger">{error}</Alert>}

        {loading ? (
          <MySpinner message="Đang tải dữ liệu..." />
        ) : (
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Tên đăng nhập</Form.Label>
              <Form.Control
                type="text"
                value={formData.username}
                disabled
                readOnly
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
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Số điện thoại</Form.Label>
              <Form.Control
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
              />
            </Form.Group>

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
              <Form.Label>Avatar</Form.Label>
              <Form.Control
                type="file"
                name="avatar"
                accept="image/*"
                onChange={handleChange}
              />
            </Form.Group>

            <div className="d-grid">
              <Button type="submit" variant="primary">
                Lưu thay đổi
              </Button>
            </div>
          </Form>
        )}
      </Card.Body>
    </Card>
  );
};

export default UpdateProfile;
