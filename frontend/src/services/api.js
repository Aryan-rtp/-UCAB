/**
 * API Service
 * Centralized Axios instance with JWT interceptor.
 * All frontend HTTP calls go through this module.
 */

import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor — attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('ucab_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle 401 globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('ucab_token');
      localStorage.removeItem('ucab_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ─── Auth API ────────────────────────────────────────────────────────
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getProfile: () => api.get('/users/profile'),
};

// ─── Ride API ────────────────────────────────────────────────────────
export const rideAPI = {
  book: (data) => api.post('/rides/book', data),
  getEstimate: (pickupCoordinates, dropCoordinates) =>
    api.get('/rides/estimate', {
      params: {
        pickupCoordinates: pickupCoordinates.join(','),
        dropCoordinates: dropCoordinates.join(','),
      },
    }),
  getRide: (id) => api.get(`/rides/${id}`),
  getUserRides: (page = 1, limit = 10) =>
    api.get('/rides/history', { params: { page, limit } }),
  cancel: (rideId, reason) => api.post('/rides/cancel', { rideId, reason }),
  start: (rideId) => api.post('/rides/start', { rideId }),
  complete: (rideId) => api.post('/rides/complete', { rideId }),
};

// ─── Driver API ──────────────────────────────────────────────────────
export const driverAPI = {
  getRequests: () => api.get('/driver/requests'),
  accept: (rideId) => api.post('/driver/accept', { rideId }),
  reject: (rideId) => api.post('/driver/reject', { rideId }),
  updateLocation: (coordinates) => api.put('/driver/location', { coordinates }),
  getEarnings: (page = 1, limit = 10) =>
    api.get('/driver/earnings', { params: { page, limit } }),
};

// ─── Payment API ─────────────────────────────────────────────────────
export const paymentAPI = {
  process: (rideId, paymentMethod) =>
    api.post('/payments/process', { rideId, paymentMethod }),
  getHistory: (page = 1, limit = 10) =>
    api.get('/payments/history', { params: { page, limit } }),
};

// ─── Admin API ───────────────────────────────────────────────────────
export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  getUsers: (page = 1, limit = 20) =>
    api.get('/admin/users', { params: { page, limit } }),
  getDrivers: (page = 1, limit = 20) =>
    api.get('/admin/drivers', { params: { page, limit } }),
  getRides: (page = 1, limit = 20, status = '') =>
    api.get('/admin/rides', { params: { page, limit, status } }),
  toggleUser: (id) => api.put(`/admin/users/${id}/toggle`),
  verifyDriver: (id) => api.put(`/admin/drivers/${id}/verify`),
};

export default api;
