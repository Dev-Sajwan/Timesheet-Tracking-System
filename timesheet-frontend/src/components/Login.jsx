import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login, getMyPermissions } from "../Services/Api";
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
        
        // Log full response for debugging
        console.log("Login API response:", response);
        console.log("Response status:", response.status);
        console.log("Response data:", response.data);
        
        // Check if we got a valid response
        if (!response || !response.data) {
          throw new Error("Invalid response from server");
        }
        
        // ASP.NET Core serializes as camelCase by default, so the property is 'token' not 'Token'
        const token = response.data.token || response.data.Token;
        if (!token || typeof token !== 'string') {
          console.error("Token not found or invalid type. Response data keys:", Object.keys(response.data));
          throw new Error("No valid token received from server");
        }
        
        // Log token info for debugging (without exposing the token itself)
        console.log("Login successful, token received:", `length: ${token.length}`);
        
        localStorage.setItem("token", token);
        
        let decoded;
        try {
          decoded = jwtDecode(token);
          console.log("Token decoded successfully");
        } catch (decodeError) {
          console.error("Token decoding failed:", decodeError);
          throw new Error("Invalid token received");
        }
        
        if (decoded.employeeId) {
           localStorage.setItem("employeeId", decoded.employeeId);
        }
        if (decoded.fullName) {
           localStorage.setItem("fullName", decoded.fullName);
        }

        const userRoles = decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] || [];
        const rolesArray = Array.isArray(userRoles) ? userRoles : [userRoles];
        console.log("User roles:", userRoles);

        // Fetch dynamic permissions
        try {
          const permsRes = await getMyPermissions();
          localStorage.setItem("permissions", JSON.stringify(permsRes.data));
          console.log("Permissions loaded successfully");
        } catch (e) {
          console.error("Failed to load permissions", e);
          localStorage.setItem("permissions", JSON.stringify([]));
        }

        navigate("/dashboard");
      } catch (err) {
        console.error("Login error:", err);
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