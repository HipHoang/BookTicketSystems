import React, { useEffect, useState } from "react";
import api, { endpoints } from "../../configs/Apis";
import { Link } from "react-router-dom";
import { Spinner } from "react-bootstrap";

const SUGGESTIONS = [
  "Hà Nội",
  "Quảng Ninh",
  "TP Hồ Chí Minh",
  "Đà Nẵng",
  "Hải Phòng",
  "Nha Trang",
  "Huế",
  "Cần Thơ",
];

const Route = () => {
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [date, setDate] = useState("");
  const [focusInput, setFocusInput] = useState("");
  const [showSuggest, setShowSuggest] = useState(false);
  const [filteredSuggest, setFilteredSuggest] = useState([]);

  const loadRoutes = async () => {
    setLoading(true);
    try {
      const params = {};
      if (from) params.start = from;
      if (to) params.end = to;
      if (date) params.date = date;

      const res = await api.get(endpoints.routes, { params });
      const data = res.data.results || res.data;
      setRoutes(data);
    } catch (err) {
      console.error("Lỗi khi gọi API tuyến đường:", err);
      setRoutes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handler = setTimeout(() => loadRoutes(), 500);
    return () => clearTimeout(handler);
  }, [from, to, date]);

  const handleSearch = (e) => {
    e.preventDefault();
    loadRoutes();
    setShowSuggest(false);
  };

  const handleInputChange = (e, type) => {
    const value = e.target.value;
    if (type === "from") setFrom(value);
    else setTo(value);

    setFocusInput(type);
    if (value.length > 0) {
      setFilteredSuggest(
        SUGGESTIONS.filter((s) =>
          s.toLowerCase().includes(value.toLowerCase())
        )
      );
      setShowSuggest(true);
    } else {
      setShowSuggest(false);
    }
  };

  const handleSuggestClick = (suggest) => {
    if (focusInput === "from") setFrom(suggest);
    else setTo(suggest);
    setShowSuggest(false);
  };

  const MySpinner = ({ message }) => (
    <div className="d-flex flex-column align-items-center justify-content-center" style={{ minHeight: "200px" }}>
      <Spinner animation="border" variant="primary" />
      <p className="mt-2 text-muted">{message}</p>
    </div>
  );

  return (
    <div className="bg-light min-vh-100">
      {/* Hero Section với ảnh nền */}
      <div
        className="text-center text-white py-5 position-relative"
        style={{
          backgroundImage:
            'url("https://res.cloudinary.com/dy9g3l14t/image/upload/v1756727686/Cac-tien-ich-va-dich-vu-tren-xe-khach-o-Viet-Nam-14_jivjh7.jpg")',
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
            backgroundColor: "rgba(0,0,0,0.5)", // lớp mờ
            zIndex: 0,
          }}
        />
        <div className="container position-relative" style={{ zIndex: 1 }}>
          <h1 className="display-5 fw-bold">Tìm kiếm chuyến đi</h1>
          <p className="lead fw-normal">
            Đặt vé xe khách nhanh chóng – an toàn – tiện lợi
          </p>

          {/* Form tìm kiếm */}
          <div
            className="mt-4 p-4 rounded-3 shadow bg-white text-dark"
            style={{ maxWidth: 800, margin: "0 auto" }}
          >
            <form onSubmit={handleSearch}>
              <div className="row g-3">
                <div className="col-md-4">
                  <input
                    type="text"
                    value={from}
                    onChange={(e) => handleInputChange(e, "from")}
                    onFocus={() => {
                      setFocusInput("from");
                      if (from) setShowSuggest(true);
                    }}
                    onBlur={() => setTimeout(() => setShowSuggest(false), 200)}
                    placeholder="Nơi xuất phát"
                    className="form-control rounded-pill px-3"
                    autoComplete="off"
                  />
                </div>
                <div className="col-md-4">
                  <input
                    type="text"
                    value={to}
                    onChange={(e) => handleInputChange(e, "to")}
                    onFocus={() => {
                      setFocusInput("to");
                      if (to) setShowSuggest(true);
                    }}
                    onBlur={() => setTimeout(() => setShowSuggest(false), 200)}
                    placeholder="Nơi đến"
                    className="form-control rounded-pill px-3"
                    autoComplete="off"
                  />
                </div>
                <div className="col-md-3">
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="form-control rounded-pill px-3"
                  />
                </div>
                <div className="col-md-1">
                  <button
                    type="submit"
                    className="btn btn-warning fw-bold w-100 rounded-pill"
                  >
                    🔍
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Danh sách tuyến */}
      <div className="container py-5">
        {loading ? (
          <MySpinner message="Đang tìm kiếm tuyến đường..." />
        ) : routes.length === 0 ? (
          <p className="text-center text-muted">
            Không tìm thấy tuyến nào.
          </p>
        ) : (
          <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
            {routes.map((r) => (
              <div key={r.id} className="col">
                <div className="card h-100 shadow-sm border-0">
                  <img
                    src="https://res.cloudinary.com/dy9g3l14t/image/upload/v1756727686/Cac-tien-ich-va-dich-vu-tren-xe-khach-o-Viet-Nam-14_jivjh7.jpg"
                    alt="bus"
                    className="card-img-top"
                    style={{ height: 160, objectFit: "cover" }}
                  />
                  <div className="card-body d-flex flex-column justify-content-between">
                    <div>
                      <h5 className="card-title fw-bold text-primary">
                        {r.start_location} ⇄ {r.end_location}
                      </h5>
                      {r.distance_km && (
                        <p className="card-text mb-1 text-muted">
                          📍 Khoảng cách: {r.distance_km} km
                        </p>
                      )}
                      {r.estimated_time_minutes && (
                        <p className="card-text mb-1 text-muted">
                          ⏱ Thời gian dự kiến: {r.estimated_time_minutes} phút
                        </p>
                      )}
                    </div>
                    <Link
                      to={`/routes/${r.id}`}
                      className="btn btn-primary mt-3 w-100"
                    >
                      Xem chi tiết
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Route;
