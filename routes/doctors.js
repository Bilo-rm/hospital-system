const express = require('express');
const router = express.Router();
const { dbAll } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

// Get all doctors
router.get('/', authenticateToken, async (req, res) => {
  try {
    const doctors = await dbAll(`
      SELECT 
        id,
        name,
        specialty,
        working_hours_start,
        working_hours_end
      FROM doctors
      ORDER BY name
    `);

    res.json({
      doctors: doctors.map(doctor => ({
        id: doctor.id,
        name: doctor.name,
        specialty: doctor.specialty,
        workingHours: {
          start: doctor.working_hours_start,
          end: doctor.working_hours_end
        }
      }))
    });
  } catch (error) {
    console.error('Error fetching doctors:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;

