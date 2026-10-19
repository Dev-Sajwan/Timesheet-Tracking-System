import { useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";

export default function useInactivityTimeout(timeoutMinutes = 30) {
  const navigate = useNavigate();
  const timerRef = useRef(null);

  const handleLogout = useCallback(() => {
    // Only logout if token actually exists
    const token = localStorage.getItem("token");
    if (!token) return;

    localStorage.removeItem("token");
    localStorage.removeItem("employeeId");
    localStorage.removeItem("fullName");
    localStorage.removeItem("permissions");

    alert("You have been logged out due to 30 minutes of inactivity.");
    navigate("/");
  }, [navigate]);

  const resetTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    const timeoutMs = timeoutMinutes * 60 * 1000;
    timerRef.current = setTimeout(handleLogout, timeoutMs);
  }, [handleLogout, timeoutMinutes]);

  useEffect(() => {
    const events = ["mousemove", "keydown", "click", "scroll", "touchstart"];

    events.forEach((event) => {
      window.addEventListener(event, resetTimer, { passive: true });
    });

    resetTimer();

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      events.forEach((event) => {
        window.removeEventListener(event, resetTimer);
      });
    };
  }, [resetTimer]);
}
