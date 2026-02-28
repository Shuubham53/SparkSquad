import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext"; 
import StudentLogin from "./pages/StudentLogin";
import StudentRegister from "./pages/StudentRegister";
import CompanyLogin from "./pages/CompanyLogin";
import CompanyRegister from "./pages/CompanyRegister";
import StudentDashboard from "./pages/studentDashboard"; // Folder structure ke hisaab se 's' small rahega
import CompanyDashboard from "./pages/CompanyDashboard";
import LandingPage from "./pages/LandingPage";

function App() {
  const { user, userRole, loading } = useAuth();

  if (loading) return <div className="flex h-screen items-center justify-center">Loading...</div>;

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/student-login" element={<StudentLogin />} />
      <Route path="/student-register" element={<StudentRegister />} />
      <Route path="/company-login" element={<CompanyLogin />} />
      <Route path="/company-register" element={<CompanyRegister />} />
      
      {/* Protected Routes */}
      <Route 
        path="/student-dashboard" 
        element={user && userRole === 'student' ? <StudentDashboard /> : <Navigate to="/student-login" />} 
      />
      <Route 
        path="/company-dashboard" 
        element={user && userRole === 'company' ? <CompanyDashboard /> : <Navigate to="/company-login" />} 
      />
      
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;