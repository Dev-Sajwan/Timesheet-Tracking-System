import React, { useEffect, useState } from "react";
import { getHolidays, addHoliday, updateHoliday, deleteHoliday } from "../Services/Api";
import { jwtDecode } from "jwt-decode";
import { designSystem, globalStyles } from "../styles/designSystem";
import Modal from "./Modal";
import Button from "./Button";

export default function HolidayList() {
  const [holidays, setHolidays] = useState([]);
  const [newHoliday, setNewHoliday] = useState({ date: "", description: "" });
  const [showForm, setShowForm] = useState(false);
  const [editingHoliday, setEditingHoliday] = useState(null);
  const [error, setError] = useState("");
  const [canEdit, setCanEdit] = useState(false);

  useEffect(() => {
    checkPermissions();
    loadHolidays();
  }, []);

  const checkPermissions = () => {
    const rawPerms = localStorage.getItem("permissions");
    let perms = [];
    try {
      const parsed = JSON.parse(rawPerms);
      if (Array.isArray(parsed)) {
        perms = parsed;
      } else if (parsed && Array.isArray(parsed.permissions)) {
        perms = parsed.permissions;
      }
    } catch (e) {
      perms = [];
    }
    
    const hasSpecificPerm = perms.some(p => typeof p === "string" && (p.toLowerCase().includes("holiday") || p.toLowerCase().includes("admin")));
    
    if (hasSpecificPerm) {
      setCanEdit(true);
      return;
    }
    
    // Fallback to role-based check if specific permissions not found
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        const userRoles = decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] || [];
        const rolesArray = Array.isArray(userRoles) ? userRoles : [userRoles];
        const isSystemAdmin = decoded.isSystemAdmin === true || decoded.isSystemAdmin === "true";
        setCanEdit(rolesArray.includes("Admin") || rolesArray.includes("Manager") || isSystemAdmin);
      } catch (e) {
        setCanEdit(false);
      }
    }
  };

  const loadHolidays = async () => {
    try {
      const res = await getHolidays();
      const currentYear = new Date().getFullYear();
      const filteredHolidays = res.data.filter(h => new Date(h.date).getFullYear() >= currentYear);
      setHolidays(filteredHolidays);
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

  const handleEditHoliday = (holiday) => {
    setEditingHoliday(holiday);
    setNewHoliday({ date: holiday.date.split('T')[0], description: holiday.description });
    setShowForm(true);
  };

  const handleUpdateHoliday = async () => {
    if (!newHoliday.date || !newHoliday.description) {
      setError("Date and description are required");
      return;
    }
    setError("");
    try {
      await updateHoliday(editingHoliday.holidayId, newHoliday);
      setNewHoliday({ date: "", description: "" });
      setEditingHoliday(null);
      setShowForm(false);
      loadHolidays();
    } catch (e) {
      setError(e.response?.data?.message || "Failed to update holiday");
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

  const labelStyle = { display: "block", marginBottom: designSystem.spacing.xs, color: designSystem.colors.text, ...designSystem.typography.bodyMedium };
  const inputStyle = { ...globalStyles.input, marginBottom: designSystem.spacing.sm };

  return (
    <div style={{ padding: designSystem.spacing.lg, maxWidth: "900px", margin: "0 auto", fontFamily: "Roboto, Arial, sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: designSystem.spacing.md }}>
        <h2 style={{ margin: 0, ...designSystem.typography.h1, color: designSystem.colors.text }}>Holiday Management</h2>
        {canEdit && (
          <Button variant="primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? "Cancel" : "+ Add Holiday"}
          </Button>
        )}
      </div>

      {!canEdit && (
        <p style={{ color: designSystem.colors.textSecondary, ...designSystem.typography.body, fontStyle: "italic" }}>
          View only - Contact Admin/Manager to modify holidays
        </p>
      )}

      {error && (
        <div style={{ background: "#FFEBEE", color: designSystem.colors.error, padding: designSystem.spacing.sm, borderRadius: designSystem.radius, marginBottom: designSystem.spacing.md, ...designSystem.typography.body }}>
          {error}
        </div>
      )}

      <Modal
        isOpen={showForm && canEdit}
        onClose={() => { setShowForm(false); setEditingHoliday(null); }}
        title={editingHoliday ? "Edit Holiday" : "Add Holiday"}
        footer={
          <>
            <Button variant="secondary" onClick={() => { setShowForm(false); setEditingHoliday(null); }}>Cancel</Button>
            <Button variant="primary" onClick={editingHoliday ? handleUpdateHoliday : handleAddHoliday}>
              {editingHoliday ? "Update" : "Save"}
            </Button>
          </>
        }
      >
        <label style={labelStyle}>Date</label>
        <input
          type="date"
          value={newHoliday.date}
          onChange={(e) => setNewHoliday({ ...newHoliday, date: e.target.value })}
          style={inputStyle}
        />
        <label style={labelStyle}>Description</label>
        <input
          type="text"
          value={newHoliday.description}
          onChange={(e) => setNewHoliday({ ...newHoliday, description: e.target.value })}
          style={inputStyle}
        />
      </Modal>

      <div style={{ overflowX: "auto" }}>
        <table style={{ ...globalStyles.table }}>
          <thead>
            <tr style={{ ...globalStyles.tableHeader }}>
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
                  <tr key={h.holidayId} style={{ ...globalStyles.tableRowEven, background: isWeekendDay ? "#fff3cd" : designSystem.colors.white }}>
                    <td style={{ ...globalStyles.tableCell }}>{holidayDate.toLocaleDateString()}</td>
                    <td style={{ ...globalStyles.tableCell }}>{dayName}</td>
                    <td style={{ ...globalStyles.tableCell }}>{h.description}</td>
                    <td style={{ ...globalStyles.tableCell }}>
                      {isWeekendDay ? (
                        <span style={{ color: "#856404" }}>Weekend (no hour reduction)</span>
                      ) : (
                        <span style={{ color: designSystem.colors.error, fontWeight: "bold" }}>Reduces week by 8 hrs</span>
                      )}
                    </td>
                    {canEdit && (
                      <td style={{ ...globalStyles.tableCell, display: "flex", gap: designSystem.spacing.xs }}>
                        <Button variant="secondary" size="small" onClick={() => handleEditHoliday(h)}>Edit</Button>
                        <Button variant="secondary" size="small" onClick={() => handleDelete(h.holidayId)} style={{ background: designSystem.colors.error, color: designSystem.colors.white }}>Delete</Button>
                      </td>
                    )}
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={canEdit ? 5 : 4} style={{ ...globalStyles.tableCell, textAlign: "center", padding: designSystem.spacing.xl }}>No holidays configured.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: designSystem.spacing.lg, padding: designSystem.spacing.md, background: designSystem.colors.background, borderRadius: designSystem.radius, ...designSystem.typography.body, fontSize: "0.9em", color: designSystem.colors.textSecondary }}>
        <strong>Note:</strong> Weekday holidays reduce the weekly productive hours by 8 hours each.
        Weekends (Saturday/Sunday) are marked in yellow and don't reduce hours.
        Standard weekly hours: 40 hrs.
      </div>
    </div>
  );
}