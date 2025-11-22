import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { adminAPI } from '../services/api';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('stats');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showDoctorForm, setShowDoctorForm] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState(null);
  const [doctorForm, setDoctorForm] = useState({
    name: '',
    specialty: '',
    working_hours_start: '',
    working_hours_end: '',
  });

  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.role !== 'admin') {
      navigate('/doctors');
      return;
    }
    loadData();
  }, [activeTab, user]);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      if (activeTab === 'stats') {
        const response = await adminAPI.getStats();
        setStats(response.data.stats);
      } else if (activeTab === 'users') {
        const response = await adminAPI.getUsers();
        setUsers(response.data.users);
      } else if (activeTab === 'appointments') {
        const response = await adminAPI.getAppointments();
        setAppointments(response.data.appointments);
      } else if (activeTab === 'doctors') {
        const response = await adminAPI.getDoctors();
        setDoctors(response.data.doctors);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (appointmentId, newStatus) => {
    try {
      await adminAPI.updateAppointmentStatus(appointmentId, newStatus);
      loadData();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update status');
    }
  };

  const handleDeleteAppointment = async (appointmentId) => {
    if (!window.confirm('Are you sure you want to delete this appointment?')) {
      return;
    }
    try {
      await adminAPI.deleteAppointment(appointmentId);
      loadData();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete appointment');
    }
  };

  const handleDoctorSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingDoctor) {
        await adminAPI.updateDoctor(
          editingDoctor.id,
          doctorForm.name,
          doctorForm.specialty,
          doctorForm.working_hours_start,
          doctorForm.working_hours_end
        );
      } else {
        await adminAPI.createDoctor(
          doctorForm.name,
          doctorForm.specialty,
          doctorForm.working_hours_start,
          doctorForm.working_hours_end
        );
      }
      setShowDoctorForm(false);
      setEditingDoctor(null);
      setDoctorForm({ name: '', specialty: '', working_hours_start: '', working_hours_end: '' });
      loadData();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save doctor');
    }
  };

  const handleEditDoctor = (doctor) => {
    setEditingDoctor(doctor);
    setDoctorForm({
      name: doctor.name,
      specialty: doctor.specialty,
      working_hours_start: doctor.working_hours_start,
      working_hours_end: doctor.working_hours_end,
    });
    setShowDoctorForm(true);
  };

  const handleDeleteDoctor = async (doctorId) => {
    if (!window.confirm('Are you sure you want to delete this doctor?')) {
      return;
    }
    try {
      await adminAPI.deleteDoctor(doctorId);
      loadData();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete doctor');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (user?.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
              <p className="text-gray-600 mt-1">Welcome, {user?.username || user?.email}!</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => navigate('/doctors')}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition"
              >
                User View
              </button>
              <button
                onClick={logout}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition"
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-xl p-4 mb-6">
          <div className="flex flex-wrap gap-2">
            {['stats', 'users', 'appointments', 'doctors'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg font-semibold transition ${
                  activeTab === tab
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="text-gray-600">Loading...</div>
          </div>
        ) : (
          <>
            {/* Statistics Tab */}
            {activeTab === 'stats' && stats && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white rounded-2xl shadow-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">Total Users</h3>
                  <p className="text-4xl font-bold text-purple-600">{stats.totalUsers}</p>
                </div>
                <div className="bg-white rounded-2xl shadow-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">Total Doctors</h3>
                  <p className="text-4xl font-bold text-blue-600">{stats.totalDoctors}</p>
                </div>
                <div className="bg-white rounded-2xl shadow-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">Total Appointments</h3>
                  <p className="text-4xl font-bold text-green-600">{stats.totalAppointments}</p>
                </div>
                <div className="bg-white rounded-2xl shadow-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">Pending</h3>
                  <p className="text-4xl font-bold text-yellow-600">{stats.pendingAppointments}</p>
                </div>
                <div className="bg-white rounded-2xl shadow-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">Completed</h3>
                  <p className="text-4xl font-bold text-green-600">{stats.completedAppointments}</p>
                </div>
                <div className="bg-white rounded-2xl shadow-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">Cancelled</h3>
                  <p className="text-4xl font-bold text-red-600">{stats.cancelledAppointments}</p>
                </div>
              </div>
            )}

            {/* Users Tab */}
            {activeTab === 'users' && (
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">All Users</h2>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3">ID</th>
                        <th className="text-left p-3">Username</th>
                        <th className="text-left p-3">Email</th>
                        <th className="text-left p-3">Created At</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((u) => (
                        <tr key={u.id} className="border-b hover:bg-gray-50">
                          <td className="p-3">{u.id}</td>
                          <td className="p-3">{u.username}</td>
                          <td className="p-3">{u.email}</td>
                          <td className="p-3">{new Date(u.created_at).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Appointments Tab */}
            {activeTab === 'appointments' && (
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">All Appointments</h2>
                <div className="space-y-4">
                  {appointments.map((apt) => (
                    <div key={apt.id} className="border rounded-lg p-4 hover:shadow-md transition">
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(apt.status)}`}>
                              {apt.status}
                            </span>
                            <span className="font-semibold text-gray-800">{apt.patientName}</span>
                          </div>
                          <p className="text-sm text-gray-600">Doctor: {apt.doctor.name} ({apt.doctor.specialty})</p>
                          <p className="text-sm text-gray-600">User: {apt.user.username} ({apt.user.email})</p>
                          <p className="text-sm text-gray-600">Date: {apt.date} at {apt.time}</p>
                        </div>
                        <div className="flex gap-2">
                          <select
                            value={apt.status}
                            onChange={(e) => handleStatusChange(apt.id, e.target.value)}
                            className="px-3 py-2 border rounded-lg text-sm"
                          >
                            <option value="pending">Pending</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                          <button
                            onClick={() => handleDeleteAppointment(apt.id)}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 transition"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Doctors Tab */}
            {activeTab === 'doctors' && (
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold text-gray-800">Doctors Management</h2>
                  <button
                    onClick={() => {
                      setShowDoctorForm(true);
                      setEditingDoctor(null);
                      setDoctorForm({ name: '', specialty: '', working_hours_start: '', working_hours_end: '' });
                    }}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition"
                  >
                    Add Doctor
                  </button>
                </div>

                {showDoctorForm && (
                  <form onSubmit={handleDoctorSubmit} className="mb-6 p-4 border rounded-lg bg-gray-50">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input
                        type="text"
                        placeholder="Doctor Name"
                        value={doctorForm.name}
                        onChange={(e) => setDoctorForm({ ...doctorForm, name: e.target.value })}
                        className="px-4 py-2 border rounded-lg"
                        required
                      />
                      <input
                        type="text"
                        placeholder="Specialty"
                        value={doctorForm.specialty}
                        onChange={(e) => setDoctorForm({ ...doctorForm, specialty: e.target.value })}
                        className="px-4 py-2 border rounded-lg"
                        required
                      />
                      <input
                        type="time"
                        placeholder="Start Time"
                        value={doctorForm.working_hours_start}
                        onChange={(e) => setDoctorForm({ ...doctorForm, working_hours_start: e.target.value })}
                        className="px-4 py-2 border rounded-lg"
                        required
                      />
                      <input
                        type="time"
                        placeholder="End Time"
                        value={doctorForm.working_hours_end}
                        onChange={(e) => setDoctorForm({ ...doctorForm, working_hours_end: e.target.value })}
                        className="px-4 py-2 border rounded-lg"
                        required
                      />
                    </div>
                    <div className="flex gap-2 mt-4">
                      <button
                        type="submit"
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition"
                      >
                        {editingDoctor ? 'Update' : 'Create'} Doctor
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowDoctorForm(false);
                          setEditingDoctor(null);
                        }}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {doctors.map((doctor) => (
                    <div key={doctor.id} className="border rounded-lg p-4 hover:shadow-md transition">
                      <h3 className="font-bold text-lg mb-2">{doctor.name}</h3>
                      <p className="text-purple-600 mb-2">{doctor.specialty}</p>
                      <p className="text-sm text-gray-600 mb-4">
                        Hours: {doctor.working_hours_start} - {doctor.working_hours_end}
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditDoctor(doctor)}
                          className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteDoctor(doctor.id)}
                          className="flex-1 px-3 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 transition"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;

