import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle 401 errors (unauthorized)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  signup: (username, email, password) =>
    api.post('/auth/signup', { username, email, password }),
  
  login: (email, password) =>
    api.post('/auth/login', { email, password }),
};

// Doctors API
export const doctorsAPI = {
  getAll: () => api.get('/doctors'),
};

// Appointments API
export const appointmentsAPI = {
  create: (doctorId, patientName, appointmentDate, appointmentTime) =>
    api.post('/appointments', {
      doctor_id: doctorId,
      patient_name: patientName,
      appointment_date: appointmentDate,
      appointment_time: appointmentTime,
    }),
  
  getAll: () => api.get('/appointments'),
  
  updateStatus: (appointmentId, status) =>
    api.patch(`/appointments/${appointmentId}/status`, { status }),
};

export default api;

