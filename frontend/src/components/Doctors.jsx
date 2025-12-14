import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { doctorsAPI } from '../services/api';

const Doctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
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

  // Get unique departments from doctors
  const departments = ['all', ...new Set(doctors.map(doctor => doctor.specialty))];

  // Filter doctors based on selected department
  const filteredDoctors = selectedDepartment === 'all' 
    ? doctors 
    : doctors.filter(doctor => doctor.specialty === selectedDepartment);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-gray-600 text-xl">Loading doctors...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4 bg-gray-50">
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
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition shadow-sm"
                >
                  Admin Dashboard
                </button>
              )}
              <button
                onClick={() => navigate('/my-appointments')}
                className="px-6 py-2 bg-slate-700 text-white rounded-lg font-semibold hover:bg-slate-800 transition shadow-sm"
              >
                My Appointments
              </button>
              <button
                onClick={() => navigate('/appointments')}
                className="px-6 py-2 bg-teal-600 text-white rounded-lg font-semibold hover:bg-teal-700 transition shadow-sm"
              >
                Book Appointment
              </button>
              <button
                onClick={handleLogout}
                className="px-6 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition shadow-sm"
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

        {/* Department Filter */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">Filter by Department</h2>
              <p className="text-sm text-gray-600">Select a department to view doctors</p>
            </div>
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-800 font-medium focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent min-w-[200px] bg-white"
            >
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept === 'all' ? 'All Departments' : dept}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Doctors Grid */}
        {filteredDoctors.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <p className="text-gray-600">
              {selectedDepartment === 'all' 
                ? 'No doctors available at the moment.' 
                : `No doctors found in ${selectedDepartment} department.`}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDoctors.map((doctor) => (
              <div
                key={doctor.id}
                className="bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-shadow"
              >
                <div className="mb-4">
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">
                    {doctor.name}
                  </h3>
                  <p className="text-teal-600 font-semibold">{doctor.specialty}</p>
                </div>
                <div className="border-t pt-4">
                  <p className="text-sm text-gray-600 mb-1">Working Hours</p>
                  <p className="text-gray-800 font-medium">
                    {doctor.workingHours.start} - {doctor.workingHours.end}
                  </p>
                </div>
                <button
                  onClick={() => navigate('/appointments', { state: { doctorId: doctor.id } })}
                  className="mt-4 w-full bg-teal-600 text-white py-2 rounded-lg font-semibold hover:bg-teal-700 transition shadow-sm"
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

