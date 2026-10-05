import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { register } from "../Services/Api";

const Register = () => {
  const [formData, setFormData] = useState({
    userName: "",
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
    department: ""
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      const response = await register({
        userName: formData.userName,
        email: formData.email,
        password: formData.password,
        fullName: formData.fullName,
        department: formData.department
      });
      setSuccess("Registration successful! Redirecting to login...");
      setTimeout(() => navigate("/"), 2000);
    } catch (err) {
      if (err.response?.data?.Errors) {
        setError(err.response.data.Errors.map(e => e.Description).join(", "));
      } else {
        setError(err.response?.data?.message || "Registration failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", background: "#f5f6fa" }}>
      <div style={{ background: "white", padding: "40px", borderRadius: "10px", boxShadow: "0px 0px 10px rgba(0,0,0,0.1)", width: "100%", maxWidth: "450px" }}>
        <h2 style={{ textAlign: "center", marginBottom: "20px", color: "#2c3e50" }}>Create Account</h2>
        <p style={{ textAlign: "center", color: "#666", marginBottom: "20px" }}>Register as an Employee</p>
        
        {error && <div style={{ background: "#f8d7da", color: "#721c24", padding: "10px", borderRadius: "5px", marginBottom: "15px", textAlign: "center" }}>{error}</div>}
        {success && <div style={{ background: "#d4edda", color: "#155724", padding: "10px", borderRadius: "5px", marginBottom: "15px", textAlign: "center" }}>{success}</div>}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "15px" }}>
            <label style={{ display: "block", marginBottom: "5px", fontWeight: "500" }}>Username</label>
            <input
              type="text"
              name="userName"
              value={formData.userName}
              onChange={handleChange}
              style={{ width: "100%", padding: "12px", border: "1px solid #ddd", borderRadius: "5px", fontSize: "14px" }}
              required
              autoComplete="username"
            />
          </div>

          <div style={{ marginBottom: "15px" }}>
            <label style={{ display: "block", marginBottom: "5px", fontWeight: "500" }}>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              style={{ width: "100%", padding: "12px", border: "1px solid #ddd", borderRadius: "5px", fontSize: "14px" }}
              required
              autoComplete="email"
            />
          </div>

          <div style={{ marginBottom: "15px" }}>
            <label style={{ display: "block", marginBottom: "5px", fontWeight: "500" }}>Full Name</label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              style={{ width: "100%", padding: "12px", border: "1px solid #ddd", borderRadius: "5px", fontSize: "14px" }}
              required
              autoComplete="name"
            />
          </div>

          <div style={{ marginBottom: "15px" }}>
            <label style={{ display: "block", marginBottom: "5px", fontWeight: "500" }}>Department</label>
            <input
              type="text"
              name="department"
              value={formData.department}
              onChange={handleChange}
              style={{ width: "100%", padding: "12px", border: "1px solid #ddd", borderRadius: "5px", fontSize: "14px" }}
              placeholder="e.g., IT, HR, Finance"
              autoComplete="off"
            />
          </div>

          <div style={{ marginBottom: "15px" }}>
            <label style={{ display: "block", marginBottom: "5px", fontWeight: "500" }}>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              style={{ width: "100%", padding: "12px", border: "1px solid #ddd", borderRadius: "5px", fontSize: "14px" }}
              required
              minLength={6}
              autoComplete="new-password"
            />
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", marginBottom: "5px", fontWeight: "500" }}>Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              style={{ width: "100%", padding: "12px", border: "1px solid #ddd", borderRadius: "5px", fontSize: "14px" }}
              required
              autoComplete="new-password"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            style={{ 
              width: "100%", 
              padding: "12px", 
              background: loading ? "#6c757d" : "#28a745", 
              color: "white", 
              border: "none", 
              borderRadius: "5px", 
              cursor: loading ? "not-allowed" : "pointer",
              fontSize: "16px",
              fontWeight: "500"
            }}
          >
            {loading ? "Creating Account..." : "Register"}
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: "20px", color: "#666" }}>
          Already have an account? <Link to="/" style={{ color: "#007bff", textDecoration: "none", fontWeight: "500" }}>Login</Link>
        </p>
        <p style={{ textAlign: "center", marginTop: "10px", color: "#666" }}>
          Forgot password? <Link to="/forgot-password" style={{ color: "#007bff", textDecoration: "none", fontWeight: "500" }}>Reset it</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;