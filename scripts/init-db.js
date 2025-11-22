const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');

const dbPath = path.join(__dirname, '..', 'hospital.db');
const db = new sqlite3.Database(dbPath);

// Initialize database tables
db.serialize(() => {
  // Users table
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT DEFAULT 'user',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Doctors table
  db.run(`
    CREATE TABLE IF NOT EXISTS doctors (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      specialty TEXT NOT NULL,
      working_hours_start TEXT NOT NULL,
      working_hours_end TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Appointments table
  db.run(`
    CREATE TABLE IF NOT EXISTS appointments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      doctor_id INTEGER NOT NULL,
      patient_name TEXT NOT NULL,
      appointment_date DATE NOT NULL,
      appointment_time TIME NOT NULL,
      user_id INTEGER NOT NULL,
      status TEXT DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (doctor_id) REFERENCES doctors(id),
      FOREIGN KEY (user_id) REFERENCES users(id),
      UNIQUE(doctor_id, appointment_date, appointment_time)
    )
  `);

  // Create indexes for better query performance
  db.run(`CREATE INDEX IF NOT EXISTS idx_appointments_doctor_date ON appointments(doctor_id, appointment_date, appointment_time)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_appointments_user ON appointments(user_id)`);

  // Insert sample doctors
  const doctors = [
    { name: 'Dr. Sarah Johnson', specialty: 'Cardiology', start: '09:00', end: '17:00' },
    { name: 'Dr. Michael Chen', specialty: 'Pediatrics', start: '08:00', end: '16:00' },
    { name: 'Dr. Emily Rodriguez', specialty: 'Dermatology', start: '10:00', end: '18:00' },
    { name: 'Dr. James Wilson', specialty: 'Orthopedics', start: '09:00', end: '17:00' },
    { name: 'Dr. Lisa Anderson', specialty: 'Neurology', start: '08:30', end: '16:30' }
  ];

  const stmt = db.prepare(`
    INSERT OR IGNORE INTO doctors (name, specialty, working_hours_start, working_hours_end)
    VALUES (?, ?, ?, ?)
  `);

  doctors.forEach(doctor => {
    stmt.run(doctor.name, doctor.specialty, doctor.start, doctor.end);
  });

  stmt.finalize();

  // Create default admin user (password: admin123)
  bcrypt.hash('admin123', 10, (err, hashedPassword) => {
    if (err) {
      console.error('Error hashing admin password:', err);
    } else {
      db.run(`
        INSERT OR IGNORE INTO users (username, email, password, role)
        VALUES ('admin', 'admin@hospital.com', ?, 'admin')
      `, [hashedPassword], (err) => {
        if (err) {
          console.error('Error creating admin user:', err);
        } else {
          console.log('Default admin user created:');
          console.log('  Email: admin@hospital.com');
          console.log('  Password: admin123');
        }
      });
    }
  });

  console.log('Database initialized successfully!');
  console.log('Sample doctors added.');
  
  db.close((err) => {
    if (err) {
      console.error('Error closing database:', err);
    } else {
      console.log('Database connection closed.');
    }
  });
});

