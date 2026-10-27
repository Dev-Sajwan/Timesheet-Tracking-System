import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  getLeaveBalances,
  getLeaveRecordsByEmployee,
  getLeaveRecords,
  applyLeave,
  cancelLeave,
  processLeaveApproval,
  adjustLeaveBalance,
  getLeaveTypes,
  updateLeaveTypeQuota,
  getHolidays,
  getEmployees
} from "../Services/Api";
import { designSystem } from "../styles/designSystem";
import Button from "./Button";
import { jwtDecode } from "jwt-decode";

const LeaveManagement = () => {
  const [activeTab, setActiveTab] = useState("balances"); // balances, apply, history, approvals, adjustments, quotas, holidays
  const [balances, setBalances] = useState([]);
  const [leaveRecords, setLeaveRecords] = useState([]);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [employeeSearch, setEmployeeSearch] = useState("");
  // loading state removed
  const [message, setMessage] = useState(null);

  // Year filter for history and viewing previous years
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // Apply Form State
  const [leaveTypeId, setLeaveTypeId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [halfDayType, setHalfDayType] = useState("None");
  const [reason, setReason] = useState("");
  const [attachmentBase64, setAttachmentBase64] = useState("");

  // Adjustment State (HR/Manager)
  const [adjEmployeeId, setAdjEmployeeId] = useState("");
  const [adjLeaveTypeId, setAdjLeaveTypeId] = useState("");
  const [adjAmount, setAdjAmount] = useState("");
  const [adjType, setAdjType] = useState("Credit");

  // Admin Quota State
  const [quotas, setQuotas] = useState({});
  const [holidays, setHolidays] = useState([]);

  const employeeId = localStorage.getItem("employeeId");
  const [isAdmin, setIsAdmin] = useState(false);
  const [isManagerOrAdmin, setIsManagerOrAdmin] = useState(false);


const [showEmployeeDropdown, setShowEmployeeDropdown] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    let adminFlag = false;
    let managerFlag = false;

    if (token) {
      try {
        const decoded = jwtDecode(token);
        const userRoles = decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] || [];
        const rolesArray = Array.isArray(userRoles) ? userRoles : [userRoles];
        const isSysAdmin = decoded["IsSystemAdmin"] === "true" || decoded["isSystemAdmin"] === true || decoded["isSystemAdmin"] === "True" || rolesArray.includes("Admin") || rolesArray.includes("L1");
        
        if (isSysAdmin) {
          adminFlag = true;
          managerFlag = true;
        } else if (rolesArray.some(r => ["L2", "L3"].includes(r))) {
          managerFlag = true;
        }
      } catch (e) {
        console.error("Error decoding token in LeaveManagement", e);
      }
    }


    const profileName = (localStorage.getItem("profileName") || "").toLowerCase();
    const role = (localStorage.getItem("role") || "").toLowerCase();
    if (profileName.includes("system administrator") || profileName.includes("admin") || profileName.includes("hr") || role.includes("admin") || role === "l1") {
      adminFlag = true;
      managerFlag = true;
    }
    if (role === "l2" || role.includes("manager")) {
      managerFlag = true;
    }

    setIsAdmin(adminFlag);
    setIsManagerOrAdmin(managerFlag || adminFlag);
  }, []);


  const loadData = useCallback(async () => {
    try {
      const typesRes = await getLeaveTypes();
      const types = typesRes.data || [];
      setLeaveTypes(types);

      const quotaMap = {};
      types.forEach(t => { quotaMap[t.leaveTypeId] = t.defaultQuota; });
      setQuotas(quotaMap);

      if (employeeId) {
        const balRes = await getLeaveBalances(employeeId, selectedYear);
        setBalances(balRes.data || []);
      }

      if (isManagerOrAdmin) {
        const recsRes = await getLeaveRecords();
        setLeaveRecords(recsRes.data || []);
      } else if (employeeId) {
        const recsRes = await getLeaveRecordsByEmployee(employeeId);
        setLeaveRecords(recsRes.data || []);
      }

      const holRes = await getHolidays();
      setHolidays(holRes.data || []);

      const empRes = await getEmployees();
      setEmployees(empRes.data || []);
    } catch (e) {
      console.error(e);
      setMessage({ type: "error", text: e.customMessage || "Failed to load leave data." });
    }
  }, [employeeId, selectedYear, isManagerOrAdmin]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle file conversion to minimum-size base64 binary for images or PDFs
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setMessage({ type: "error", text: "File size exceeds 2MB limit. Please upload a smaller image or PDF." });
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setAttachmentBase64(reader.result); // Base64 binary string
    };
    reader.readAsDataURL(file);
  };

  const handleApply = async (e) => {
    e.preventDefault();
    try {
      setMessage(null);
      const res = await applyLeave({
        employeeId,
        leaveTypeId: parseInt(leaveTypeId),
        startDate,
        endDate,
        halfDayType,
        reason,
        attachmentPath: attachmentBase64
      });
      setMessage({ type: "success", text: res.data.message || "Leave applied successfully!" });
      setStartDate("");
      setEndDate("");
      setReason("");
      setAttachmentBase64("");
      loadData();
      setActiveTab("history");
    } catch (err) {
      setMessage({ type: "error", text: err.customMessage || "Failed to apply leave." });
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this leave request?")) return;
    try {
      await cancelLeave(id, employeeId);
      setMessage({ type: "success", text: "Leave request cancelled." });
      loadData();
    } catch (err) {
      setMessage({ type: "error", text: err.customMessage || "Failed to cancel leave." });
    }
  };

  const handleApproval = async (id, action, reasonText = "") => {
    try {
      await processLeaveApproval({
        leaveRecordId: id,
        action,
        rejectionReason: reasonText
      });
      setMessage({ type: "success", text: `Leave request ${action}ed successfully.` });
      loadData();
    } catch (err) {
      setMessage({ type: "error", text: err.customMessage || "Failed to process approval." });
    }
  };

  const handleAdjustment = async (e) => {
    e.preventDefault();
    try {
      await adjustLeaveBalance({
        employeeId: adjEmployeeId,
        leaveTypeId: parseInt(adjLeaveTypeId),
        year: selectedYear,
        adjustmentAmount: parseFloat(adjAmount),
        adjustmentType: adjType
      });
      setMessage({ type: "success", text: "Leave balance adjusted successfully." });
      setAdjAmount("");
      loadData();
    } catch (err) {
      setMessage({ type: "error", text: err.customMessage || "Failed to adjust balance." });
    }
  };

  const handleUpdateQuota = async (leaveTypeId, quotaValue) => {
    try {
      await updateLeaveTypeQuota(leaveTypeId, parseFloat(quotaValue));
      setMessage({ type: "success", text: "Default quota updated successfully for all employees!" });
      loadData();
    } catch (err) {
      setMessage({ type: "error", text: err.customMessage || "Failed to update quota." });
    }
  };

  // Filter leave records by selected year
  const filteredLeaveRecords = useMemo(() => {
    return leaveRecords.filter(r => {
      if (!r.startDate) return false;
      const year = new Date(r.startDate).getFullYear();
      return year === selectedYear;
    });
  }, [leaveRecords, selectedYear]);

  return (
    <div style={{ padding: designSystem.spacing.lg, background: designSystem.colors.background, minHeight: "100vh" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: designSystem.spacing.md }}>
        <h2 style={{ ...designSystem.typography.heading, color: designSystem.colors.textPrimary, margin: 0 }}>
          Leave Management Module
        </h2>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <label style={{ fontWeight: "bold" }}>Year:</label>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            style={{ padding: "6px 12px", borderRadius: designSystem.radius.sm, border: `1px solid ${designSystem.colors.border}` }}
          >
            <option value={2026}>2026</option>
            <option value={2025}>2025</option>
            <option value={2024}>2024</option>
            <option value={2023}>2023</option>
          </select>
        </div>
      </div>

      {message && (
        <div style={{
          padding: designSystem.spacing.md,
          marginBottom: designSystem.spacing.md,
          borderRadius: designSystem.radius.md,
          background: message.type === "success" ? "#d1fae5" : "#fee2e2",
          color: message.type === "success" ? "#065f46" : "#991b1b"
        }}>
          {message.text}
        </div>
      )}

      {/* Navigation Tabs */}
      <div style={{ display: "flex", gap: designSystem.spacing.sm, marginBottom: designSystem.spacing.lg, borderBottom: `1px solid ${designSystem.colors.divider}`, paddingBottom: designSystem.spacing.sm, flexWrap: "wrap" }}>
        <Button variant={activeTab === "balances" ? "primary" : "secondary"} onClick={() => setActiveTab("balances")}>
          Leave Balances
        </Button>
        <Button variant={activeTab === "apply" ? "primary" : "secondary"} onClick={() => setActiveTab("apply")}>
          Apply Leave
        </Button>
        <Button variant={activeTab === "history" ? "primary" : "secondary"} onClick={() => setActiveTab("history")}>
          Leave History ({selectedYear})
        </Button>
        {isManagerOrAdmin && (
          <Button variant={activeTab === "approvals" ? "primary" : "secondary"} onClick={() => setActiveTab("approvals")}>
            Team Approvals
          </Button>
        )}
        {isManagerOrAdmin && (
          <Button variant={activeTab === "adjustments" ? "primary" : "secondary"} onClick={() => setActiveTab("adjustments")}>
            Balance Adjustments
          </Button>
        )}
        <Button variant={activeTab === "holidays" ? "primary" : "secondary"} onClick={() => setActiveTab("holidays")}>
          Company Holidays
        </Button>
      </div>

      {/* Balances Tab */}
      {activeTab === "balances" && (
        <div>
          {isAdmin && (
          <div style={{ background: designSystem.colors.surface, padding: designSystem.spacing.md, borderRadius: designSystem.radius.md, border: `1px solid ${designSystem.colors.divider}`, marginBottom: designSystem.spacing.md, boxShadow: designSystem.shadows.elevation4 }}>
            <h4 style={{ color: designSystem.colors.primary, marginBottom: "8px" }}>⚙️ Admin Leave Quota Management</h4>
            <p style={{ fontSize: "13px", color: designSystem.colors.textSecondary, marginBottom: "12px" }}>
              Define the total earned, sick, and paternity leave days given for a year to all employees.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: designSystem.spacing.md }}>
              {leaveTypes.map((lt) => (
                <div key={lt.leaveTypeId} style={{ background: designSystem.colors.background, padding: "10px", borderRadius: designSystem.radius.sm }}>
                  <strong>{lt.name}</strong>
                  <div style={{ display: "flex", gap: "6px", marginTop: "6px" }}>
                    <input
                      type="number"
                      step="0.5"
                      value={quotas[lt.leaveTypeId] !== undefined ? quotas[lt.leaveTypeId] : lt.defaultQuota}
                      onChange={(e) => setQuotas({ ...quotas, [lt.leaveTypeId]: e.target.value })}
                      style={{ width: "70px", padding: "4px", borderRadius: designSystem.radius.sm, border: `1px solid ${designSystem.colors.divider}` }}
                    />
                    <Button variant="primary" size="small" onClick={() => handleUpdateQuota(lt.leaveTypeId, quotas[lt.leaveTypeId])}>
                      Save Quota
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <h3 style={{ marginBottom: designSystem.spacing.md }}>Your Leave Balances ({selectedYear})</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: designSystem.spacing.md }}>
            {balances.map((b) => (
              <div key={b.leaveBalanceId} style={{ background: designSystem.colors.surface, border: `1px solid ${designSystem.colors.divider}`, borderRadius: designSystem.radius.md, padding: designSystem.spacing.md, boxShadow: designSystem.shadows.elevation4 }}>
                <h4 style={{ color: designSystem.colors.primary, marginBottom: designSystem.spacing.xs }}>{b.leaveTypeName || "Leave"}</h4>
                <p style={{ fontSize: "14px", margin: "4px 0" }}>Opening: <strong>{b.openingBalance}</strong></p>
                <p style={{ fontSize: "14px", margin: "4px 0" }}>Credited: <strong>{b.creditedBalance}</strong></p>
                <p style={{ fontSize: "14px", margin: "4px 0" }}>Taken: <strong style={{ color: "#dc2626" }}>{b.leavesTaken}</strong></p>
                <hr style={{ border: "none", borderTop: `1px solid ${designSystem.colors.divider}`, margin: "8px 0" }} />
                <p style={{ fontSize: "16px", fontWeight: "bold", margin: 0 }}>Closing Balance: <span style={{ color: "#059669" }}>{b.closingBalance}</span></p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Apply Leave Tab */}
      {activeTab === "apply" && (
        <div style={{ background: designSystem.colors.surface, padding: designSystem.spacing.lg, borderRadius: designSystem.radius.md, maxWidth: "600px", border: `1px solid ${designSystem.colors.divider}`, boxShadow: designSystem.shadows.elevation4 }}>
          <h3 style={{ marginBottom: designSystem.spacing.md }}>Apply for Leave</h3>
          <form onSubmit={handleApply} style={{ display: "flex", flexDirection: "column", gap: designSystem.spacing.md }}>
            <div>
              <label style={{ display: "block", marginBottom: "4px", fontWeight: "bold" }}>Leave Type</label>
              <select
                value={leaveTypeId}
                onChange={(e) => setLeaveTypeId(e.target.value)}
                required
                style={{ width: "100%", padding: "8px", borderRadius: designSystem.radius.sm, border: `1px solid ${designSystem.colors.divider}` }}
              >
                <option value="">Select Leave Type</option>
                {leaveTypes.map((lt) => (
                  <option key={lt.leaveTypeId} value={lt.leaveTypeId}>{lt.name} (Yearly Quota: {lt.defaultQuota})</option>
                ))}
              </select>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: designSystem.spacing.md }}>
              <div>
                <label style={{ display: "block", marginBottom: "4px", fontWeight: "bold" }}>Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                  style={{ width: "100%", padding: "8px", borderRadius: designSystem.radius.sm, border: `1px solid ${designSystem.colors.divider}` }}
                />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "4px", fontWeight: "bold" }}>End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  required
                  style={{ width: "100%", padding: "8px", borderRadius: designSystem.radius.sm, border: `1px solid ${designSystem.colors.divider}` }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "4px", fontWeight: "bold" }}>Half Day / Duration</label>
              <select
                value={halfDayType}
                onChange={(e) => setHalfDayType(e.target.value)}
                style={{ width: "100%", padding: "8px", borderRadius: designSystem.radius.sm, border: `1px solid ${designSystem.colors.divider}` }}
              >
                <option value="None">Full Day(s)</option>
                <option value="FirstHalf">First Half</option>
                <option value="SecondHalf">Second Half</option>
              </select>
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "4px", fontWeight: "bold" }}>Reason</label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows="3"
                required
                placeholder="Reason for leave..."
                style={{ width: "100%", padding: "8px", borderRadius: designSystem.radius.sm, border: `1px solid ${designSystem.colors.divider}` }}
              />
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "4px", fontWeight: "bold" }}>Attach Supporting Document (Image / PDF, Max 2MB)</label>
              <input
                type="file"
                accept="image/*,application/pdf"
                onChange={handleFileUpload}
                style={{ width: "100%", padding: "6px", borderRadius: designSystem.radius.sm, border: `1px solid ${designSystem.colors.divider}` }}
              />
              {attachmentBase64 && <small style={{ color: "#059669", display: "block", marginTop: "4px" }}>✓ Document attached successfully (stored as binary binary format)</small>}
            </div>

            <Button type="submit" variant="primary">Submit Leave Application</Button>
          </form>
        </div>
      )}

      {/* History Tab */}
      {activeTab === "history" && (
        <div>
          <h3 style={{ marginBottom: designSystem.spacing.md }}>Leave History for {selectedYear} {selectedYear !== new Date().getFullYear() && "(Past Year - View Only)"}</h3>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", background: designSystem.colors.surface, borderRadius: designSystem.radius.md, boxShadow: designSystem.shadows.elevation4 }}>
              <thead>
                <tr style={{ background: designSystem.colors.background, borderBottom: `2px solid ${designSystem.colors.divider}`, textAlign: "left" }}>
                  <th style={{ padding: "12px" }}>Employee</th>
                  <th style={{ padding: "12px" }}>Leave Type</th>
                  <th style={{ padding: "12px" }}>Start Date</th>
                  <th style={{ padding: "12px" }}>End Date</th>
                  <th style={{ padding: "12px" }}>Days</th>
                  <th style={{ padding: "12px" }}>Status</th>
                  <th style={{ padding: "12px" }}>Stage</th>
                  <th style={{ padding: "12px" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredLeaveRecords.length === 0 ? (
                  <tr>
                    <td colSpan="8" style={{ padding: "24px", textAlign: "center", color: designSystem.colors.textSecondary }}>
                      No leave records found for {selectedYear}.
                    </td>
                  </tr>
                ) : (
                  filteredLeaveRecords.map((r) => (
                    <tr key={r.leaveRecordId} style={{ borderBottom: `1px solid ${designSystem.colors.divider}` }}>
                      <td style={{ padding: "12px" }}>{r.employeeName || r.employeeId}</td>
                      <td style={{ padding: "12px" }}>{r.leaveTypeName}</td>
                      <td style={{ padding: "12px" }}>{r.startDate?.split("T")[0]}</td>
                      <td style={{ padding: "12px" }}>{r.endDate?.split("T")[0]}</td>
                      <td style={{ padding: "12px" }}>{r.totalDays}</td>
                      <td style={{ padding: "12px" }}>
                        <span style={{
                          padding: "4px 8px",
                          borderRadius: "12px",
                          fontSize: "12px",
                          fontWeight: "bold",
                          background: r.status === "Approved" ? "#d1fae5" : r.status === "Pending" ? "#fef3c7" : "#fee2e2",
                          color: r.status === "Approved" ? "#065f46" : r.status === "Pending" ? "#92400e" : "#991b1b"
                        }}>
                          {r.status}
                        </span>
                      </td>
                      <td style={{ padding: "12px" }}>{r.approvalStage}</td>
                      <td style={{ padding: "12px" }}>
                        {r.status === "Pending" && r.employeeId === employeeId && selectedYear === new Date().getFullYear() && (
                          <Button variant="danger" size="small" onClick={() => handleCancel(r.leaveRecordId)}>
                            Cancel
                          </Button>
                        )}
                        {selectedYear !== new Date().getFullYear() && (
                          <span style={{ fontSize: "12px", color: designSystem.colors.textSecondary }}>Read-Only</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Approvals Tab */}
      {activeTab === "approvals" && isManagerOrAdmin && (
        <div>
          <h3 style={{ marginBottom: designSystem.spacing.md }}>Team Leave Approvals ({selectedYear})</h3>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", background: designSystem.colors.surface, borderRadius: designSystem.radius.md, boxShadow: designSystem.shadows.elevation4 }}>
              <thead>
                <tr style={{ background: designSystem.colors.background, borderBottom: `2px solid ${designSystem.colors.divider}`, textAlign: "left" }}>
                  <th style={{ padding: "12px" }}>Employee</th>
                  <th style={{ padding: "12px" }}>Leave Type</th>
                  <th style={{ padding: "12px" }}>Dates</th>
                  <th style={{ padding: "12px" }}>Days</th>
                  <th style={{ padding: "12px" }}>Reason</th>
                  <th style={{ padding: "12px" }}>Status</th>
                  <th style={{ padding: "12px" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredLeaveRecords.filter(r => r.status === "Pending" || r.status === "ManagerApproved").length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ padding: "24px", textAlign: "center", color: designSystem.colors.textSecondary }}>
                      No pending team approvals for {selectedYear}.
                    </td>
                  </tr>
                ) : (
                  filteredLeaveRecords.filter(r => r.status === "Pending" || r.status === "ManagerApproved").map((r) => (
                    <tr key={r.leaveRecordId} style={{ borderBottom: `1px solid ${designSystem.colors.divider}` }}>
                      <td style={{ padding: "12px" }}>{r.employeeName || r.employeeId}</td>
                      <td style={{ padding: "12px" }}>{r.leaveTypeName}</td>
                      <td style={{ padding: "12px" }}>{r.startDate?.split("T")[0]} to {r.endDate?.split("T")[0]}</td>
                      <td style={{ padding: "12px" }}>{r.totalDays}</td>
                      <td style={{ padding: "12px" }}>{r.reason}</td>
                      <td style={{ padding: "12px" }}>{r.status} ({r.approvalStage})</td>
                      <td style={{ padding: "12px", display: "flex", gap: "8px" }}>
                        <Button variant="primary" size="small" onClick={() => handleApproval(r.leaveRecordId, "Approve")}>
                          Approve
                        </Button>
                        <Button variant="danger" size="small" onClick={() => {
                          const reason = prompt("Enter rejection reason:");
                          if (reason) handleApproval(r.leaveRecordId, "Reject", reason);
                        }}>
                          Reject
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Quotas Tab (Admin) */}
      {activeTab === "quotas" && isAdmin && (
        <div style={{ background: designSystem.colors.surface, padding: designSystem.spacing.lg, borderRadius: designSystem.radius.md, maxWidth: "600px", border: `1px solid ${designSystem.colors.divider}`, boxShadow: designSystem.shadows.elevation4 }}>
          <h3 style={{ marginBottom: designSystem.spacing.md }}>Configure Yearly Leave Quotas (Admin)</h3>
          <p style={{ fontSize: "14px", color: designSystem.colors.textSecondary, marginBottom: designSystem.spacing.md }}>
            Define the total allocated leave days per year for Earned, Sick, Paternity, and other leave categories applicable to all employees.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: designSystem.spacing.md }}>
            {leaveTypes.map((lt) => (
              <div key={lt.leaveTypeId} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px", background: designSystem.colors.background, borderRadius: designSystem.radius.sm }}>
                <div>
                  <strong>{lt.name}</strong>
                  <div style={{ fontSize: "12px", color: designSystem.colors.textSecondary }}>{lt.description}</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <input
                    type="number"
                    step="0.5"
                    value={quotas[lt.leaveTypeId] !== undefined ? quotas[lt.leaveTypeId] : lt.defaultQuota}
                    onChange={(e) => setQuotas({ ...quotas, [lt.leaveTypeId]: e.target.value })}
                    style={{ width: "80px", padding: "6px", borderRadius: designSystem.radius.sm, border: `1px solid ${designSystem.colors.divider}` }}
                  />
                  <Button variant="primary" size="small" onClick={() => handleUpdateQuota(lt.leaveTypeId, quotas[lt.leaveTypeId])}>
                    Save
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Adjustments Tab */}
      {activeTab === "adjustments" && isManagerOrAdmin && (
        <div style={{ background: designSystem.colors.surface, padding: designSystem.spacing.lg, borderRadius: designSystem.radius.md, maxWidth: "600px", border: `1px solid ${designSystem.colors.divider}`, boxShadow: designSystem.shadows.elevation4 }}>
          <h3 style={{ marginBottom: designSystem.spacing.md }}>Manual Leave Balance Adjustment ({selectedYear})</h3>
          <form onSubmit={handleAdjustment} style={{ display: "flex", flexDirection: "column", gap: designSystem.spacing.md }}>
            
            <div style={{ position: "relative" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "4px",
                  fontWeight: "bold",
                }}
              >
                Select Employee
              </label>

              <input
                type="text"
                value={employeeSearch}
                placeholder="Search employee by name or email..."
                required={!adjEmployeeId}
                autoComplete="off"
                onFocus={() => setShowEmployeeDropdown(true)}
                onChange={(e) => {
                  setEmployeeSearch(e.target.value);
                  setAdjEmployeeId("");
                  setShowEmployeeDropdown(true);
                }}
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  padding: "10px 12px",
                  borderRadius: designSystem.radius.sm,
                  border: `1px solid ${designSystem.colors.divider}`,
                  fontSize: "14px",
                  outline: "none",
                }}
              />

              {showEmployeeDropdown && (
                <div
                  style={{
                    position: "absolute",
                    top: "100%",
                    left: 0,
                    right: 0,
                    zIndex: 1000,
                    maxHeight: "220px",
                    overflowY: "auto",
                    background: designSystem.colors.white,
                    border: `1px solid ${designSystem.colors.divider}`,
                    borderRadius: designSystem.radius.sm,
                    boxShadow: designSystem.shadows.elevation2,
                  }}
                >
                  {employees
                    .filter((emp) => {
                      const search = employeeSearch.trim().toLowerCase();

                      return (
                        (emp.name || "").toLowerCase().includes(search) ||
                        (emp.email || "").toLowerCase().includes(search)
                      );
                    })
                    .map((emp) => (
                      <div
                        key={emp.id}
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => {
                          setAdjEmployeeId(String(emp.id));
                          setEmployeeSearch(
                            `${emp.name} (${emp.email})`
                          );
                          setShowEmployeeDropdown(false);
                        }}
                        style={{
                          padding: "10px 12px",
                          cursor: "pointer",
                          borderBottom: `1px solid ${designSystem.colors.divider}`,
                          fontSize: "14px",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background =
                            designSystem.colors.surfaceHover;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background =
                            designSystem.colors.white;
                        }}
                      >
                        <div style={{ fontWeight: 500 }}>
                          {emp.name}
                        </div>
                        <div
                          style={{
                            fontSize: "12px",
                            color: designSystem.colors.textSecondary,
                            marginTop: "2px",
                          }}
                        >
                          {emp.email}
                        </div>
                      </div>
                    ))}

                  {employees.filter((emp) => {
                    const search = employeeSearch.trim().toLowerCase();

                    return (
                      (emp.name || "").toLowerCase().includes(search) ||
                      (emp.email || "").toLowerCase().includes(search)
                    );
                  }).length === 0 && (
                    <div
                      style={{
                        padding: "12px",
                        fontSize: "13px",
                        color: designSystem.colors.textSecondary,
                      }}
                    >
                      No employees found.
                    </div>
                  )}
                </div>
              )}
            </div>


            <div>
              <label style={{ display: "block", marginBottom: "4px", fontWeight: "bold" }}>Leave Type</label>
              <select
                value={adjLeaveTypeId}
                onChange={(e) => setAdjLeaveTypeId(e.target.value)}
                required
                style={{ width: "100%", padding: "8px", borderRadius: designSystem.radius.sm, border: `1px solid ${designSystem.colors.divider}` }}
              >
                <option value="">Select Leave Type</option>
                {leaveTypes.map((lt) => (
                  <option key={lt.leaveTypeId} value={lt.leaveTypeId}>{lt.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "4px", fontWeight: "bold" }}>Adjustment Type</label>
              <select
                value={adjType}
                onChange={(e) => setAdjType(e.target.value)}
                style={{ width: "100%", padding: "8px", borderRadius: designSystem.radius.sm, border: `1px solid ${designSystem.colors.divider}` }}
              >
                <option value="Credit">Credit Addition</option>
                <option value="CarryForward">Carry Forward</option>
                <option value="Correction">Correction / Penalty</option>
              </select>
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "4px", fontWeight: "bold" }}>Amount (Days)</label>
              <input
                type="number"
                step="0.5"
                value={adjAmount}
                onChange={(e) => setAdjAmount(e.target.value)}
                required
                placeholder="e.g. 2 or -1"
                style={{ width: "100%", padding: "8px", borderRadius: designSystem.radius.sm, border: `1px solid ${designSystem.colors.divider}` }}
              />
            </div>

            <Button type="submit" variant="primary">Apply Adjustment</Button>
          </form>
        </div>
      )}

      {/* Holidays Tab */}
      {activeTab === "holidays" && (
        <div>
          <h3 style={{ marginBottom: designSystem.spacing.md }}>Company Holidays ({selectedYear}) (Auto-excluded from leave counts)</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: designSystem.spacing.md }}>
            {holidays.map((h, i) => (
              <div key={i} style={{ background: designSystem.colors.surface, border: `1px solid ${designSystem.colors.divider}`, borderRadius: designSystem.radius.md, padding: designSystem.spacing.md, boxShadow: designSystem.shadows.elevation4 }}>
                <h4 style={{ color: designSystem.colors.primary, marginBottom: "4px" }}>{h.Description || h.description || "Holiday"}</h4>
                <p style={{ margin: 0, fontSize: "14px", color: designSystem.colors.textSecondary }}>{h.date?.split("T")[0]}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaveManagement;
