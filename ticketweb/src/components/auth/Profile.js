import { useContext, useEffect, useState } from "react";
import { Card, Button, Alert } from "react-bootstrap";
import { MyUserContext } from "../../configs/MyContexts";
import { authApis, endpoints } from "../../configs/Apis";
import { useNavigate } from "react-router-dom";
import MySpinner from "../layout/MySpinner";

const Profile = () => {
  const user = useContext(MyUserContext);
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        let res = await authApis().get(endpoints.profile); // -> /users/current/
        setProfile(res.data);
      } catch (err) {
        console.error("Lỗi tải profile:", err);
        setError("Không thể tải thông tin người dùng!");
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadProfile();
    } else {
      setLoading(false);
    }
  }, [user]);

  if (!user) {
    return (
      <Alert variant="warning" className="mt-3 text-center">
        Bạn cần đăng nhập để xem thông tin cá nhân!
      </Alert>
    );
  }

  if (loading) return <MySpinner message="Đang tải thông tin cá nhân..." />;

  if (error) return <Alert variant="danger">{error}</Alert>;

  // Map role từ backend
  const getRoleName = (role) => {
    switch (role) {
      case 0:
        return "Admin";
      case 1:
        return "Hành khách";
      case 2:
        return "Nhà xe";
      case 3:
        return "Đại lý";
      default:
        return "Không xác định";
    }
  };

  return (
    <Card className="mx-auto mt-5" style={{ maxWidth: "600px" }}>
      <Card.Body className="text-center">
        <img
          src={profile?.avatar_url || "/default-avatar.png"}
          alt="Avatar"
          width="120"
          height="120"
          style={{
            borderRadius: "50%",
            objectFit: "cover",
            marginBottom: "15px",
          }}
        />
        <h3 className="text-primary">{profile?.username}</h3>
        <p>
          <strong>Họ tên:</strong> {profile?.first_name} {profile?.last_name}
        </p>
        <p>
          <strong>Email:</strong> {profile?.email}
        </p>
        <p>
          <strong>Số điện thoại:</strong> {profile?.phone || "Chưa cập nhật"}
        </p>
        <p>
          <strong>Giới tính:</strong>{" "}
          {profile?.gender === "male"
            ? "Nam"
            : profile?.gender === "female"
            ? "Nữ"
            : profile?.gender === "other"
            ? "Khác"
            : "Chưa cập nhật"}
        </p>
        <p>
          <strong>Vai trò:</strong> {getRoleName(profile?.role)}
        </p>

        <div className="d-flex justify-content-center gap-3 mt-3">
          <Button variant="success" onClick={() => navigate("/update-profile")}>
            Cập nhật thông tin
          </Button>
          <Button variant="warning" onClick={() => navigate("/change-password")}>
            Đổi mật khẩu
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
};

export default Profile;
