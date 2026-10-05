import React, { useEffect, useState } from "react";
import { getHolidays, addHoliday, deleteHoliday } from "../Services/Api";
import { jwtDecode } from "jwt-decode";

export default function HolidayList() {
  const [holidays, setHolidays] = useState([]);
  const [newHoliday, setNewHoliday] = useState({ date: "", description: "" });
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");
  const [canEdit, setCanEdit] = useState(false);

  useEffect(() => {
    checkPermissions();
    loadHolidays();
  }, []);

  const checkPermissions = () => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        const userRoles = decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] || [];
        const rolesArray = Array.isArray(userRoles) ? userRoles : [userRoles];
        setCanEdit(rolesArray.includes("Admin") || rolesArray.includes("Manager"));
      } catch (e) {
        setCanEdit(false);
      }
    }
  };

  const loadHolidays = async () => {
    try {
      const res = await getHolidays();
      setHolidays(res.data);
    } catch (e) {
      setError("Failed to load holidays");
    }
  };

  const handleAddHoliday = async () => {
    if (!newHoliday.date || !newHoliday.description) {
      setError("Date and description are required");
      return;
    }
    setError("");
    try {
      await addHoliday(newHoliday);
      setNewHoliday({ date: "", description: "" });
      setShowForm(false);
      loadHolidays();
    } catch (e) {
      setError(e.response?.data?.message || "Failed to add holiday");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this holiday?")) return;
    try {
      await deleteHoliday(id);
      loadHolidays();
    } catch (e) {
      setError(e.response?.data?.message || "Failed to delete holiday");
    }
  };

  const isWeekend = (date) => {
    const day = new Date(date).getDay();
    return day === 0 || day === 6;
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Holiday Management</h2>
      {!canEdit && <p style={{ color: "#666", fontStyle: "italic" }}>View only - Contact Admin/Manager to modify holidays</p>}
      
      {error && <div style={{ background: "#f8d7da", color: "#721c24", padding: "10px", borderRadius: "5px", marginBottom: "15px" }}>{error}</div>}

      {/* Add Holiday Form - Only for Admin/Manager */}
      {canEdit && (
        <>
          <button onClick={() => setShowForm(!showForm)} style={{ marginBottom: "15px", padding: "10px 15px", background: "#28a745", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}>
            {showForm ? "Cancel" : "➕ Add Holiday"}
          </button>

          {showForm && (
            <div style={{ marginTop: "15px", border: "1px solid #ccc", padding: "15px", borderRadius: "5px", background: "#f8f9fa" }}>
              <div style={{ marginBottom: "10px" }}>
                <label style={{ display: "block", marginBottom: "5px" }}>Date</label>
                <input
                  type="date"
                  value={newHoliday.date}
                  onChange={(e) => setNewHoliday({ ...newHoliday, date: e.target.value })}
                  style={{ width: "250px", padding: "8px", border: "1px solid #ccc", borderRadius: "4px" }}
                />
              </div>
              <div style={{ marginBottom: "10px" }}>
                <label style={{ display: "block", marginBottom: "5px" }}>Description</label>
                <input
                  type="text"
                  value={newHoliday.description}
                  onChange={(e) => setNewHoliday({ ...newHoliday, description: e.target.value })}
                  style={{ width: "400px", padding: "8px", border: "1px solid #ccc", borderRadius: "4px" }}
                />
              </div>
              <button onClick={handleAddHoliday} style={{ padding: "8px 16px", background: "#007bff", color: "white", border: "none", borderRadius: "4px", marginRight: "10px" }}>Save</button>
              <button onClick={() => setShowForm(false)} style={{ padding: "8px 16px", background: "#6c757d", color: "white", border: "none", borderRadius: "4px" }}>Cancel</button>
            </div>
          )}
        </>
      )}

      {/* Holiday List */}
      <table border="1" width="100%" cellPadding="10" style={{ borderCollapse: "collapse", marginTop: "20px" }}>
        <thead>
          <tr style={{ background: "#f2f2f2" }}>
            <th>Date</th>
            <th>Day</th>
            <th>Description</th>
            <th>Impact</th>
            {canEdit && <th>Action</th>}
          </tr>
        </thead>
        <tbody>
          {holidays.length > 0 ? (
            holidays.map(h => {
              const holidayDate = new Date(h.date);
              const dayName = holidayDate.toLocaleDateString('en-US', { weekday: 'long' });
              const isWeekendDay = isWeekend(h.date);
              return (
                <tr key={h.holidayId} style={{ background: isWeekendDay ? "#fff3cd" : "white" }}>
                  <td>{holidayDate.toLocaleDateString()}</td>
                  <td>{dayName}</td>
                  <td>{h.description}</td>
                  <td>
                    {isWeekendDay ? (
                      <span style={{ color: "#856404" }}>⚠ Weekend (no hour reduction)</span>
                    ) : (
                      <span style={{ color: "#e74c3c", fontWeight: "bold" }}>📉 Reduces week by 8 hrs</span>
                    )}
                  </td>
                  {canEdit && (
                    <td>
                      <button 
                        onClick={() => handleDelete(h.holidayId)} 
                        style={{ background: "#e74c3c", color: "white", border: "none", padding: "5px 10px", borderRadius: "3px", cursor: "pointer" }}
                      >
                        Delete
                      </button>
                    </td>
                  )}
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan={canEdit ? 5 : 4} style={{ textAlign: "center", padding: "20px" }}>No holidays configured.</td>
            </tr>
          )}
        </tbody>
      </table>

      <div style={{ marginTop: "20px", padding: "15px", background: "#f8f9fa", borderRadius: "5px", fontSize: "0.9em" }}>
        <strong>Note:</strong> Weekday holidays reduce the weekly productive hours by 8 hours each. 
        Weekends (Saturday/Sunday) are marked in yellow and don't reduce hours. 
        Standard weekly hours: 48 hrs.
      </div>
    </div>
  );
}