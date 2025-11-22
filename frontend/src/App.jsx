import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import Login from './components/Login';
import Doctors from './components/Doctors';
import Appointments from './components/Appointments';
import MyAppointments from './components/MyAppointments';
import AdminDashboard from './components/AdminDashboard';

const AppRoutes = () => {
  const { isAuthenticated, isAdmin } = useAuth();

  return (
    <Routes>
      <Route
        path="/login"
        element={
          isAuthenticated ? (
            <Navigate to={isAdmin ? '/admin' : '/doctors'} replace />
          ) : (
            <Login />
          )
        }
      />
      <Route
        path="/doctors"
        element={
          <ProtectedRoute>
            <Doctors />
          </ProtectedRoute>
        }
      />
      <Route
        path="/appointments"
        element={
          <ProtectedRoute>
            <Appointments />
          </ProtectedRoute>
        }
      />
      <Route
        path="/my-appointments"
        element={
          <ProtectedRoute>
            <MyAppointments />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        }
      />
      <Route
        path="/"
        element={
          <Navigate
            to={isAuthenticated && isAdmin ? '/admin' : '/doctors'}
            replace
          />
        }
      />
      <Route
        path="*"
        element={
          <Navigate
            to={isAuthenticated && isAdmin ? '/admin' : '/doctors'}
            replace
          />
        }
      />
    </Routes>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;

