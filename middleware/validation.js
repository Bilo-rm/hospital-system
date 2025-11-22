const validateSignup = (req, res, next) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Username, email, and password are required' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters long' });
  }

  if (!email.includes('@')) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  next();
};

const validateLogin = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  next();
};

const validateAppointment = (req, res, next) => {
  const { doctor_id, patient_name, appointment_date, appointment_time } = req.body;

  if (!doctor_id || !patient_name || !appointment_date || !appointment_time) {
    return res.status(400).json({ 
      error: 'doctor_id, patient_name, appointment_date, and appointment_time are required' 
    });
  }

  // Validate date format (YYYY-MM-DD)
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(appointment_date)) {
    return res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD' });
  }

  // Validate time format (HH:MM)
  const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
  if (!timeRegex.test(appointment_time)) {
    return res.status(400).json({ error: 'Invalid time format. Use HH:MM (24-hour format)' });
  }

  next();
};

module.exports = {
  validateSignup,
  validateLogin,
  validateAppointment
};

