import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login } from "../Services/Api";
import { jwtDecode } from "jwt-decode";

const Login = () => {
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await login({ userName, password });
      const { token } = response.data;
      localStorage.setItem("token", token);
      
      const decoded = jwtDecode(token);
      
      // Store employee information from claims if available
      if (decoded.employeeId) {
         localStorage.setItem("employeeId", decoded.employeeId);
      }
      if (decoded.fullName) {
         localStorage.setItem("fullName", decoded.fullName);
      }

      const userRoles = decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] || [];
      const rolesArray = Array.isArray(userRoles) ? userRoles : [userRoles];

      if (rolesArray.includes("Admin")) {
        navigate("/admin");
      } else if (rolesArray.includes("Manager")) {
        navigate("/manager");
      } else if (rolesArray.includes("Employee")) {
        navigate("/employee");
      } else {
        setError("You do not have an assigned role.");
      }
    } catch (err) {
      setError("Invalid username or password.");
    }
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", background: "#f5f6fa" }}>
      <div style={{ background: "white", padding: "40px", borderRadius: "10px", boxShadow: "0px 0px 10px rgba(0,0,0,0.1)", width: "350px" }}>
        <h2 style={{ textAlign: "center", marginBottom: "20px" }}>Login</h2>
        {error && <p style={{ color: "red", textAlign: "center" }}>{error}</p>}
        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: "15px" }}>
            <label>Username</label>
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              style={{ width: "100%", padding: "10px", marginTop: "5px", border: "1px solid #ccc", borderRadius: "5px" }}
              required
            />
          </div>
          <div style={{ marginBottom: "20px" }}>
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ width: "100%", padding: "10px", marginTop: "5px", border: "1px solid #ccc", borderRadius: "5px" }}
              required
            />
          </div>
          <button type="submit" style={{ width: "100%", padding: "10px", background: "#007bff", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}>
            Login
          </button>
        </form>
        <div style={{ textAlign: "center", marginTop: "20px" }}>
          {/* <p style={{ color: "#666", marginBottom: "10px" }}>Don't have an account? <Link to="/register" style={{ color: "#007bff", textDecoration: "none", fontWeight: "500" }}>Register</Link></p> */}
          <p style={{ color: "#666" }}>Forgot password? <Link to="/forgot-password" style={{ color: "#007bff", textDecoration: "none", fontWeight: "500" }}>Reset it</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Login;
