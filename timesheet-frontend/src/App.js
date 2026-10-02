import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import Login from "./components/Login";
import EmployeeDashboard from "./components/EmployeeDashboard";
import ManagerDashboard from "./components/ManagerDashboard";
import AdminDashboard from "./components/AdminDashboard";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem("token");
  if (!token) return <Navigate to="/" />;

  try {
    const decoded = jwtDecode(token);
    const userRoles = decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] || [];
    
    // Ensure userRoles is an array for checking
    const rolesArray = Array.isArray(userRoles) ? userRoles : [userRoles];

    const hasRole = allowedRoles.some((r) => rolesArray.includes(r));

    if (!hasRole) {
      return <Navigate to="/" />;
    }

    return children;
  } catch (error) {
    localStorage.removeItem("token");
    return <Navigate to="/" />;
  }
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        
        <Route path="/employee" element={
          <ProtectedRoute allowedRoles={["Employee", "Manager", "Admin"]}>
            <EmployeeDashboard />
          </ProtectedRoute>
        } />
        
        <Route path="/manager" element={
          <ProtectedRoute allowedRoles={["Manager", "Admin"]}>
            <ManagerDashboard />
          </ProtectedRoute>
        } />
        
        <Route path="/admin" element={
          <ProtectedRoute allowedRoles={["Admin"]}>
            <AdminDashboard />
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
}

export default App;
