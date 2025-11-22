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

// Admin API
export const adminAPI = {
  getStats: () => api.get('/admin/stats'),
  getUsers: () => api.get('/admin/users'),
  getAppointments: () => api.get('/admin/appointments'),
  updateAppointmentStatus: (appointmentId, status) =>
    api.patch(`/admin/appointments/${appointmentId}/status`, { status }),
  deleteAppointment: (appointmentId) =>
    api.delete(`/admin/appointments/${appointmentId}`),
  getDoctors: () => api.get('/admin/doctors'),
  createDoctor: (name, specialty, workingHoursStart, workingHoursEnd) =>
    api.post('/admin/doctors', {
      name,
      specialty,
      working_hours_start: workingHoursStart,
      working_hours_end: workingHoursEnd,
    }),
  updateDoctor: (doctorId, name, specialty, workingHoursStart, workingHoursEnd) =>
    api.put(`/admin/doctors/${doctorId}`, {
      name,
      specialty,
      working_hours_start: workingHoursStart,
      working_hours_end: workingHoursEnd,
    }),
  deleteDoctor: (doctorId) => api.delete(`/admin/doctors/${doctorId}`),
};

export default api;

