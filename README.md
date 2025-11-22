# Hospital Appointment System

A full-stack hospital appointment system with Express.js backend and React frontend, featuring JWT authentication, doctor management, and appointment scheduling with conflict detection.

## Features

### Backend
- **User Authentication**: Sign up and log in with JWT tokens
- **Doctor Management**: View all available doctors with their specialties and working hours
- **Appointment Scheduling**: Create appointments with automatic conflict detection
- **Data Validation**: Comprehensive validation for all inputs
- **Clean Architecture**: Organized codebase with separation of concerns

### Frontend
- **React SPA**: Modern React application with React Router
- **JWT Authentication**: Secure login/signup with token management
- **Protected Routes**: Automatic redirect for unauthenticated users
- **Responsive Design**: Mobile-friendly UI built with Tailwind CSS
- **Real-time Validation**: Client-side validation with backend integration

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn

## Installation

1. Clone or download this repository

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
```bash
cp .env.example .env
```

4. Edit `.env` and set your JWT secret:
```
JWT_SECRET=your-secret-key-change-this-in-production
PORT=3000
```

5. Initialize the database:
```bash
npm run init-db
```

This will create the SQLite database and populate it with sample doctors.

**Note**: If you have an existing database, run the migration to add the status field:
```bash
npm run migrate
```

## Running the Application

### Backend Server

```bash
npm start
```

The server will start on `http://localhost:3000` (or the port specified in your `.env` file).

### Frontend Application

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:3001`

**Note**: Make sure the backend server is running before starting the frontend.

## API Endpoints

### Authentication

#### Sign Up
```
POST /api/auth/signup
Content-Type: application/json

{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "message": "User created successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com"
  }
}
```

#### Login
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com"
  }
}
```

### Doctors

#### Get All Doctors
```
GET /api/doctors
Authorization: Bearer <token>
```

**Response:**
```json
{
  "doctors": [
    {
      "id": 1,
      "name": "Dr. Sarah Johnson",
      "specialty": "Cardiology",
      "workingHours": {
        "start": "09:00",
        "end": "17:00"
      }
    },
    ...
  ]
}
```

### Appointments

#### Create Appointment
```
POST /api/appointments
Authorization: Bearer <token>
Content-Type: application/json

{
  "doctor_id": 1,
  "patient_name": "Jane Smith",
  "appointment_date": "2024-12-20",
  "appointment_time": "10:00"
}
```

**Response:**
```json
{
  "message": "Appointment created successfully",
  "appointment": {
    "id": 1,
    "patientName": "Jane Smith",
    "doctorName": "Dr. Sarah Johnson",
    "doctorSpecialty": "Cardiology",
    "date": "2024-12-20",
    "time": "10:00",
    "createdAt": "2024-12-15 10:30:00"
  }
}
```

#### Get User's Appointments
```
GET /api/appointments
Authorization: Bearer <token>
```

**Response:**
```json
{
  "appointments": [
    {
      "id": 1,
      "patientName": "Jane Smith",
      "doctor": {
        "id": 1,
        "name": "Dr. Sarah Johnson",
        "specialty": "Cardiology"
      },
      "date": "2024-12-20",
      "time": "10:00",
      "status": "pending",
      "createdAt": "2024-12-15 10:30:00"
    },
    ...
  ]
}
```

#### Update Appointment Status
```
PATCH /api/appointments/:id/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "completed"
}
```

**Valid status values**: `pending`, `completed`, `cancelled`

**Response:**
```json
{
  "message": "Appointment status updated successfully",
  "appointment": {
    "id": 1,
    "patientName": "Jane Smith",
    "doctor": {
      "id": 1,
      "name": "Dr. Sarah Johnson",
      "specialty": "Cardiology"
    },
    "date": "2024-12-20",
    "time": "10:00",
    "status": "completed",
    "createdAt": "2024-12-15 10:30:00"
  }
}
```

## Database Schema

### Users Table
- `id` (INTEGER PRIMARY KEY)
- `username` (TEXT UNIQUE)
- `email` (TEXT UNIQUE)
- `password` (TEXT - hashed)
- `created_at` (DATETIME)

### Doctors Table
- `id` (INTEGER PRIMARY KEY)
- `name` (TEXT)
- `specialty` (TEXT)
- `working_hours_start` (TEXT - format: HH:MM)
- `working_hours_end` (TEXT - format: HH:MM)
- `created_at` (DATETIME)

### Appointments Table
- `id` (INTEGER PRIMARY KEY)
- `doctor_id` (INTEGER - FOREIGN KEY)
- `patient_name` (TEXT)
- `appointment_date` (DATE - format: YYYY-MM-DD)
- `appointment_time` (TIME - format: HH:MM)
- `user_id` (INTEGER - FOREIGN KEY)
- `status` (TEXT - values: 'pending', 'completed', 'cancelled')
- `created_at` (DATETIME)
- UNIQUE constraint on (doctor_id, appointment_date, appointment_time)

## Validation Rules

- **Signup**: Username, email, and password required. Password must be at least 6 characters. Email must be valid format.
- **Login**: Email and password required.
- **Appointments**: 
  - All fields required
  - Date format: YYYY-MM-DD
  - Time format: HH:MM (24-hour)
  - Appointment must be within doctor's working hours
  - Appointments only on weekdays (Monday-Friday)
  - Cannot book appointments in the past
  - Automatic conflict detection prevents double-booking

## Error Handling

The API returns appropriate HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (authentication required)
- `403` - Forbidden (invalid token)
- `404` - Not Found
- `409` - Conflict (appointment slot already booked)
- `500` - Internal Server Error

## Project Structure

```
hospital-appointment-system/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/      # React components
│   │   │   ├── Login.jsx
│   │   │   ├── Doctors.jsx
│   │   │   ├── Appointments.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   ├── context/         # React context
│   │   │   └── AuthContext.jsx
│   │   ├── services/        # API service layer
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
├── config/
│   └── database.js          # Database connection and utilities
├── middleware/
│   ├── auth.js              # JWT authentication middleware
│   └── validation.js        # Request validation middleware
├── routes/
│   ├── auth.js              # Authentication routes
│   ├── doctors.js           # Doctor routes
│   └── appointments.js      # Appointment routes
├── scripts/
│   └── init-db.js           # Database initialization script
├── .env.example             # Environment variables template
├── .gitignore
├── package.json
├── README.md
└── server.js                # Main server file
```

## Security Notes

- Passwords are hashed using bcryptjs
- JWT tokens expire after 24 hours
- All authenticated routes require a valid JWT token
- SQL injection protection through parameterized queries
- Input validation on all endpoints

## Extending the System

The codebase is designed to be easily extensible:

1. **Add new routes**: Create new files in the `routes/` directory and register them in `server.js`
2. **Add new middleware**: Create files in the `middleware/` directory
3. **Add new database tables**: Update `scripts/init-db.js` and create corresponding routes/models
4. **Add new validation**: Extend `middleware/validation.js`

## License

ISC

