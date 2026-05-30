import { Button, NavDropdown } from "react-bootstrap";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import { Link } from "react-router-dom";
import { MyDispatchContext, MyUserContext } from "../../configs/MyContexts";
import { useContext } from "react";

const Header = () => {
  const user = useContext(MyUserContext);
  const dispatch = useContext(MyDispatchContext);

  const isPassenger = user?.role === "Passenger" || user?.role === 1;
  const isCompany = user?.role === "Company" || user?.role === 2;
  const isAdmin = user?.role === "Admin" || user?.role === 0;
  const isAgent = user?.role === "Agent" || user?.role === 3;

  return (
    <Navbar collapseOnSelect expand="lg" className="bg-body-tertiary">
      <Container>
        <Navbar.Brand
          as={Link}
          to="/"
          className="d-flex align-items-center gap-2 text-primary fw-bold fs-4"
        >
          🚍 Bus 45
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="responsive-navbar-nav" />
        <Navbar.Collapse id="responsive-navbar-nav">
          {/* LEFT NAV */}
          <Nav className="me-auto">
            {/* Public/common */}
            <Link to="/routes" className="nav-link">Tuyến đường</Link>
            <Link to="/schedules" className="nav-link">Lịch chạy</Link>
            <Link to="/promotions" className="nav-link">Khuyến mãi</Link>
            <Link to="/gps" className="nav-link">GPS</Link>
            <Link to="/chat/ai" className="nav-link">AI gợi ý</Link>

            {/* Passenger */}
            {isPassenger && (
              <NavDropdown title="Khách hàng" id="passenger-nav">
                <NavDropdown.Item as={Link} to="/reservations">Vé của tôi</NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/chat">Chat</NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/notifications">Thông báo</NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item as={Link} to="/companies/add">Đăng ký nhà xe</NavDropdown.Item>
              </NavDropdown>
            )}

            {/* Company */}
            {isCompany && (
              <NavDropdown title="Nhà xe" id="company-nav">
                <NavDropdown.Item as={Link} to="/companies">Nhà xe của tôi</NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/buses">Quản lý xe</NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/routes">Quản lý tuyến</NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/stops">Điểm dừng</NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/schedules">Chuyến chạy</NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/reviews">Đánh giá</NavDropdown.Item>
              </NavDropdown>
            )}

            {/* Admin */}
            {isAdmin && (
              <NavDropdown title="Quản trị" id="admin-nav">
                <NavDropdown.Item as={Link} to="/companies/approval">Duyệt nhà xe</NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/notifications">Thông báo</NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item as={Link} to="/routes/add">Thêm tuyến đường</NavDropdown.Item> {/* Thêm dòng này */}
              </NavDropdown>
            )}

            {/* Agent */}
            {isAgent && (
              <NavDropdown title="Đại lý" id="agent-nav">
                <NavDropdown.Item as={Link} to="/reservations">Đơn bán</NavDropdown.Item>
              </NavDropdown>
            )}
          </Nav>

          {/* RIGHT NAV (Auth area) */}
          <Nav>
            {!user ? (
              <>
                <Link to="/register" className="nav-link text-success">
                  Đăng ký
                </Link>
                <Link to="/login" className="nav-link text-danger">
                  Đăng nhập
                </Link>
              </>
            ) : (
              <div className="d-flex align-items-center gap-2">
                <Link
                  to="/profile"
                  className="d-flex align-items-center text-decoration-none text-dark"
                  title="Trang cá nhân"
                >
                  <img
                    src={user?.avatar_url || "/default-avatar.png"}
                    alt="Avatar"
                    width="40"
                    height="40"
                    style={{ borderRadius: "50%", objectFit: "cover" }}
                    onError={(e) => { e.target.src = "/default-avatar.png"; }}
                  />
                </Link>
                <Link to="/profile" className="nav-link text-success">
                  Chào {user.first_name || "bạn"}!
                </Link>
                <Button
                  variant="outline-danger"
                  size="sm"
                  onClick={() => dispatch({ type: "logout" })}
                >
                  Đăng xuất
                </Button>
              </div>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header;
