const express = require('express');
const router = express.Router();
const { dbGet, dbRun, dbAll } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const { validateAppointment } = require('../middleware/validation');

// Create appointment
router.post('/', authenticateToken, validateAppointment, async (req, res) => {
  try {
    const { doctor_id, patient_name, appointment_date, appointment_time } = req.body;
    const user_id = req.user.id;

    // Check if doctor exists
    const doctor = await dbGet('SELECT * FROM doctors WHERE id = ?', [doctor_id]);
    if (!doctor) {
      return res.status(404).json({ error: 'Doctor not found' });
    }

    // Check if appointment time is within doctor's working hours
    const appointmentDateTime = new Date(`${appointment_date}T${appointment_time}`);
    const dayOfWeek = appointmentDateTime.getDay(); // 0 = Sunday, 6 = Saturday
    
    // Check if it's a weekday (Monday-Friday)
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      return res.status(400).json({ error: 'Appointments can only be scheduled on weekdays' });
    }

    // Parse working hours
    const [workStartHour, workStartMin] = doctor.working_hours_start.split(':').map(Number);
    const [workEndHour, workEndMin] = doctor.working_hours_end.split(':').map(Number);
    const [apptHour, apptMin] = appointment_time.split(':').map(Number);

    const workStart = workStartHour * 60 + workStartMin;
    const workEnd = workEndHour * 60 + workEndMin;
    const apptTime = apptHour * 60 + apptMin;

    if (apptTime < workStart || apptTime >= workEnd) {
      return res.status(400).json({ 
        error: `Appointment time must be within doctor's working hours (${doctor.working_hours_start} - ${doctor.working_hours_end})` 
      });
    }

    // Check for appointment conflicts
    const existingAppointment = await dbGet(
      `SELECT * FROM appointments 
       WHERE doctor_id = ? 
       AND appointment_date = ? 
       AND appointment_time = ?`,
      [doctor_id, appointment_date, appointment_time]
    );

    if (existingAppointment) {
      return res.status(409).json({ 
        error: 'This time slot is already booked. Please choose another time.' 
      });
    }

    // Check if appointment date is in the past
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const appointmentDate = new Date(appointment_date);
    if (appointmentDate < today) {
      return res.status(400).json({ error: 'Cannot book appointments in the past' });
    }

    // Create appointment
    const result = await dbRun(
      `INSERT INTO appointments (doctor_id, patient_name, appointment_date, appointment_time, user_id, status)
       VALUES (?, ?, ?, ?, ?, 'pending')`,
      [doctor_id, patient_name, appointment_date, appointment_time, user_id]
    );

    // Fetch the created appointment with doctor details
    const appointment = await dbGet(
      `SELECT 
        a.id,
        a.patient_name,
        a.appointment_date,
        a.appointment_time,
        a.status,
        a.created_at,
        d.name as doctor_name,
        d.specialty as doctor_specialty
       FROM appointments a
       JOIN doctors d ON a.doctor_id = d.id
       WHERE a.id = ?`,
      [result.id]
    );

    res.status(201).json({
      message: 'Appointment created successfully',
      appointment: {
        id: appointment.id,
        patientName: appointment.patient_name,
        doctorName: appointment.doctor_name,
        doctorSpecialty: appointment.doctor_specialty,
        date: appointment.appointment_date,
        time: appointment.appointment_time,
        status: appointment.status || 'pending',
        createdAt: appointment.created_at
      }
    });
  } catch (error) {
    console.error('Error creating appointment:', error);
    if (error.message.includes('UNIQUE constraint failed')) {
      return res.status(409).json({ 
        error: 'This time slot is already booked. Please choose another time.' 
      });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all appointments for the logged-in user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const user_id = req.user.id;

    const appointments = await dbAll(
      `SELECT 
        a.id,
        a.patient_name,
        a.appointment_date,
        a.appointment_time,
        a.status,
        a.created_at,
        d.id as doctor_id,
        d.name as doctor_name,
        d.specialty as doctor_specialty
       FROM appointments a
       JOIN doctors d ON a.doctor_id = d.id
       WHERE a.user_id = ?
       ORDER BY a.appointment_date DESC, a.appointment_time DESC`,
      [user_id]
    );

    res.json({
      appointments: appointments.map(apt => ({
        id: apt.id,
        patientName: apt.patient_name,
        doctor: {
          id: apt.doctor_id,
          name: apt.doctor_name,
          specialty: apt.doctor_specialty
        },
        date: apt.appointment_date,
        time: apt.appointment_time,
        status: apt.status || 'pending',
        createdAt: apt.created_at
      }))
    });
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update appointment status
router.patch('/:id/status', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const user_id = req.user.id;

    // Validate status
    const validStatuses = ['pending', 'completed', 'cancelled'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ 
        error: 'Invalid status. Must be one of: pending, completed, cancelled' 
      });
    }

    // Check if appointment exists and belongs to user
    const appointment = await dbGet(
      'SELECT * FROM appointments WHERE id = ? AND user_id = ?',
      [id, user_id]
    );

    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    // Update status
    await dbRun(
      'UPDATE appointments SET status = ? WHERE id = ? AND user_id = ?',
      [status, id, user_id]
    );

    // Fetch updated appointment with doctor details
    const updatedAppointment = await dbGet(
      `SELECT 
        a.id,
        a.patient_name,
        a.appointment_date,
        a.appointment_time,
        a.status,
        a.created_at,
        d.id as doctor_id,
        d.name as doctor_name,
        d.specialty as doctor_specialty
       FROM appointments a
       JOIN doctors d ON a.doctor_id = d.id
       WHERE a.id = ?`,
      [id]
    );

    res.json({
      message: 'Appointment status updated successfully',
      appointment: {
        id: updatedAppointment.id,
        patientName: updatedAppointment.patient_name,
        doctor: {
          id: updatedAppointment.doctor_id,
          name: updatedAppointment.doctor_name,
          specialty: updatedAppointment.doctor_specialty
        },
        date: updatedAppointment.appointment_date,
        time: updatedAppointment.appointment_time,
        status: updatedAppointment.status,
        createdAt: updatedAppointment.created_at
      }
    });
  } catch (error) {
    console.error('Error updating appointment status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;

