import { useState, useContext } from "react";
import { Form, Button, Card, Alert } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { authApis, endpoints } from "../../configs/Apis";
import MySpinner from "../layout/MySpinner";
import { MyDispatchContext } from "../../configs/MyContexts";

const ChangePassword = () => {
  const [formData, setFormData] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null); // ✅ thêm state hiển thị thông báo thành công
  const navigate = useNavigate();
  const dispatch = useContext(MyDispatchContext);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Check mật khẩu mới và xác nhận
    if (formData.new_password !== formData.confirm_password) {
      setError("Mật khẩu mới và xác nhận không khớp!");
      return;
    }

    // Check mật khẩu mới khác mật khẩu cũ
    if (formData.new_password === formData.current_password) {
      setError("Mật khẩu mới không được trùng mật khẩu hiện tại!");
      return;
    }

    try {
      setLoading(true);

      await authApis().patch(endpoints.change_password, {
        current_password: formData.current_password,
        new_password: formData.new_password,
        confirm_password: formData.confirm_password,
      });

      // ✅ thông báo đẹp hơn thay vì alert
      setSuccess("Đổi mật khẩu thành công! Vui lòng đăng nhập lại.");
      localStorage.clear();
      dispatch({ type: "logout" });

      // Tự động chuyển hướng sau vài giây
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      const data = err.response?.data;
      let msg = "Đổi mật khẩu thất bại!";
      if (data?.detail) {
        msg = data.detail;
      } else if (typeof data === "object") {
        msg = Object.values(data).flat().join(" ");
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="mx-auto mt-5" style={{ maxWidth: "600px" }}>
      <Card.Body>
        <h3 className="text-center mb-4 text-primary">Đổi mật khẩu</h3>

        {/* Hiển thị lỗi */}
        {error && <Alert variant="danger">{error}</Alert>}

        {/* Hiển thị thành công */}
        {success && <Alert variant="success">{success}</Alert>}

        {loading ? (
          <MySpinner message="Đang xử lý..." />
        ) : (
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Mật khẩu hiện tại</Form.Label>
              <Form.Control
                type="password"
                name="current_password"
                value={formData.current_password}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Mật khẩu mới</Form.Label>
              <Form.Control
                type="password"
                name="new_password"
                value={formData.new_password}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Xác nhận mật khẩu mới</Form.Label>
              <Form.Control
                type="password"
                name="confirm_password"
                value={formData.confirm_password}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <div className="d-grid">
              <Button type="submit" variant="warning">
                Đổi mật khẩu
              </Button>
            </div>
          </Form>
        )}
      </Card.Body>
    </Card>
  );
};

export default ChangePassword;
