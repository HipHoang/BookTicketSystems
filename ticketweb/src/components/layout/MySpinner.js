import { Spinner } from "react-bootstrap";

const MySpinner = ({ message = "Đang tải dữ liệu..." }) => {
  return (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "200px" }}>
      <Spinner animation="border" role="status" variant="primary" className="me-2" />
      <span>{message}</span>
    </div>
  );
};

export default MySpinner;
