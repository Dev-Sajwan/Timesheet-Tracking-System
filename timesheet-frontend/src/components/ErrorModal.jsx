import React from "react";
import { designSystem, globalStyles } from "../styles/designSystem";

export default function ErrorModal({ message, onClose }) {
  if (!message) return null;

  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0,0,0,0.5)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1000
    }}>
      <div style={{
        ...globalStyles.card,
        background: "white",
        width: "400px",
        maxWidth: "90%",
        padding: designSystem.spacing.xl,
        textAlign: "center",
        boxShadow: "0 4px 20px rgba(0,0,0,0.15)"
      }}>
        <div style={{ fontSize: "40px", marginBottom: designSystem.spacing.md }}>⚠️</div>
        <h3 style={{ ...designSystem.typography.h3, color: designSystem.colors.error, marginBottom: designSystem.spacing.sm }}>
          Access Denied / Error
        </h3>
        <p style={{ ...designSystem.typography.body, color: designSystem.colors.textSecondary, marginBottom: designSystem.spacing.lg }}>
          {message}
        </p>
        <button
          style={{
            ...globalStyles.button.primary,
            width: "100%",
            padding: `${designSystem.spacing.sm} ${designSystem.spacing.md}`
          }}
          onClick={onClose}
        >
          OK
        </button>
      </div>
    </div>
  );
}
