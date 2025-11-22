const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '..', 'hospital.db');
const db = new sqlite3.Database(dbPath);

// Add status column to appointments table if it doesn't exist
db.serialize(() => {
  // Check if column exists by trying to select it
  db.get("PRAGMA table_info(appointments)", (err, row) => {
    if (err) {
      console.error('Error checking table info:', err);
      db.close();
      return;
    }

    // Check all columns to see if status exists
    db.all("PRAGMA table_info(appointments)", (err, columns) => {
      if (err) {
        console.error('Error getting table info:', err);
        db.close();
        return;
      }

      const hasStatusColumn = columns.some(col => col.name === 'status');

      if (!hasStatusColumn) {
        console.log('Adding status column to appointments table...');
        db.run(`
          ALTER TABLE appointments 
          ADD COLUMN status TEXT DEFAULT 'pending'
        `, (err) => {
          if (err) {
            console.error('Error adding status column:', err);
          } else {
            console.log('Status column added successfully!');
            // Update existing appointments to have 'pending' status
            db.run(`
              UPDATE appointments 
              SET status = 'pending' 
              WHERE status IS NULL
            `, (err) => {
              if (err) {
                console.error('Error updating existing appointments:', err);
              } else {
                console.log('Existing appointments updated with default status.');
              }
              db.close();
            });
          }
        });
      } else {
        console.log('Status column already exists. No migration needed.');
        db.close();
      }
    });
  });
});

