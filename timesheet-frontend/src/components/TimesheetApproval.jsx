import React, { useState, useEffect, useCallback } from "react";
import { getAllTimesheets, approveTimesheet, rejectTimesheet } from "../Services/Api";
import { designSystem, globalStyles } from "../styles/designSystem";
import Button from "./Button";
import { jwtDecode } from "jwt-decode";

export default function TimesheetApproval({ userRole }) {
  const [timesheets, setTimesheets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedTimesheet, setSelectedTimesheet] = useState(null);

  // Current logged in user info
  const [currentUserId, setCurrentUserId] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [permissions, setPermissions] = useState([]);

  useEffect(() => {
    const perms = JSON.parse(localStorage.getItem("permissions") || "[]");
    setPermissions(perms);

    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setCurrentUserId(decoded.uid || decoded.sub || decoded.nameidentifier || "");
        const userRoles = decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] || [];
        const rolesArray = Array.isArray(userRoles) ? userRoles : [userRoles];
        const isSystemAdmin = decoded["IsSystemAdmin"] === "true" || decoded["isSystemAdmin"] === true || rolesArray.includes("Admin") || rolesArray.includes("L1");
        setIsAdmin(isSystemAdmin);
      } catch (e) {
        console.error("Error decoding token", e);
      }
    }
  }, []);

  const loadTimesheets = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getAllTimesheets();
      setTimesheets(res.data || []);
    } catch (e) {
      console.error("Error loading timesheets:", e);
      setError("Failed to load timesheets: " + (e.response?.data?.message || e.message));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTimesheets();
  }, [loadTimesheets]);

  // Check if current user can approve/reject a specific timesheet
  const canManageTimesheet = (ts) => {
    if (!ts) return false;
    
    // If already approved or rejected, disable editing/actions
    const status = (ts.approvalStatus || "").toLowerCase();
    if (status === "approved" || status === "rejected") {
      return false;
    }

    // Admin / L1 can approve any
    if (isAdmin || userRole === "L1") return true;

    // Cannot approve own timesheet unless admin
    const employeeUserId = ts.employee?.id || ts.employeeId || ts.userId;
    const currentEmpId = localStorage.getItem("employeeId");
    if (currentEmpId && employeeUserId && String(currentEmpId) === String(employeeUserId)) {
      return false;
    }
    if (currentUserId && (ts.employee?.userId === currentUserId || ts.userId === currentUserId)) {
      return false;
    }

    // Role hierarchy check for submitter's role vs approver's role
    // L4 timesheet can be approved by L1-L3
    // L3 timesheet can be approved by L1-L2
    const submitterRole = ts.employee?.role || ts.role || "L4";
    if (userRole === "L2") {
      return submitterRole === "L3" || submitterRole === "L4";
    }
    if (userRole === "L3") {
      return submitterRole === "L4";
    }

    return false;
  };

  const handleApprove = async (timesheetId) => {
    if (!window.confirm("Approve this timesheet?")) return;
    const comment = window.prompt("Optional comment (leave blank to skip):") ?? "";

    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const fullName = localStorage.getItem("fullName") || "Manager";
      await approveTimesheet(timesheetId, fullName, comment.trim());
      setSuccess("Timesheet approved successfully!");
      loadTimesheets();
      closeViewModal();
    } catch (e) {
      console.error(e);
      setError("Failed to approve: " + (e.response?.data?.message || e.customMessage || e.message));
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (timesheetId) => {
    const reason = window.prompt("Enter rejection reason:");
    if (!reason || !reason.trim()) return;

    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const fullName = localStorage.getItem("fullName") || "Manager";
      await rejectTimesheet(timesheetId, fullName, reason.trim());
      setSuccess("Timesheet rejected!");
      loadTimesheets();
      closeViewModal();
    } catch (e) {
      console.error(e);
      setError("Failed to reject: " + (e.response?.data?.message || e.customMessage || e.message));
    } finally {
      setLoading(false);
    }
  };

  const openViewModal = (timesheet) => {
    setSelectedTimesheet(timesheet);
    setViewModalOpen(true);
  };

  const closeViewModal = () => {
    setViewModalOpen(false);
    setSelectedTimesheet(null);
  };

  const filteredTimesheets = timesheets.filter(ts => {
    // Status filter
    if (filterStatus !== "All" && ts.approvalStatus !== filterStatus) {
      return false;
    }

    // Search term (employee name or project name)
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      const empName = (ts.employee?.name || `Employee ${ts.employeeId}`).toLowerCase();
      const projName = (ts.project?.projectName || `Project ${ts.projectId}`).toLowerCase();
      if (!empName.includes(term) && !projName.includes(term)) {
        return false;
      }
    }

    // Date filter (Week column)
    if (dateFilter) {
      if (!ts.weekStartDate) return false;
      const tsDateStr = new Date(ts.weekStartDate).toLocaleDateString("en-CA");
      if (tsDateStr !== dateFilter) {
        return false;
      }
    }

    return true;
  });

  const getTotalHours = (entries) => {
    return (entries || []).reduce((sum, e) => sum + (e.hours || 0), 0).toFixed(1);
  };

  const getDescriptions = (entries) => {
    return (entries || [])
      .map(e => e.description)
      .filter(d => d && d.trim())
      .join("; ") || "—";
  };

  return (
    <div style={{ padding: designSystem.spacing.lg, maxWidth: "1400px", margin: "0 auto", fontFamily: "Roboto, Arial, sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: designSystem.spacing.md, flexWrap: "wrap", gap: designSystem.spacing.md }}>
        <h2 style={{ margin: 0, ...designSystem.typography.h2 }}>Timesheet Approval</h2>
        
        {/* Filters */}
        <div style={{ display: "flex", gap: designSystem.spacing.sm, alignItems: "center", flexWrap: "wrap" }}>
          <input
            type="text"
            placeholder="Search employee or project..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ ...globalStyles.input, width: "220px", padding: "6px 12px" }}
          />
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            style={{ ...globalStyles.input, width: "160px", padding: "6px 12px" }}
          />
          {dateFilter && (
            <Button variant="secondary" size="small" onClick={() => setDateFilter("")}>Clear Date</Button>
          )}

          <div style={{ display: "flex", gap: designSystem.spacing.xs, marginLeft: designSystem.spacing.sm }}>
            {["All", "Pending", "Approved", "Rejected"].map(status => (
              <Button
                key={status}
                variant={filterStatus === status ? "primary" : "secondary"}
                size="small"
                onClick={() => setFilterStatus(status)}
              >
                {status}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {error && (
        <div style={{ background: '#FFEBEE', color: designSystem.colors.error, padding: designSystem.spacing.sm, borderRadius: designSystem.radius, marginBottom: designSystem.spacing.md }}>
          {error}
        </div>
      )}

      {success && (
        <div style={{ background: '#E8F5E9', color: designSystem.colors.success, padding: designSystem.spacing.sm, borderRadius: designSystem.radius, marginBottom: designSystem.spacing.md }}>
          {success}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: "center", padding: designSystem.spacing.xl }}>Loading...</div>
      ) : filteredTimesheets.length === 0 ? (
        <div style={{ ...globalStyles.card, textAlign: "center", padding: designSystem.spacing.xl }}>
          <p style={{ color: designSystem.colors.textSecondary }}>No {filterStatus === "All" ? "" : filterStatus.toLowerCase()} timesheets found.</p>
        </div>
      ) : (
        <div style={{ ...globalStyles.card }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ ...globalStyles.table, width: "100%" }}>
              <thead>
                <tr style={{ ...globalStyles.tableHeader }}>
                  <th style={globalStyles.tableheadercell}>Employee</th>
                  <th style={globalStyles.tableheadercell}>Project</th>
                  <th style={globalStyles.tableheadercell}>Week</th>
                  <th style={globalStyles.tableheadercell}>Hours</th>
                  <th style={globalStyles.tableheadercell}>Description</th>
                  <th style={globalStyles.tableheadercell}>Status</th>
                  <th style={globalStyles.tableheadercell}>Submitted</th>
                  <th style={globalStyles.tableheadercell}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTimesheets.map((ts) => {
                    const proj = ts.project ? ts.project : { projectName: `Project ${ts.projectId}` };
                    const emp = ts.employee ? ts.employee : { name: `Employee ${ts.employeeId}` };
                    const timesheetId = ts.timesheetId || ts.id;
                    const canManage = canManageTimesheet(ts);
                    
                    return (
                      <tr key={timesheetId} style={{ ...globalStyles.tableRowEven }}>
                        <td style={{ ...globalStyles.tableCell }}>
                          <div style={{ fontWeight: 500 }}>{emp.name}</div>
                          <div style={{ fontSize: "12px", color: designSystem.colors.textSecondary }}>{emp.email || ""}</div>
                        </td>
                        <td style={{ ...globalStyles.tableCell }}>{proj.projectName}</td>
                        <td style={{ ...globalStyles.tableCell }}>
                          {ts.weekStartDate ? new Date(ts.weekStartDate).toLocaleDateString() : "—"}
                        </td>
                        <td style={{ ...globalStyles.tableCell, textAlign: "center" }}>
                          {getTotalHours(ts.entries)} hrs
                        </td>
                        <td style={{ ...globalStyles.tableCell }}>
                          <div style={{ 
                            maxWidth: "300px", 
                            overflow: "hidden", 
                            textOverflow: "ellipsis", 
                            whiteSpace: "nowrap",
                            fontSize: "13px"
                          }} title={getDescriptions(ts.entries) || "No description"}>
                            {getDescriptions(ts.entries)}
                          </div>
                        </td>
                        <td style={{ ...globalStyles.tableCell, textAlign: "center" }}>
                          <span style={{
                            padding: "2px 8px",
                            borderRadius: "12px",
                            fontSize: "12px",
                            background: ts.approvalStatus === "Approved" ? "#E8F5E9" :
                                       ts.approvalStatus === "Rejected" ? "#FFEBEE" : "#FFF3E0",
                            color: ts.approvalStatus === "Approved" ? "#2E7D32" :
                                     ts.approvalStatus === "Rejected" ? "#C62828" : "#E65100"
                          }}>
                            {ts.approvalStatus || "Pending"}
                          </span>
                        </td>
                        <td style={{ ...globalStyles.tableCell, textAlign: "center" }}>
                          <div style={{ fontSize: "12px", color: designSystem.colors.textSecondary }}>
                            Submitted by: {emp.name}
                          </div>
                          <div style={{ fontSize: "11px", color: designSystem.colors.textSecondary }}>
                            {ts.submittedAt ? new Date(ts.submittedAt).toLocaleDateString() : 
                             ts.date ? new Date(ts.date).toLocaleDateString() : "—"}
                          </div>
                        </td>
                        <td style={{ ...globalStyles.tableCell, textAlign: "center" }}>
                          <div style={{ display: "flex", gap: "6px", justifyContent: "center" }}>
                            <Button 
                              variant="primary" 
                              size="small" 
                              onClick={() => openViewModal(ts)}
                              disabled={loading}
                            >
                              View
                            </Button>
                            {canManage && (
                              <>
                                <Button 
                                  variant="success" 
                                  size="small" 
                                  onClick={() => handleApprove(timesheetId)}
                                  disabled={loading}
                                  style={{ background: "#2E7D32", color: "white" }}
                                >
                                  Approve
                                </Button>
                                <Button 
                                  variant="danger" 
                                  size="small" 
                                  onClick={() => handleReject(timesheetId)}
                                  disabled={loading}
                                  style={{ background: "#C62828", color: "white" }}
                                >
                                  Reject
                                </Button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* View Modal */}
      {viewModalOpen && selectedTimesheet && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0,0,0,0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000
        }} onClick={closeViewModal}>
          <div style={{
            background: "white",
            borderRadius: designSystem.radius,
            padding: designSystem.spacing.lg,
            maxWidth: "900px",
            width: "90%",
            maxHeight: "90vh",
            overflow: "auto",
            boxShadow: designSystem.shadows.lg
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: designSystem.spacing.md }}>
              <h3 style={{ margin: 0, ...designSystem.typography.h3 }}>Timesheet Details</h3>
              <Button variant="secondary" size="small" onClick={closeViewModal}>Close</Button>
            </div>
            
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: designSystem.spacing.md, marginBottom: designSystem.spacing.md }}>
              <div>
                <label style={{ fontSize: "12px", color: designSystem.colors.textSecondary, display: "block", marginBottom: "4px" }}>Employee</label>
                <div style={{ fontWeight: 500 }}>{selectedTimesheet.employee?.name || `Employee ${selectedTimesheet.employeeId}`}</div>
                <div style={{ fontSize: "12px", color: designSystem.colors.textSecondary }}>{selectedTimesheet.employee?.email || ""}</div>
              </div>
              <div>
                <label style={{ fontSize: "12px", color: designSystem.colors.textSecondary, display: "block", marginBottom: "4px" }}>Project</label>
                <div style={{ fontWeight: 500 }}>{selectedTimesheet.project?.projectName || `Project ${selectedTimesheet.projectId}`}</div>
                <div style={{ fontSize: "12px", color: designSystem.colors.textSecondary }}>{selectedTimesheet.project?.clientId ? `Client: ${selectedTimesheet.project.clientId}` : ""}</div>
              </div>
              <div>
                <label style={{ fontSize: "12px", color: designSystem.colors.textSecondary, display: "block", marginBottom: "4px" }}>Week</label>
                <div>{selectedTimesheet.weekStartDate ? new Date(selectedTimesheet.weekStartDate).toLocaleDateString() : "—"} to {selectedTimesheet.weekEndDate ? new Date(selectedTimesheet.weekEndDate).toLocaleDateString() : "—"}</div>
              </div>
              <div>
                <label style={{ fontSize: "12px", color: designSystem.colors.textSecondary, display: "block", marginBottom: "4px" }}>Status</label>
                <span style={{
                  padding: "2px 8px",
                  borderRadius: "12px",
                  fontSize: "12px",
                  background: selectedTimesheet.approvalStatus === "Approved" ? "#E8F5E9" :
                             selectedTimesheet.approvalStatus === "Rejected" ? "#FFEBEE" : "#FFF3E0",
                  color: selectedTimesheet.approvalStatus === "Approved" ? "#2E7D32" :
                           selectedTimesheet.approvalStatus === "Rejected" ? "#C62828" : "#E65100"
                }}>
                  {selectedTimesheet.approvalStatus || "Pending"}
                </span>
              </div>
            </div>

            <div style={{ marginBottom: designSystem.spacing.md }}>
              <label style={{ fontSize: "12px", color: designSystem.colors.textSecondary, display: "block", marginBottom: "4px" }}>Total Hours</label>
              <div style={{ fontWeight: 500, fontSize: "18px" }}>{(selectedTimesheet.entries || []).reduce((sum, e) => sum + (e.hours || 0), 0).toFixed(1)} hrs</div>
            </div>

            <div style={{ marginBottom: designSystem.spacing.md }}>
              <label style={{ fontSize: "12px", color: designSystem.colors.textSecondary, display: "block", marginBottom: "4px" }}>Description</label>
              <div style={{ 
                background: "#f5f5f5", 
                padding: designSystem.spacing.md, 
                borderRadius: designSystem.radius,
                whiteSpace: "pre-wrap",
                minHeight: "60px"
              }}>
                {(selectedTimesheet.entries || [])
                  .map(e => e.description)
                  .filter(d => d && d.trim())
                  .join("\n\n") || "No description provided"}
              </div>
            </div>

            <div style={{ marginBottom: designSystem.spacing.md }}>
              <label style={{ fontSize: "12px", color: designSystem.colors.textSecondary, display: "block", marginBottom: "4px" }}>Daily Entries</label>
              <div style={{ overflowX: "auto" }}>
                <table style={{ ...globalStyles.table, width: "100%", fontSize: "13px" }}>
                  <thead>
                    <tr style={{ ...globalStyles.tableHeader }}>
                      <th style={globalStyles.tableheadercell}>Date</th>
                      <th style={globalStyles.tableheadercell}>Hours</th>
                      <th style={globalStyles.tableheadercell}>Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(selectedTimesheet.entries || []).map((entry) => (
                      <tr key={entry.id} style={{ ...globalStyles.tableRowEven }}>
                        <td style={globalStyles.tableCell}>{new Date(entry.date).toLocaleDateString()}</td>
                        <td style={globalStyles.tableCell}>{entry.hours || 0} hrs</td>
                        <td style={globalStyles.tableCell}>{entry.description || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {selectedTimesheet.approvals && selectedTimesheet.approvals.length > 0 && (
              <div style={{ marginBottom: designSystem.spacing.md }}>
                <label style={{ fontSize: "12px", color: designSystem.colors.textSecondary, display: "block", marginBottom: "4px" }}>Approval History</label>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ ...globalStyles.table, width: "100%", fontSize: "13px" }}>
                    <thead>
                      <tr style={{ ...globalStyles.tableHeader }}>
                        <th style={globalStyles.tableheadercell}>Approved By</th>
                        <th style={globalStyles.tableheadercell}>Date</th>
                        <th style={globalStyles.testHeadercell || globalStyles.tableheadercell}>Type</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedTimesheet.approvals.map((approval) => (
                        <tr key={approval.approvalId} style={{ ...globalStyles.tableRowEven }}>
                          <td style={globalStyles.tableCell}>{approval.approvedBy || "—"}</td>
                          <td style={globalStyles.tableCell}>{approval.approvalDate ? new Date(approval.approvalDate).toLocaleDateString() : "—"}</td>
                          <td style={globalStyles.tableCell}>{approval.approvalType || "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Modal Actions */}
            {canManageTimesheet(selectedTimesheet) && (
              <div style={{ display: "flex", gap: designSystem.spacing.sm, justifyContent: "flex-end", marginTop: designSystem.spacing.lg, borderTop: `1px solid ${designSystem.colors.divider}`, paddingTop: designSystem.spacing.md }}>
                <Button 
                  variant="success" 
                  size="small" 
                  onClick={() => handleApprove(selectedTimesheet.timesheetId || selectedTimesheet.id)}
                  disabled={loading}
                  style={{ background: "#2E7D32", color: "white" }}
                >
                  Approve
                </Button>
                <Button 
                  variant="danger" 
                  size="small" 
                  onClick={() => handleReject(selectedTimesheet.timesheetId || selectedTimesheet.id)}
                  disabled={loading}
                  style={{ background: "#C62828", color: "white" }}
                >
                  Reject
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
