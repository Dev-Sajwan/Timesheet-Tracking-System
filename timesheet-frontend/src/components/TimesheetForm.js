import React, { useEffect, useState } from "react";
import {
  getEmployees,
  getProjects,
  getAllocations,
  getAllTimesheets,
  submitTimesheet,
  approveTimesheet
} from "../Services/Api";
import { designSystem, globalStyles } from "../styles/designSystem";
import Button from "./Button";

export default function Timesheets({ employeeId, onSubmitted }) {
  const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };
  const [employees, setEmployees] = useState([]);
  const [projects, setProjects] = useState([]);
  const [allocations, setAllocations] = useState([]);
  const [timesheets, setTimesheets] = useState([]);
  const [timesheetError, setTimesheetError] = useState("");
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [filters, setFilters] = useState({ employeeId: "", projectId: "", date: "" });
  const [newTimesheet, setNewTimesheet] = useState({
    employeeId: "",
    projectId: "",
    date: getTodayDate(),
    hours: "",
    description: ""
  });

  useEffect(() => {
    loadEmployees();
    loadProjects();
    loadAllocations();
    loadTimesheets();
  }, []);

  const handleEmployeeChange = React.useCallback((employeeId) => {
    setNewTimesheet({ ...newTimesheet, employeeId, projectId: "" });

    const assignedProjects = allocations
      .filter((a) => String(a.employeeId) === String(employeeId))
      .map((a) => projects.find((p) => p.projectId === a.projectId))
      .filter(Boolean);

    setFilteredProjects(assignedProjects);
  }, [newTimesheet, allocations, projects]);

  useEffect(() => {
    if (employeeId && allocations.length > 0 && projects.length > 0) {
      handleEmployeeChange(employeeId);
    }
  }, [employeeId, allocations, projects, handleEmployeeChange]);

  const loadEmployees = async () => {
    const res = await getEmployees();
    setEmployees(res.data);
  };

  const loadProjects = async () => {
    const res = await getProjects();
    setProjects(res.data);
  };

  const loadAllocations = async () => {
    const res = await getAllocations();
    setAllocations(res.data);
  };

  const loadTimesheets = async () => {
    try {
      const res = await getAllTimesheets();
      setTimesheets(res.data);
      setTimesheetError("");
    } catch (error) {
      const validationErrors = error.response?.data?.errors;
      const validationMessage = validationErrors
        ? Object.values(validationErrors).flat().join(" ")
        : "Unable to load timesheets.";
      setTimesheetError(validationMessage);
    }
  };

  const handleAddTimesheet = async () => {
    const employeeId = newTimesheet.employeeId;
    const projectId = Number(newTimesheet.projectId);
    const hoursWorked = Number(newTimesheet.hours);

    if (!employeeId || !newTimesheet.date || hoursWorked <= 0) {
      setTimesheetError("Employee, date, and valid hours are required.");
      return;
    }

    if (!newTimesheet.projectId) {
      setTimesheetError("Please select a project.");
      return;
    }

    const entryDate = newTimesheet.date;

    const isCompOff = hoursWorked > 8;
    const compOffHours = isCompOff ? hoursWorked - 8 : 0;
    const approvalStatus = isCompOff ? "Pending" : "Pending";

    try {
      await submitTimesheet({
        employeeId,
        projectId,
        date: entryDate,
        hoursWorked,
        submissionType: "Daily",
        approvalStatus: approvalStatus,
        weekStartDate: entryDate,
        weekEndDate: entryDate,
        entries: [
          {
            date: entryDate,
            hours: hoursWorked,
            description: newTimesheet.description + (isCompOff ? ` [Comp-off: ${compOffHours} hrs]` : "")
          }
        ],
        approvals: []
      });

      await loadTimesheets();

      setNewTimesheet({
        employeeId: employeeId || "",
        projectId: "",
        date: getTodayDate(),
        hours: "",
        description: ""
      });

      if (!employeeId) {
        setFilteredProjects([]);
      }
      setTimesheetError("");
      if (onSubmitted) onSubmitted();
    } catch (error) {
      const validationErrors = error.response?.data?.errors;
      const message = validationErrors
        ? Object.values(validationErrors).flat().join(" ")
        : error.response?.data?.title || "Unable to submit entry.";
      setTimesheetError(message);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";

    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      return dateStr;
    }

    return dateStr.substring(0, 10);
  };

  const filteredTimesheets = timesheets.filter((ts) => {
    return (
      (!filters.employeeId || String(ts.employeeId) === String(filters.employeeId)) &&
      (!filters.projectId || Number(ts.projectId) === Number(filters.projectId)) &&
      (!filters.date || formatDate(ts.date) === filters.date)
    );
  });

  const displayEntries = filteredTimesheets.map((ts) => ({
    id: `timesheet-${ts.timesheetId}`,
    actualId: ts.timesheetId,
    type: "Project",
    employeeId: ts.employeeId,
    projectId: ts.projectId,
    date: ts.date,
    hours: ts.hoursWorked,
    description: ts.entries?.[0]?.description || "",
    status: ts.approvalStatus || "Pending"
  }));

  const labelStyle = { display: "block", marginBottom: designSystem.spacing.xs, color: designSystem.colors.text, ...designSystem.typography.bodyMedium };
  const inputStyle = { ...globalStyles.input, marginBottom: designSystem.spacing.sm };
  const selectStyle = { ...inputStyle };

  return (
    <div style={{ padding: designSystem.spacing.lg, maxWidth: "1000px", margin: "0 auto", fontFamily: "Roboto, Arial, sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: designSystem.spacing.sm }}>
        <h2 style={{ margin: 0, ...designSystem.typography.h1, color: designSystem.colors.text }}>Timesheets</h2>
        {timesheetError && (
          <p role="alert" style={{ color: designSystem.colors.error, ...designSystem.typography.body }}>
            {timesheetError}
          </p>
        )}
      </div>

      <div style={{ ...globalStyles.card, marginBottom: designSystem.spacing.lg }}>
        <div style={{ display: "flex", gap: designSystem.spacing.sm, flexWrap: "wrap", alignItems: "flex-end" }}>
          {!employeeId && (
            <div style={{ flex: 1, minWidth: "150px" }}>
              <label style={labelStyle}>Employee</label>
              <select
                value={newTimesheet.employeeId}
                onChange={(e) => handleEmployeeChange(e.target.value)}
                style={selectStyle}
              >
                <option value="">Select Employee</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>{emp.name}</option>
                ))}
              </select>
            </div>
          )}
          <div style={{ flex: 1, minWidth: "180px" }}>
            <label style={labelStyle}>Project</label>
            <select
              value={newTimesheet.projectId}
              onChange={(e) => setNewTimesheet({ ...newTimesheet, projectId: e.target.value })}
              disabled={!newTimesheet.employeeId}
              style={selectStyle}
            >
              <option value="">Select Project</option>
              {filteredProjects.map((proj) => (
                <option key={proj.projectId} value={proj.projectId}>{proj.projectName}</option>
              ))}
            </select>
          </div>
          <div style={{ flex: 1, minWidth: "100px" }}>
            <label style={labelStyle}>Date</label>
            <input type="date" value={newTimesheet.date} onChange={(e) => setNewTimesheet({ ...newTimesheet, date: e.target.value })} style={inputStyle} />
          </div>
          <div style={{ flex: 1, minWidth: "100px" }}>
            <label style={labelStyle}>Hours</label>
            <input type="number" value={newTimesheet.hours} onChange={(e) => setNewTimesheet({ ...newTimesheet, hours: e.target.value })} style={inputStyle} />
          </div>
          <div style={{ flex: 1, minWidth: "200px" }}>
            <label style={labelStyle}>Description</label>
            <input type="text" value={newTimesheet.description} onChange={(e) => setNewTimesheet({ ...newTimesheet, description: e.target.value })} style={inputStyle} />
          </div>
          <Button variant="primary" onClick={handleAddTimesheet}>Submit Timesheet</Button>
        </div>
      </div>

      {!employeeId && (
        <>
          <div style={{ marginBottom: designSystem.spacing.md }}>
            <h3 style={{ ...designSystem.typography.h2, margin: `0 0 ${designSystem.spacing.sm} 0`, color: designSystem.colors.text }}>Filter Timesheets</h3>
            <div style={{ display: "flex", gap: designSystem.spacing.sm, marginBottom: designSystem.spacing.md }}>
              <div style={{ flex: 1, minWidth: "150px" }}>
                <label style={labelStyle}>Employee</label>
                <select
                  value={filters.employeeId}
                  onChange={(e) => setFilters({ ...filters, employeeId: e.target.value })}
                  style={selectStyle}
                >
                  <option value="">Filter by Employee</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>{emp.name}</option>
                  ))}
                </select>
              </div>
              <div style={{ flex: 1, minWidth: "150px" }}>
                <label style={labelStyle}>Project</label>
                <select
                  value={filters.projectId}
                  onChange={(e) => setFilters({ ...filters, projectId: e.target.value })}
                  style={selectStyle}
                >
                  <option value="">Filter by Project</option>
                  {projects.map((proj) => (
                    <option key={proj.projectId} value={proj.projectId}>{proj.projectName}</option>
                  ))}
                </select>
              </div>
              <div style={{ flex: 1, minWidth: "100px" }}>
                <label style={labelStyle}>Date</label>
                <input type="date" value={filters.date} onChange={(e) => setFilters({ ...filters, date: e.target.value })} style={inputStyle} />
              </div>
            </div>
          </div>

          <div>
            <h3 style={{ ...designSystem.typography.h2, margin: `0 0 ${designSystem.spacing.sm} 0`, color: designSystem.colors.text }}>Timesheet List</h3>
            <div style={{ overflowX: "auto" }}>
              <table style={{ ...globalStyles.table }}>
                <thead>
                  <tr style={{ ...globalStyles.tableHeader }}>
                    <th>Employee</th>
                    <th>Project</th>
                    <th>Date</th>
                    <th>Hours</th>
                    <th>Description</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {displayEntries.map((entry) => (
                    <tr key={entry.id} style={{ ...globalStyles.tableRowEven }}>
                      <td style={{ ...globalStyles.tableCell }}>
                        {employees.find((e) => String(e.id) === String(entry.employeeId))?.name || entry.employeeId}
                      </td>
                      <td style={{ ...globalStyles.tableCell }}>
                        {entry.projectId
                          ? projects.find((p) => Number(p.projectId) === Number(entry.projectId))?.projectName || entry.projectId
                          : "—"}
                      </td>
                      <td style={{ ...globalStyles.tableCell }}>{formatDate(entry.date)}</td>
                      <td style={{ ...globalStyles.tableCell }}>{entry.hours} hr</td>
                      <td style={{ ...globalStyles.tableCell }}>{entry.description}</td>
                      <td style={{ ...globalStyles.tableCell }}>{entry.status}</td>
                      <td style={{ ...globalStyles.tableCell }}>
                        {entry.status === "Pending" && (
                          <div style={{ display: "flex", gap: designSystem.spacing.xs }}>
                            <Button variant="secondary" size="small" onClick={async () => {
                              if (window.confirm("Approve timesheet?")) {
                                await approveTimesheet(entry.actualId, "Approved");
                                loadTimesheets();
                              }
                            }}>Approve</Button>
                            <Button variant="secondary" size="small" onClick={async () => {
                              if (window.confirm("Reject timesheet?")) {
                                await approveTimesheet(entry.actualId, "Rejected");
                                loadTimesheets();
                              }
                            }} style={{ background: designSystem.colors.error, color: designSystem.colors.white }}>Reject</Button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}