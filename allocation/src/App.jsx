import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/authContext';
import Login from './pages/';
import StudentDashboard from './pages/studentDashboard';
import CompanyDashboard from './pages/CompanyDashboard';

// Public Route Wrapper (Login page ke liye)
const PublicRoute = ({ children }) => {
  const { user, userRole, loading } = useAuth();
  
  if (loading) return <div className="flex h-screen items-center justify-center">Loading...</div>;
  
  if (user) {
    return userRole === 'company' 
      ? <Navigate to="/company-dashboard" /> 
      : <Navigate to="/student-dashboard" />;
  }
  return children;
};

// Private Route Wrapper (Dashboards ke liye)
const PrivateRoute = ({ children, role }) => {
  const { user, userRole, loading } = useAuth();
  
  if (loading) return <div className="flex h-screen items-center justify-center">Loading...</div>;
  
  if (!user) return <Navigate to="/login" />;
  
  if (role && userRole !== role) {
    return userRole === 'company' 
      ? <Navigate to="/company-dashboard" /> 
      : <Navigate to="/student-dashboard" />;
  }
  
  return children;
};

function App() {
  return (
    <Routes>
      {/* 1. Default Route */}
      <Route path="/" element={
        <PrivateRoute>
          <DashboardSwitch />
        </PrivateRoute>
      } />

      {/* 2. Authentication Route */}
      <Route path="/login" element={
        <PublicRoute>
          <Login />
        </PublicRoute>
      } />

      {/* 3. Student Dashboard Route */}
      <Route path="/student-dashboard" element={
        <PrivateRoute role="student">
          <StudentDashboard />
        </PrivateRoute>
      } />

      {/* 4. Company Dashboard Route */}
      <Route path="/company-dashboard" element={
        <PrivateRoute role="company">
          <CompanyDashboard />
        </PrivateRoute>
      } />

      {/* 5. Catch All - Redirect to Home */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

// Helper component for initial redirection
const DashboardSwitch = () => {
  const { userRole } = useAuth();
  return userRole === 'company' 
    ? <Navigate to="/company-dashboard" /> 
    : <Navigate to="/student-dashboard" />;
};

export default App;