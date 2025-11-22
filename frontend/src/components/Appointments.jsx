import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { doctorsAPI, appointmentsAPI } from '../services/api';

const Appointments = () => {
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [patientName, setPatientName] = useState('');
  const [appointmentDate, setAppointmentDate] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    fetchDoctors();
    // Pre-select doctor if coming from doctors page
    if (location.state?.doctorId) {
      setSelectedDoctor(location.state.doctorId.toString());
    }
  }, [location]);

  const fetchDoctors = async () => {
    try {
      const response = await doctorsAPI.getAll();
      setDoctors(response.data.doctors);
    } catch (err) {
      setError('Failed to fetch doctors');
    }
  };

  const getSelectedDoctorData = () => {
    return doctors.find((d) => d.id.toString() === selectedDoctor);
  };

  const generateTimeSlots = () => {
    const doctor = getSelectedDoctorData();
    if (!doctor) return [];

    const [startHour, startMin] = doctor.workingHours.start.split(':').map(Number);
    const [endHour, endMin] = doctor.workingHours.end.split(':').map(Number);
    
    const slots = [];
    let currentHour = startHour;
    let currentMin = startMin;

    while (currentHour < endHour || (currentHour === endHour && currentMin < endMin)) {
      const timeString = `${String(currentHour).padStart(2, '0')}:${String(currentMin).padStart(2, '0')}`;
      slots.push(timeString);
      
      currentMin += 30;
      if (currentMin >= 60) {
        currentMin = 0;
        currentHour++;
      }
    }

    return slots;
  };

  const getMinDate = () => {
    const today = new Date();
    today.setDate(today.getDate() + 1); // Tomorrow
    return today.toISOString().split('T')[0];
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (!selectedDoctor || !patientName || !appointmentDate || !appointmentTime) {
      setError('All fields are required');
      setLoading(false);
      return;
    }

    try {
      await appointmentsAPI.create(
        parseInt(selectedDoctor),
        patientName,
        appointmentDate,
        appointmentTime
      );

      setSuccess('Appointment booked successfully!');
      setPatientName('');
      setAppointmentDate('');
      setAppointmentTime('');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create appointment');
    } finally {
      setLoading(false);
    }
  };

  const selectedDoctorData = getSelectedDoctorData();
  const timeSlots = selectedDoctorData ? generateTimeSlots() : [];

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h1 className="text-3xl font-bold text-gray-800">Book Appointment</h1>
            <div className="flex gap-3">
              <button
                onClick={() => navigate('/doctors')}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition"
              >
                View Doctors
              </button>
              <button
                onClick={() => navigate('/my-appointments')}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition"
              >
                My Appointments
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

        {/* Appointment Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Doctor Selection */}
            <div>
              <label htmlFor="doctor" className="block text-sm font-medium text-gray-700 mb-2">
                Select Doctor *
              </label>
              <select
                id="doctor"
                value={selectedDoctor}
                onChange={(e) => {
                  setSelectedDoctor(e.target.value);
                  setAppointmentTime('');
                }}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
                required
              >
                <option value="">Choose a doctor...</option>
                {doctors.map((doctor) => (
                  <option key={doctor.id} value={doctor.id}>
                    {doctor.name} - {doctor.specialty}
                  </option>
                ))}
              </select>
              {selectedDoctorData && (
                <p className="mt-2 text-sm text-gray-600">
                  Working Hours: {selectedDoctorData.workingHours.start} - {selectedDoctorData.workingHours.end}
                </p>
              )}
            </div>

            {/* Patient Name */}
            <div>
              <label htmlFor="patientName" className="block text-sm font-medium text-gray-700 mb-2">
                Patient Name *
              </label>
              <input
                type="text"
                id="patientName"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
                placeholder="Enter patient name"
                required
              />
            </div>

            {/* Appointment Date */}
            <div>
              <label htmlFor="appointmentDate" className="block text-sm font-medium text-gray-700 mb-2">
                Appointment Date *
              </label>
              <input
                type="date"
                id="appointmentDate"
                value={appointmentDate}
                onChange={(e) => {
                  setAppointmentDate(e.target.value);
                  setAppointmentTime('');
                }}
                min={getMinDate()}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
                required
              />
              <p className="mt-2 text-sm text-gray-600">
                Appointments can only be booked for future dates (weekdays only)
              </p>
            </div>

            {/* Appointment Time */}
            <div>
              <label htmlFor="appointmentTime" className="block text-sm font-medium text-gray-700 mb-2">
                Appointment Time *
              </label>
              {selectedDoctorData ? (
                <select
                  id="appointmentTime"
                  value={appointmentTime}
                  onChange={(e) => setAppointmentTime(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
                  required
                  disabled={!appointmentDate}
                >
                  <option value="">Select a time...</option>
                  {timeSlots.map((time) => (
                    <option key={time} value={time}>
                      {time}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  value=""
                  disabled
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100"
                  placeholder="Please select a doctor first"
                />
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
                {success}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Booking Appointment...' : 'Book Appointment'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Appointments;

