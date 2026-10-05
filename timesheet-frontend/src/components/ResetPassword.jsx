import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { resetPassword } from "../Services/Api";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const urlToken = params.get("token");
    const urlEmail = params.get("email");
    
    if (urlToken) setToken(urlToken);
    if (urlEmail) setEmail(urlEmail);
    
    if (!urlToken || !urlEmail) {
      setError("Invalid or missing reset token. Please request a new password reset link.");
    }
  }, [location.search]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!token || !email) {
      setError("Invalid reset link. Please request a new password reset.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      await resetPassword({ email, token, newPassword: password });
      setSuccess("Password has been reset successfully! Redirecting to login...");
      setTimeout(() => navigate("/"), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reset password. The link may have expired.");
    } finally {
      setLoading(false);
    }
  };

  if (!token || !email) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", background: "#f5f6fa" }}>
        <div style={{ background: "white", padding: "40px", borderRadius: "10px", boxShadow: "0px 0px 10px rgba(0,0,0,0.1)", width: "100%", maxWidth: "450px", textAlign: "center" }}>
          <h2 style={{ color: "#2c3e50", marginBottom: "15px" }}>Invalid Reset Link</h2>
          <p style={{ color: "#666", marginBottom: "20px" }}>This password reset link is invalid or has expired.</p>
          <button 
            onClick={() => navigate("/forgot-password")}
            style={{ 
              padding: "12px 24px", 
              background: "#007bff", 
              color: "white", 
              border: "none", 
              borderRadius: "5px", 
              cursor: "pointer",
              fontSize: "16px"
            }}
          >
            Request New Reset Link
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", background: "#f5f6fa" }}>
      <div style={{ background: "white", padding: "40px", borderRadius: "10px", boxShadow: "0px 0px 10px rgba(0,0,0,0.1)", width: "100%", maxWidth: "450px" }}>
        <h2 style={{ textAlign: "center", marginBottom: "10px", color: "#2c3e50" }}>Reset Password</h2>
        <p style={{ textAlign: "center", color: "#666", marginBottom: "30px" }}>Enter your new password below</p>
        
        {error && <div style={{ background: "#f8d7da", color: "#721c24", padding: "10px", borderRadius: "5px", marginBottom: "15px", textAlign: "center" }}>{error}</div>}
        {success && <div style={{ background: "#d4edda", color: "#155724", padding: "10px", borderRadius: "5px", marginBottom: "15px", textAlign: "center" }}>{success}</div>}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "15px" }}>
            <label style={{ display: "block", marginBottom: "5px", fontWeight: "500" }}>New Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ width: "100%", padding: "12px", border: "1px solid #ddd", borderRadius: "5px", fontSize: "14px" }}
              required
              minLength={6}
              autoComplete="new-password"
            />
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", marginBottom: "5px", fontWeight: "500" }}>Confirm New Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
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
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: "20px" }}>
          <p style={{ color: "#666" }}>Remember your password? <button onClick={() => navigate("/")} style={{ background: "none", border: "none", color: "#007bff", cursor: "pointer", fontSize: "14px" }}>Login</button></p>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;