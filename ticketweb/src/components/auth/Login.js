// src/components/auth/Login.js
import { useState, useContext, useEffect } from "react";
import { Button, Form, Alert, Container, Row, Col } from "react-bootstrap";
import { MyDispatchContext, MyUserContext } from "../../configs/MyContexts";
import { useNavigate, useLocation, Link } from "react-router-dom";
import MySpinner from "../layout/MySpinner";
import api, { authApis, endpoints } from "../../configs/Apis";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);

  const dispatch = useContext(MyDispatchContext);
  const user = useContext(MyUserContext);
  const navigate = useNavigate();
  const location = useLocation();

  // lấy ?next=/checkout từ URL
  const searchParams = new URLSearchParams(location.search);
  const next = searchParams.get("next");

   useEffect(() => {
    // Nếu user đã đăng nhập, chuyển hướng về trang chủ
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErr(null);


    try {
      let res = await api.post(endpoints.login,
        new URLSearchParams({
          username,
          password,
          grant_type: "password",
          client_id: "J38IIwUMRTt5hjKQouwWBXUhocC3LkE0k7vXAI3G",
          client_secret: "nL5r77CfOgL7iWtqaO49jwoo9TEiCWkY68Lxp7ebEAdLAUessgVFtoMZYgftN3dI30p8TJaHhJeUuUffayNDUfAwuyFk9CeqAGfSWd6Ow2w05vY5h7dq0cKp8dKADBM0",
        }),
        { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
      );

      const accessToken = res.data.access_token;
      const refreshToken = res.data.refresh_token;
      localStorage.setItem("access_token", accessToken);
      localStorage.setItem("refresh_token", refreshToken);

      let profile = await authApis().get(endpoints.profile);
      dispatch({ type: "login", payload: profile.data });

      // 🔹 Điều hướng sau login
      const checkoutData = sessionStorage.getItem("checkout_data");
      if (checkoutData && next === "/checkout") {
        navigate("/checkout", { state: JSON.parse(checkoutData) });
        sessionStorage.removeItem("checkout_data");
      } else {
        navigate(next || "/");
      }
    } catch (error) {
      console.error("Login error:", error);
      setErr("Tên đăng nhập hoặc mật khẩu không chính xác!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="mt-5">
      <Row className="justify-content-center">
        <Col md={6}>
          <h2 className="text-center mb-4 text-primary">Đăng nhập</h2>
          {err && <Alert variant="danger">{err}</Alert>}
          {loading ? (
            <MySpinner message="Đang xử lý đăng nhập..." />
          ) : (
            <Form onSubmit={handleLogin}>
              <Form.Group className="mb-3">
                <Form.Label>Tên đăng nhập</Form.Label>
                <Form.Control
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Mật khẩu</Form.Label>
                <Form.Control
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </Form.Group>

              <div className="d-grid">
                <Button type="submit" variant="primary">
                  Đăng nhập
                </Button>
              </div>
            </Form>
          )}
          <div className="text-left mt-3">
            <p>
              Chưa có tài khoản?{" "}
              <Link to="/register">
                Đăng ký
              </Link>
            </p>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default Login;
