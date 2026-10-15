import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import Login from "./components/Login";
// import Register from "./components/Register";
import ForgotPassword from "./components/ForgotPassword";
import ResetPassword from "./components/ResetPassword";
import UnifiedDashboard from "./components/UnifiedDashboard";
import PermissionManager from "./components/PermissionManager";

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  if (!token) return <Navigate to="/" />;
  return children;
};

const AdminProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  if (!token) return <Navigate to="/" />;
  
  try {
    const decoded = jwtDecode(token);
    const roles = decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] || [];
    const rolesArray = Array.isArray(roles) ? roles : [roles];
    // Admin access: L1 role or has System Admin profile (IsSystemAdmin claim)
    const isAdmin = rolesArray.includes("L1") || decoded["IsSystemAdmin"] === "true" || decoded["isSystemAdmin"] === "true";
    if (!isAdmin) return <Navigate to="/dashboard" />;
  } catch (e) {
    return <Navigate to="/dashboard" />;
  }
  
  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <UnifiedDashboard />
          </ProtectedRoute>
        } />
        
        <Route path="/admin/permissions" element={
          <AdminProtectedRoute>
            <PermissionManager />
          </AdminProtectedRoute>
        } />

        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>
    </Router>
  );
}

export default App;
