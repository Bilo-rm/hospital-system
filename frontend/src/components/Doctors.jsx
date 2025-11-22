import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { doctorsAPI } from '../services/api';

const Doctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const response = await doctorsAPI.getAll();
      setDoctors(response.data.doctors);
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch doctors');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-xl">Loading doctors...</div>
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
              <h1 className="text-3xl font-bold text-gray-800">Available Doctors</h1>
              <p className="text-gray-600 mt-1">Welcome, {user?.username || user?.email}!</p>
            </div>
            <div className="flex gap-3">
              {user?.role === 'admin' && (
                <button
                  onClick={() => navigate('/admin')}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition"
                >
                  Admin Dashboard
                </button>
              )}
              <button
                onClick={() => navigate('/my-appointments')}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition"
              >
                My Appointments
              </button>
              <button
                onClick={() => navigate('/appointments')}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition"
              >
                Book Appointment
              </button>
              <button
                onClick={handleLogout}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition"
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Doctors Grid */}
        {doctors.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <p className="text-gray-600">No doctors available at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {doctors.map((doctor) => (
              <div
                key={doctor.id}
                className="bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-shadow"
              >
                <div className="mb-4">
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">
                    {doctor.name}
                  </h3>
                  <p className="text-purple-600 font-semibold">{doctor.specialty}</p>
                </div>
                <div className="border-t pt-4">
                  <p className="text-sm text-gray-600 mb-1">Working Hours</p>
                  <p className="text-gray-800 font-medium">
                    {doctor.workingHours.start} - {doctor.workingHours.end}
                  </p>
                </div>
                <button
                  onClick={() => navigate('/appointments', { state: { doctorId: doctor.id } })}
                  className="mt-4 w-full bg-purple-600 text-white py-2 rounded-lg font-semibold hover:bg-purple-700 transition"
                >
                  Book Appointment
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Doctors;

