// src/configs/Apis.js
import axios from "axios";

export const BASE_URL = "http://127.0.0.1:8000/";

// Hàm lấy token từ localStorage
const getToken = () => localStorage.getItem("access_token");

export const endpoints = {
  login: "o/token/",
  register: "users/",
  profile: "users/current/",
  update_info: "users/update-info/",
  change_password: "users/change-password/",
  all_users: "users/all-users/",
  
  // Company / Bus
  companies: "companies/",
  companiy_add: "companies/",
  company_detail: (id) => `companies/${id}/`,

  buses: "buses/",
  bus_detail: (id) => `buses/${id}/`,

  // Route / Stop
  routes: "routes/",
  route_detail: (id) => `routes/${id}/`,
  route_schedules: (id) => `routes/${id}/schedules/`,
  route_add: `routes/`,

  stops: "stops/",
  stop_detail: (id) => `stops/${id}/`,

  // Schedule / Seat
  schedules: "schedules/",
  schedule_detail: (id) => `schedules/${id}/`,

  seats: "seats/",
  seat_detail: (id) => `seats/${id}/`,

  // Reservation / Payment
  reservations: "reservations/", // Lấy danh sách tất cả vé
  reservation_add: "reservations/", // Tạo mới vé (POST)
  my_reservations: "reservations/my/", // Vé của người dùng hiện tại
  reservation_by_code: (code) => `reservations/by-code/${code}/`,

  payments: "payments/",
  payment_detail: (id) => `payments/${id}/`,

  // Promotion
  promotions: "promotions/",
  promotion_check: (code) => `promotions/check/${code}/`,
  promotion_usages: "promotion-usages/",

  // Driver
  drivers: "drivers/",
  driver_detail: (id) => `drivers/${id}/`,
  driver_assignments: "driver-assignments/",

  // Reviews
  reviews: "reviews/",
  review_detail: (id) => `reviews/${id}/`,

  // Notifications
  notifications: "notifications/",
  notification_mark_read: (id) => `notifications/mark-read/${id}/`,

  // GPS
  gps_points: "gps-points/",
  gps_live: "gps-points/live/",

  // Agents
  agents: "agents/",
  agent_detail: (id) => `agents/${id}/`,
  agent_sales: "agent-sales/",

  // Chat
  chat_messages: "chat/messages/",
  chat_send: "chat/messages/send-message/",
  chat_ai: "chat/messages/ai-suggest/",
};

// Axios instance có token
export const authApis = () => {
  const token = getToken();
  return axios.create({
    baseURL: BASE_URL,
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
      "Content-Type": "application/json",
    },
  });
};

// Axios instance không token
export default axios.create({
  baseURL: BASE_URL,
});
