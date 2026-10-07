import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login } from "../Services/Api";
import { jwtDecode } from "jwt-decode";
import { designSystem, globalStyles } from "../styles/designSystem";

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

  const inputStyle = {
    ...globalStyles.input,
    marginBottom: designSystem.spacing.md,
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        background: `linear-gradient(135deg, ${designSystem.colors.primary} 0%, ${designSystem.colors.primaryDark} 100%)`,
        padding: designSystem.spacing.md,
      }}
    >
      <div
        style={{
          background: designSystem.colors.surface,
          borderRadius: designSystem.radius,
          boxShadow: designSystem.shadows.lg,
          padding: designSystem.spacing.xl,
          width: "100%",
          maxWidth: "420px",
        }}
      >
        <h2 style={{ 
          textAlign: "center", 
          marginBottom: designSystem.spacing.sm,
          color: designSystem.colors.text,
          ...designSystem.typography.h1,
        }}>
          Employee Dashboard
        </h2>
        <p style={{ 
          textAlign: "center", 
          color: designSystem.colors.textSecondary,
          marginBottom: designSystem.spacing.lg,
          ...designSystem.typography.body,
        }}>
          Sign in to your account
        </p>
        
        {error && (
          <div style={{
            background: '#FFEBEE',
            color: designSystem.colors.error,
            padding: designSystem.spacing.sm,
            borderRadius: designSystem.radius,
            marginBottom: designSystem.spacing.md,
            textAlign: "center",
            fontSize: "14px",
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: designSystem.spacing.md }}>
            <label style={{ 
              display: "block", 
              marginBottom: "4px",
              color: designSystem.colors.text,
              ...designSystem.typography.bodyMedium,
            }}>
              Username
            </label>
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              style={inputStyle}
              placeholder="Enter your username"
              required
            />
          </div>

          <div style={{ marginBottom: designSystem.spacing.lg }}>
            <label style={{ 
              display: "block", 
              marginBottom: "4px",
              color: designSystem.colors.text,
              ...designSystem.typography.bodyMedium,
            }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={inputStyle}
              placeholder="Enter your password"
              required
            />
          </div>

          <button
            type="submit"
            style={{
              ...globalStyles.button.primary,
              width: "100%",
              marginBottom: designSystem.spacing.md,
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = "translateY(-1px)";
              e.currentTarget.style.boxShadow = designSystem.shadows.md;
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = designSystem.shadows.sm;
            }}
          >
            Login
          </button>
        </form>

        <div style={{ textAlign: "center" }}>
          <p style={{ color: designSystem.colors.textSecondary, ...designSystem.typography.body }}>
            Forgot password?{" "}
            <Link 
              to="/forgot-password" 
              style={{ 
                color: designSystem.colors.primary, 
                textDecoration: "none",
                fontWeight: 500,
              }}
            >
              Reset it
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;