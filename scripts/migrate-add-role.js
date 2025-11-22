const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');

const dbPath = path.join(__dirname, '..', 'hospital.db');
const db = new sqlite3.Database(dbPath);

// Add role column to users table if it doesn't exist
db.serialize(() => {
  // Check if column exists
  db.all("PRAGMA table_info(users)", (err, columns) => {
    if (err) {
      console.error('Error getting table info:', err);
      db.close();
      return;
    }

    const hasRoleColumn = columns.some(col => col.name === 'role');

    if (!hasRoleColumn) {
      console.log('Adding role column to users table...');
      db.run(`
        ALTER TABLE users 
        ADD COLUMN role TEXT DEFAULT 'user'
      `, (err) => {
        if (err) {
          console.error('Error adding role column:', err);
          db.close();
        } else {
          console.log('Role column added successfully!');
          // Update existing users to have 'user' role
          db.run(`
            UPDATE users 
            SET role = 'user' 
            WHERE role IS NULL
          `, (err) => {
            if (err) {
              console.error('Error updating existing users:', err);
            } else {
              console.log('Existing users updated with default role.');
            }
            
            // Create default admin user if it doesn't exist
            bcrypt.hash('admin123', 10, (err, hashedPassword) => {
              if (err) {
                console.error('Error hashing admin password:', err);
                db.close();
                return;
              }
              
              db.get('SELECT * FROM users WHERE email = ?', ['admin@hospital.com'], (err, user) => {
                if (err) {
                  console.error('Error checking admin user:', err);
                  db.close();
                  return;
                }
                
                if (!user) {
                  db.run(`
                    INSERT INTO users (username, email, password, role)
                    VALUES ('admin', 'admin@hospital.com', ?, 'admin')
                  `, [hashedPassword], (err) => {
                    if (err) {
                      console.error('Error creating admin user:', err);
                    } else {
                      console.log('Default admin user created:');
                      console.log('  Email: admin@hospital.com');
                      console.log('  Password: admin123');
                    }
                    db.close();
                  });
                } else {
                  // Update existing admin user role if needed
                  db.run(`
                    UPDATE users 
                    SET role = 'admin' 
                    WHERE email = 'admin@hospital.com'
                  `, (err) => {
                    if (err) {
                      console.error('Error updating admin user:', err);
                    } else {
                      console.log('Admin user role updated.');
                    }
                    db.close();
                  });
                }
              });
            });
          });
        }
      });
    } else {
      console.log('Role column already exists.');
      // Check if admin user exists
      db.get('SELECT * FROM users WHERE email = ?', ['admin@hospital.com'], (err, user) => {
        if (err) {
          console.error('Error checking admin user:', err);
          db.close();
          return;
        }
        
        if (!user) {
          bcrypt.hash('admin123', 10, (err, hashedPassword) => {
            if (err) {
              console.error('Error hashing admin password:', err);
              db.close();
              return;
            }
            
            db.run(`
              INSERT INTO users (username, email, password, role)
              VALUES ('admin', 'admin@hospital.com', ?, 'admin')
            `, [hashedPassword], (err) => {
              if (err) {
                console.error('Error creating admin user:', err);
              } else {
                console.log('Default admin user created:');
                console.log('  Email: admin@hospital.com');
                console.log('  Password: admin123');
              }
              db.close();
            });
          });
        } else {
          console.log('Admin user already exists.');
          db.close();
        }
      });
    }
  });
});

