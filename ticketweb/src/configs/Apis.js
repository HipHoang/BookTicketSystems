import axios from 'axios';

const BASE_URL = 'http://127.0.0.1:8000/api/';

let token = localStorage.getItem('access_token'); // lấy token đã lưu

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    Authorization: token ? `Bearer ${token}` : '',
    'Content-Type': 'application/json'
  }
});

export const Apis = {
  auth: {
    login: (data) => axios.post(`${BASE_URL}o/token/`, data),
    register: (data) => api.post('auth/register/', data),
    changePassword: (data) => api.put('auth/change-password/', data),
    getProfile: () => api.get('users/me/'),
    updateProfile: (data) => api.put('users/me/', data)
  },
  companies: {
    list: () => api.get('companies/'),
    detail: (id) => api.get(`companies/${id}/`),
    add: (data) => api.post('companies/', data)
  },
  buses: {
    list: (params) => api.get('buses/', {params}),
    detail: (id) => api.get(`buses/${id}/`),
    add: (data) => api.post('buses/', data)
  },
  routes: {
    list: () => api.get('routes/'),
    detail: (id) => api.get(`routes/${id}/`)
  },
  schedules: {
    list: (params) => api.get('schedules/', {params}),
    detail: (id) => api.get(`schedules/${id}/`),
    seats: (id) => api.get(`schedules/${id}/seats/`)
  },
  reservations: {
    create: (data) => api.post('reservations/', data),
    listUser: () => api.get('reservations/user/'),
    detail: (id) => api.get(`reservations/${id}/`)
  },
  payments: {
    create: (data) => api.post('payments/', data),
    detail: (id) => api.get(`payments/${id}/`)
  },
  promotions: {
    list: () => api.get('promotions/'),
    check: (code) => api.get(`promotions/${code}/check/`)
  },
  notifications: {
    list: () => api.get('notifications/')
  },
  chat: {
    messages: () => api.get('chat/messages/'),
    send: (data) => api.post('chat/messages/', data),
    aiSuggest: (data) => api.post('chat/ai-suggest/', data)
  }
};
