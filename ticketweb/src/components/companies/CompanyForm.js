import React, { useState } from "react";
import { Form, Button, Card, Alert, Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import api, { endpoints } from "../../configs/Apis";

const MySpinner = ({ message }) => (
  <div className="d-flex flex-column align-items-center justify-content-center" style={{ minHeight: "200px" }}>
    <Spinner animation="border" variant="primary" />
    <p className="mt-2 text-muted">{message}</p>
  </div>
);

const CompanyForm = () => {
  const [company, setCompany] = useState({
    name: "",
    address: "",
    phone: "",
    email: "",
    description: "",
    image: null,
    active: true,
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "image") {
      setCompany({ ...company, image: files[0] });
    } else {
      setCompany({ ...company, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(false);
    setSuccess(false);

    const formData = new FormData();
    for (const key in company) {
      if (company[key] !== null) {
        formData.append(key, company[key]);
      }
    }

    try {
      await api.post(endpoints.companies, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setSuccess(true);
      setTimeout(() => navigate("/"), 2000); // Điều hướng sau 2 giây
    } catch (err) {
      console.error(err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "100vh" }}>
      <Card style={{ width: "28rem" }} className="shadow-lg p-4">
        <Card.Body>
          <h2 className="text-center mb-4">Đăng ký Nhà xe</h2>
          {loading && <MySpinner message="Đang xử lý..." />}
          {success && <Alert variant="success">Đăng ký thành công!</Alert>}
          {error && <Alert variant="danger">Đã có lỗi xảy ra. Vui lòng thử lại.</Alert>}

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="formCompanyName">
              <Form.Label>Tên công ty</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={company.name}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formCompanyAddress">
              <Form.Label>Địa chỉ</Form.Label>
              <Form.Control
                type="text"
                name="address"
                value={company.address}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formCompanyPhone">
              <Form.Label>Số điện thoại</Form.Label>
              <Form.Control
                type="tel"
                name="phone"
                value={company.phone}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formCompanyEmail">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={company.email}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formCompanyDescription">
              <Form.Label>Mô tả</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="description"
                value={company.description}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formCompanyImage">
              <Form.Label>Hình ảnh</Form.Label>
              <Form.Control
                type="file"
                name="image"
                accept="image/*"
                onChange={handleChange}
              />
            </Form.Group>

            <Button variant="primary" type="submit" className="w-100 mt-3" disabled={loading}>
              Đăng ký
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
};

export default CompanyForm;
