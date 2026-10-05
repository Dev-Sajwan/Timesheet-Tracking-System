import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { forgotPassword } from "../Services/Api";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetToken, setResetToken] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!email) {
      setError("Email is required.");
      return;
    }

    setLoading(true);
    try {
      const response = await forgotPassword({ email });
      
      // In development, we get the token back - in production this would be sent via email
      if (response.data.ResetToken) {
        setResetToken(response.data.ResetToken);
        setSuccess(`Password reset token generated (dev mode): ${response.data.ResetToken}`);
      } else {
        setSuccess("If the email exists, a password reset link has been sent to your email.");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to process request. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", background: "#f5f6fa" }}>
      <div style={{ background: "white", padding: "40px", borderRadius: "10px", boxShadow: "0px 0px 10px rgba(0,0,0,0.1)", width: "100%", maxWidth: "450px" }}>
        <h2 style={{ textAlign: "center", marginBottom: "10px", color: "#2c3e50" }}>Forgot Password</h2>
        <p style={{ textAlign: "center", color: "#666", marginBottom: "30px" }}>Enter your email to receive a password reset link</p>
        
        {error && <div style={{ background: "#f8d7da", color: "#721c24", padding: "10px", borderRadius: "5px", marginBottom: "15px", textAlign: "center" }}>{error}</div>}
        {success && <div style={{ background: "#d4edda", color: "#155724", padding: "10px", borderRadius: "5px", marginBottom: "15px", textAlign: "center" }}>{success}</div>}

        {!resetToken ? (
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", marginBottom: "5px", fontWeight: "500" }}>Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ width: "100%", padding: "12px", border: "1px solid #ddd", borderRadius: "5px", fontSize: "14px" }}
                required
                autoComplete="email"
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              style={{ 
                width: "100%", 
                padding: "12px", 
                background: loading ? "#6c757d" : "#007bff", 
                color: "white", 
                border: "none", 
                borderRadius: "5px", 
                cursor: loading ? "not-allowed" : "pointer",
                fontSize: "16px",
                fontWeight: "500"
              }}
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </button>
          </form>
        ) : (
          <div style={{ marginTop: "20px", padding: "15px", background: "#f8f9fa", borderRadius: "5px" }}>
            <p style={{ marginBottom: "10px", fontWeight: "500" }}>Development Mode - Reset Token:</p>
            <div style={{ 
              background: "#fff", 
              padding: "10px", 
              borderRadius: "4px", 
              border: "1px solid #ddd",
              fontFamily: "monospace",
              fontSize: "12px",
              wordBreak: "break-all",
              marginBottom: "15px"
            }}>
              {resetToken}
            </div>
            <button 
              onClick={() => navigate(`/reset-password?token=${encodeURIComponent(resetToken)}&email=${encodeURIComponent(email)}`)}
              style={{ 
                width: "100%", 
                padding: "12px", 
                background: "#28a745", 
                color: "white", 
                border: "none", 
                borderRadius: "5px", 
                cursor: "pointer",
                fontSize: "16px",
                fontWeight: "500"
              }}
            >
              Proceed to Reset Password
            </button>
          </div>
        )}

        <div style={{ textAlign: "center", marginTop: "20px" }}>
          <Link to="/" style={{ color: "#007bff", textDecoration: "none" }}>← Back to Login</Link>
        </div>
        <div style={{ textAlign: "center", marginTop: "10px" }}>
          <Link to="/register" style={{ color: "#007bff", textDecoration: "none" }}>Create an account</Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;