const express = require('express');
const router = express.Router();
const { dbGet, dbRun, dbAll } = require('../config/database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// All admin routes require authentication and admin role
router.use(authenticateToken);
router.use(requireAdmin);

// Get dashboard statistics
router.get('/stats', async (req, res) => {
  try {
    const [totalUsers, totalDoctors, totalAppointments, pendingAppointments, completedAppointments] = await Promise.all([
      dbGet('SELECT COUNT(*) as count FROM users WHERE role = ?', ['user']),
      dbGet('SELECT COUNT(*) as count FROM doctors'),
      dbGet('SELECT COUNT(*) as count FROM appointments'),
      dbGet('SELECT COUNT(*) as count FROM appointments WHERE status = ?', ['pending']),
      dbGet('SELECT COUNT(*) as count FROM appointments WHERE status = ?', ['completed'])
    ]);

    res.json({
      stats: {
        totalUsers: totalUsers.count,
        totalDoctors: totalDoctors.count,
        totalAppointments: totalAppointments.count,
        pendingAppointments: pendingAppointments.count,
        completedAppointments: completedAppointments.count,
        cancelledAppointments: totalAppointments.count - pendingAppointments.count - completedAppointments.count
      }
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all users
router.get('/users', async (req, res) => {
  try {
    const users = await dbAll(
      `SELECT id, username, email, role, created_at 
       FROM users 
       WHERE role = 'user'
       ORDER BY created_at DESC`
    );

    res.json({ users });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all appointments
router.get('/appointments', async (req, res) => {
  try {
    const appointments = await dbAll(
      `SELECT 
        a.id,
        a.patient_name,
        a.appointment_date,
        a.appointment_time,
        a.status,
        a.created_at,
        u.id as user_id,
        u.username as user_username,
        u.email as user_email,
        d.id as doctor_id,
        d.name as doctor_name,
        d.specialty as doctor_specialty
       FROM appointments a
       JOIN users u ON a.user_id = u.id
       JOIN doctors d ON a.doctor_id = d.id
       ORDER BY a.appointment_date DESC, a.appointment_time DESC`
    );

    res.json({
      appointments: appointments.map(apt => ({
        id: apt.id,
        patientName: apt.patient_name,
        date: apt.appointment_date,
        time: apt.appointment_time,
        status: apt.status || 'pending',
        createdAt: apt.created_at,
        user: {
          id: apt.user_id,
          username: apt.user_username,
          email: apt.user_email
        },
        doctor: {
          id: apt.doctor_id,
          name: apt.doctor_name,
          specialty: apt.doctor_specialty
        }
      }))
    });
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update appointment status (admin can update any appointment)
router.patch('/appointments/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'completed', 'cancelled'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ 
        error: 'Invalid status. Must be one of: pending, completed, cancelled' 
      });
    }

    const appointment = await dbGet('SELECT * FROM appointments WHERE id = ?', [id]);
    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    await dbRun(
      'UPDATE appointments SET status = ? WHERE id = ?',
      [status, id]
    );

    const updatedAppointment = await dbGet(
      `SELECT 
        a.id,
        a.patient_name,
        a.appointment_date,
        a.appointment_time,
        a.status,
        a.created_at,
        u.id as user_id,
        u.username as user_username,
        u.email as user_email,
        d.id as doctor_id,
        d.name as doctor_name,
        d.specialty as doctor_specialty
       FROM appointments a
       JOIN users u ON a.user_id = u.id
       JOIN doctors d ON a.doctor_id = d.id
       WHERE a.id = ?`,
      [id]
    );

    res.json({
      message: 'Appointment status updated successfully',
      appointment: {
        id: updatedAppointment.id,
        patientName: updatedAppointment.patient_name,
        date: updatedAppointment.appointment_date,
        time: updatedAppointment.appointment_time,
        status: updatedAppointment.status,
        createdAt: updatedAppointment.created_at,
        user: {
          id: updatedAppointment.user_id,
          username: updatedAppointment.user_username,
          email: updatedAppointment.user_email
        },
        doctor: {
          id: updatedAppointment.doctor_id,
          name: updatedAppointment.doctor_name,
          specialty: updatedAppointment.doctor_specialty
        }
      }
    });
  } catch (error) {
    console.error('Error updating appointment status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete appointment
router.delete('/appointments/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const appointment = await dbGet('SELECT * FROM appointments WHERE id = ?', [id]);
    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    await dbRun('DELETE FROM appointments WHERE id = ?', [id]);

    res.json({ message: 'Appointment deleted successfully' });
  } catch (error) {
    console.error('Error deleting appointment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all doctors
router.get('/doctors', async (req, res) => {
  try {
    const doctors = await dbAll(
      `SELECT id, name, specialty, working_hours_start, working_hours_end, created_at
       FROM doctors
       ORDER BY name`
    );

    res.json({ doctors });
  } catch (error) {
    console.error('Error fetching doctors:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create doctor
router.post('/doctors', async (req, res) => {
  try {
    const { name, specialty, working_hours_start, working_hours_end } = req.body;

    if (!name || !specialty || !working_hours_start || !working_hours_end) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const result = await dbRun(
      `INSERT INTO doctors (name, specialty, working_hours_start, working_hours_end)
       VALUES (?, ?, ?, ?)`,
      [name, specialty, working_hours_start, working_hours_end]
    );

    const doctor = await dbGet('SELECT * FROM doctors WHERE id = ?', [result.id]);

    res.status(201).json({
      message: 'Doctor created successfully',
      doctor: {
        id: doctor.id,
        name: doctor.name,
        specialty: doctor.specialty,
        workingHours: {
          start: doctor.working_hours_start,
          end: doctor.working_hours_end
        },
        createdAt: doctor.created_at
      }
    });
  } catch (error) {
    console.error('Error creating doctor:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update doctor
router.put('/doctors/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, specialty, working_hours_start, working_hours_end } = req.body;

    const doctor = await dbGet('SELECT * FROM doctors WHERE id = ?', [id]);
    if (!doctor) {
      return res.status(404).json({ error: 'Doctor not found' });
    }

    await dbRun(
      `UPDATE doctors 
       SET name = ?, specialty = ?, working_hours_start = ?, working_hours_end = ?
       WHERE id = ?`,
      [name || doctor.name, specialty || doctor.specialty, 
       working_hours_start || doctor.working_hours_start, 
       working_hours_end || doctor.working_hours_end, id]
    );

    const updatedDoctor = await dbGet('SELECT * FROM doctors WHERE id = ?', [id]);

    res.json({
      message: 'Doctor updated successfully',
      doctor: {
        id: updatedDoctor.id,
        name: updatedDoctor.name,
        specialty: updatedDoctor.specialty,
        workingHours: {
          start: updatedDoctor.working_hours_start,
          end: updatedDoctor.working_hours_end
        },
        createdAt: updatedDoctor.created_at
      }
    });
  } catch (error) {
    console.error('Error updating doctor:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete doctor
router.delete('/doctors/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const doctor = await dbGet('SELECT * FROM doctors WHERE id = ?', [id]);
    if (!doctor) {
      return res.status(404).json({ error: 'Doctor not found' });
    }

    // Check if doctor has appointments
    const appointments = await dbGet('SELECT COUNT(*) as count FROM appointments WHERE doctor_id = ?', [id]);
    if (appointments.count > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete doctor with existing appointments. Please delete or reassign appointments first.' 
      });
    }

    await dbRun('DELETE FROM doctors WHERE id = ?', [id]);

    res.json({ message: 'Doctor deleted successfully' });
  } catch (error) {
    console.error('Error deleting doctor:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;

