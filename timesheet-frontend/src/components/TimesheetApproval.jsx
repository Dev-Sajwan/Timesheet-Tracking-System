import React, { useState, useEffect, useCallback } from "react";
import { getAllTimesheets, approveTimesheet, rejectTimesheet } from "../Services/Api";
import { designSystem, globalStyles } from "../styles/designSystem";
import Button from "./Button";

export default function TimesheetApproval({ userRole }) {
  const [timesheets, setTimesheets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedTimesheet, setSelectedTimesheet] = useState(null);

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
    } catch (e) {
      console.error(e);
      setError("Failed to approve: " + (e.response?.data?.message || e.message));
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
    } catch (e) {
      console.error(e);
      setError("Failed to reject: " + (e.response?.data?.message || e.message));
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
    if (filterStatus === "All") return true;
    return ts.approvalStatus === filterStatus;
  });

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return dateString;
    }
  };

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
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: designSystem.spacing.md }}>
        <h2 style={{ margin: 0, ...designSystem.typography.h2 }}>Timesheet Approval</h2>
        <div style={{ display: "flex", gap: designSystem.spacing.sm }}>
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
                    
                    const descriptions = (ts.entries || [])
                      .map(e => e.description)
                      .filter(d => d && d.trim())
                      .join("; ") || "—";
                    
                    const totalHours = getTotalHours(ts.entries);
                    
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
                          <Button 
                            variant="primary" 
                            size="small" 
                            onClick={() => openViewModal(ts)}
                            disabled={loading}
                          >
                            View
                          </Button>
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
              <div>
                <label style={{ fontSize: "12px", color: designSystem.colors.textSecondary, display: "block", marginBottom: "4px" }}>Approval History</label>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ ...globalStyles.table, width: "100%", fontSize: "13px" }}>
                    <thead>
                      <tr style={{ ...globalStyles.tableHeader }}>
                        <th style={globalStyles.tableheadercell}>Approved By</th>
                        <th style={globalStyles.tableheadercell}>Date</th>
                        <th style={globalStyles.tableheadercell}>Type</th>
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
          </div>
        </div>
      )}
    </div>
  );
}