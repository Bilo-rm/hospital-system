import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { appointmentsAPI } from '../services/api';

const MyAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all'); // all, pending, completed, cancelled
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await appointmentsAPI.getAll();
      setAppointments(response.data.appointments);
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch appointments');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (appointmentId, newStatus) => {
    try {
      await appointmentsAPI.updateStatus(appointmentId, newStatus);
      // Update local state
      setAppointments(prevAppointments =>
        prevAppointments.map(apt =>
          apt.id === appointmentId ? { ...apt, status: newStatus } : apt
        )
      );
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update appointment status');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusBadge = (status) => {
    const statusLabels = {
      pending: 'Pending',
      completed: 'Completed',
      cancelled: 'Cancelled'
    };
    return statusLabels[status] || status;
  };

  const filteredAppointments = filter === 'all' 
    ? appointments 
    : appointments.filter(apt => apt.status === filter);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-xl">Loading appointments...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">My Appointments</h1>
              <p className="text-gray-600 mt-1">Manage your appointments</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => navigate('/doctors')}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition"
              >
                View Doctors
              </button>
              <button
                onClick={() => navigate('/appointments')}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition"
              >
                Book New
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

        {/* Filter Tabs */}
        <div className="bg-white rounded-2xl shadow-xl p-4 mb-6">
          <div className="flex flex-wrap gap-2">
            {['all', 'pending', 'completed', 'cancelled'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-lg font-semibold transition ${
                  filter === status
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)} 
                {status !== 'all' && (
                  <span className="ml-2 text-sm">
                    ({appointments.filter(apt => apt.status === status).length})
                  </span>
                )}
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

        {/* Appointments List */}
        {filteredAppointments.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <p className="text-gray-600 text-lg">
              {filter === 'all' 
                ? 'You have no appointments yet.' 
                : `No ${filter} appointments found.`}
            </p>
            {filter === 'all' && (
              <button
                onClick={() => navigate('/appointments')}
                className="mt-4 px-6 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition"
              >
                Book Your First Appointment
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAppointments.map((appointment) => (
              <div
                key={appointment.id}
                className="bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-shadow"
              >
                {/* Status Badge */}
                <div className="flex justify-between items-start mb-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(
                      appointment.status
                    )}`}
                  >
                    {getStatusBadge(appointment.status)}
                  </span>
                </div>

                {/* Appointment Details */}
                <div className="mb-4">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                    {appointment.patientName}
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <p className="text-gray-600">Doctor</p>
                      <p className="text-gray-800 font-semibold">
                        {appointment.doctor.name}
                      </p>
                      <p className="text-purple-600">{appointment.doctor.specialty}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Date & Time</p>
                      <p className="text-gray-800 font-semibold">
                        {formatDate(appointment.date)}
                      </p>
                      <p className="text-gray-800 font-semibold">
                        {appointment.time}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Status Actions */}
                <div className="border-t pt-4">
                  <p className="text-sm text-gray-600 mb-3">Update Status:</p>
                  <div className="flex flex-wrap gap-2">
                    {appointment.status !== 'completed' && (
                      <button
                        onClick={() => handleStatusChange(appointment.id, 'completed')}
                        className="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 transition"
                      >
                        Mark Complete
                      </button>
                    )}
                    {appointment.status !== 'cancelled' && (
                      <button
                        onClick={() => handleStatusChange(appointment.id, 'cancelled')}
                        className="flex-1 px-3 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 transition"
                      >
                        Cancel
                      </button>
                    )}
                    {(appointment.status === 'completed' || appointment.status === 'cancelled') && (
                      <button
                        onClick={() => handleStatusChange(appointment.id, 'pending')}
                        className="flex-1 px-3 py-2 bg-yellow-600 text-white rounded-lg text-sm font-semibold hover:bg-yellow-700 transition"
                      >
                        Reset to Pending
                      </button>
                    )}
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

export default MyAppointments;

