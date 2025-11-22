# Hospital Appointment System - Frontend

A React frontend for the Hospital Appointment System, featuring authentication, doctor listings, and appointment booking.

## Features

- **JWT Authentication** - Secure login and signup with token-based authentication
- **Protected Routes** - Automatic redirect to login for unauthenticated users
- **Doctor Listings** - View all available doctors with specialties and working hours
- **Appointment Booking** - Select doctor, date, and time to book appointments
- **Mobile-Friendly** - Responsive design that works on all devices
- **Clean UI** - Modern, minimal interface built with Tailwind CSS

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Backend API running on `http://localhost:3000`

## Installation

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file (optional, defaults to localhost:3000):
```bash
VITE_API_URL=http://localhost:3000/api
```

## Running the Application

Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3001`

## Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── Login.jsx          # Login/Signup component
│   │   ├── Doctors.jsx        # Doctors listing page
│   │   ├── Appointments.jsx   # Appointment booking page
│   │   └── ProtectedRoute.jsx # Route protection component
│   ├── context/
│   │   └── AuthContext.jsx    # Authentication context
│   ├── services/
│   │   └── api.js             # API service layer
│   ├── App.jsx                # Main app component with routing
│   ├── main.jsx               # Entry point
│   └── index.css              # Global styles
├── index.html
├── package.json
├── vite.config.js
└── tailwind.config.js
```

## Usage

### Login/Signup
- Navigate to `/login`
- Toggle between login and signup modes
- Enter credentials to authenticate
- JWT token is stored in localStorage

### View Doctors
- After login, you'll see the doctors page
- All available doctors are displayed with their specialties and working hours
- Click "Book Appointment" to schedule with a specific doctor

### Book Appointment
- Select a doctor from the dropdown
- Enter patient name
- Choose a date (must be a future weekday)
- Select a time slot (based on doctor's working hours)
- Submit to create the appointment
- The system automatically checks for conflicts

## State Management

- **AuthContext** - Manages user authentication state and JWT token
- **localStorage** - Stores JWT token and user data for persistence
- **React Hooks** - Component-level state management

## API Integration

The frontend communicates with the backend API through the `api.js` service layer:
- Automatic token injection in request headers
- Automatic redirect to login on 401/403 errors
- Centralized error handling

## Styling

The application uses Tailwind CSS for styling:
- Responsive design with mobile-first approach
- Gradient backgrounds and modern UI components
- Consistent color scheme (purple/indigo theme)

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Notes

- The JWT token expires after 24 hours (as configured in the backend)
- Users are automatically logged out on token expiration
- All API calls include authentication headers automatically
- Protected routes redirect to login if user is not authenticated

