import React, { useState, useEffect, useMemo, useCallback } from "react";
  import { getAllocationsByEmployee, getProjects, submitBatchTimesheet, getTimesheetsByEmployee } from "../Services/Api";
  import { designSystem, globalStyles } from "../styles/designSystem";
  import Button from "./Button";

const WEEK_DAYS = [
  { key: 0, name: "Sun", short: "S" },
  { key: 1, name: "Mon", short: "M" },
  { key: 2, name: "Tue", short: "T" },
  { key: 3, name: "Wed", short: "W" },
  { key: 4, name: "Thu", short: "T" },
  { key: 5, name: "Fri", short: "F" },
  { key: 6, name: "Sat", short: "S" },
];

const formatDate = (date) => {
  const d = new Date(date);
  return d.toLocaleDateString("en-CA");
};

const isWeekend = (dayIndex) => dayIndex === 0 || dayIndex === 6;

const getWeekRange = (date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const start = new Date(d);
  start.setDate(d.getDate() + diffToMonday);
  start.setHours(0, 0, 0, 0);
  return start;
};

export default function WeeklyTimesheet({ employeeId, onSubmitted }) {
  const [allocations, setAllocations] = useState([]);
  const [projects, setProjects] = useState([]);
  const [existingTimesheets, setExistingTimesheets] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [weekStart, setWeekStart] = useState(() => formatDate(getWeekRange(new Date())));
  const [dailyEntries, setDailyEntries] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showTimesheetList, setShowTimesheetList] = useState(true);

  const loadAllocations = useCallback(async () => {
    if (!employeeId) return;
    try {
      const res = await getAllocationsByEmployee(employeeId);
      setAllocations(res.data || []);
    } catch (e) {
      console.error("Error loading allocations:", e);
    }
  }, [employeeId]);

  const loadProjects = useCallback(async () => {
    try {
      const res = await getProjects();
      setProjects(res.data);
    } catch (e) {
      console.error("Error loading projects:", e);
    }
  }, []);

  const loadExistingTimesheets = useCallback(async () => {
    if (!employeeId) return;
    try {
      const res = await getTimesheetsByEmployee(employeeId);
      setExistingTimesheets(res.data || []);
    } catch (e) {
      console.error("Error loading existing timesheets:", e);
    }
  }, [employeeId]);

  useEffect(() => {
    loadAllocations();
    loadProjects();
    loadExistingTimesheets();
  }, [employeeId, loadAllocations, loadProjects, loadExistingTimesheets]);

  // Generate week dates
  const weekDates = useMemo(() => {
    const start = getWeekRange(weekStart);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return d;
    });
  }, [weekStart]);

  // Handle input change for a specific day
  const handleDayChange = (dayIndex, field, value) => {
    setDailyEntries(prev => ({
      ...prev,
      [dayIndex]: {
        ...prev[dayIndex],
        [field]: value
      }
    }));
  };

  const handleWeekChange = (newWeekStart) => {
    setWeekStart(newWeekStart);
    setDailyEntries({}); // reset entries when week changes
  };

  const handleProjectChange = (projectId) => {
    setSelectedProjectId(projectId);
    setDailyEntries({});
  };

  // Validate - at least one weekday with hours
  const hasWeekdayEntries = Object.entries(dailyEntries).some(([idx, e]) => e.hours > 0 && !isWeekend(Number(idx)));

  const handleSubmit = async () => {
    if (!selectedProjectId) {
      setError("Please select a project");
      return;
    }
    if (!hasWeekdayEntries) {
      setError("Please enter hours for at least one weekday (Mon-Fri)");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const dailyEntriesArray = weekDates.map((date, idx) => {
        const entry = dailyEntries[idx] || {};
        return {
          date: formatDate(date),
          hours: entry.hours || 0,
          description: entry.description || ""
        };
      });

      const payload = {
        employeeId,
        projectId: Number(selectedProjectId),
        weekStartDate: weekStart,
        dailyEntries: dailyEntriesArray
      };

      await submitBatchTimesheet(payload);
      setSuccess("Weekly timesheet submitted successfully!");
      setDailyEntries({});
      if (onSubmitted) onSubmitted();
    } catch (e) {
      console.error(e);
      setError("Failed to submit timesheet: " + (e.response?.data?.message || e.message));
    } finally {
      setLoading(false);
    }
  };

  // Pre-fill from allocations if available
  useEffect(() => {
    if (allocations.length > 0 && !selectedProjectId) {
      setSelectedProjectId(String(allocations[0].projectId));
    }
  }, [allocations, selectedProjectId]);

  return (
    <div>
      <div style={{ padding: designSystem.spacing.lg, maxWidth: "900px", margin: "0 auto", fontFamily: "Roboto, Arial, sans-serif" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: designSystem.spacing.md }}>
          <h2 style={{ margin: `0 0 ${designSystem.spacing.md} 0`, ...designSystem.typography.h2 }}>Weekly Timesheet</h2>
          <Button variant="secondary" onClick={() => setShowTimesheetList(!showTimesheetList)}>
            {showTimesheetList ? "Hide" : "Show"} Timesheet List
          </Button>
        </div>

        {showTimesheetList && existingTimesheets.length > 0 && (
          <div style={{ ...globalStyles.card, marginBottom: designSystem.spacing.lg }}>
            <h3 style={{ margin: `0 0 ${designSystem.spacing.md} 0`, ...designSystem.typography.h3 }}>Submitted Timesheets</h3>
            <div style={{ overflowX: "auto" }}>
              <table style={{ ...globalStyles.table, width: "100%" }}>
                <thead>
                  <tr style={{ ...globalStyles.tableHeader }}>
                    <th style={globalStyles.tableheadercell}>Project</th>
                    <th style={globalStyles.tableheadercell}>Week Start</th>
                    <th style={globalStyles.tableheadercell}>Total Hours</th>
                    <th style={globalStyles.tableheadercell}>Status</th>
                    <th style={globalStyles.tableheadercell}>Submitted</th>
                  </tr>
                </thead>
                <tbody>
                  {existingTimesheets.map((ts) => {
                    const proj = projects.find(p => p.projectId === ts.projectId);
                    return (
                      <tr key={ts.id} style={{ ...globalStyles.tableRowEven }}>
                        <td style={{ ...globalStyles.tableCell }}>{proj?.projectName || `Project ${ts.projectId}`}</td>
                        <td style={{ ...globalStyles.tableCell }}>{ts.weekStartDate || "—"}</td>
                        <td style={{ ...globalStyles.tableCell }}>{(ts.dailyEntries || []).reduce((sum, e) => sum + (e.hours || 0), 0).toFixed(1)} hrs</td>
                        <td style={{ ...globalStyles.tableCell }}>
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
                        <td style={{ ...globalStyles.tableCell }}>{ts.submittedAt ? new Date(ts.submittedAt).toLocaleDateString() : "—"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {showTimesheetList && existingTimesheets.length === 0 && (
          <div style={{ ...globalStyles.card, marginBottom: designSystem.spacing.lg, textAlign: "center", padding: designSystem.spacing.xl }}>
            <p style={{ color: designSystem.colors.textSecondary, ...designSystem.typography.body }}>
              No timesheets submitted yet. Fill in the form below to submit your first weekly timesheet.
            </p>
          </div>
        )}
      </div>

      <div style={{ display: "flex", gap: designSystem.spacing.md, flexWrap: "wrap", alignItems: "flex-end", marginBottom: designSystem.spacing.lg }}>
          <div style={{ flex: 1, minWidth: "200px" }}>
            <label style={{ display: "block", marginBottom: designSystem.spacing.xs, ...designSystem.typography.bodyMedium }}>Project</label>
            <select
              value={selectedProjectId}
              onChange={e => handleProjectChange(e.target.value)}
              style={{ ...globalStyles.input }}
            >
              <option value="">Select Project</option>
              {allocations.map(a => {
                const proj = projects.find(p => p.projectId === a.projectId);
                return proj ? (
                  <option key={proj.projectId} value={proj.projectId}>
                    {proj.projectName}
                  </option>
                ) : null;
              })}
            </select>
          </div>

          <div style={{ flex: 1, minWidth: "180px" }}>
            <label style={{ display: "block", marginBottom: designSystem.spacing.xs, ...designSystem.typography.bodyMedium }}>Week Starting (Monday)</label>
            <input
              type="date"
              value={weekStart}
              onChange={e => handleWeekChange(e.target.value)}
              style={{ ...globalStyles.input }}
            />
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

        <div style={{ overflowX: "auto" }}>
          <table style={{ ...globalStyles.table, width: "100%" }}>
            <thead>
              <tr style={{ ...globalStyles.tableHeader }}>
                <th style={globalStyles.tableheadercell}>Project</th>
                {WEEK_DAYS.map(day => (
                  <th key={day.key} style={{ ...globalStyles.tableheadercell, textAlign: "center", width: "14%" }}>
                    {day.name}
                    <br/>
                    <small>{formatDate(weekDates[day.key])}</small>
                  </th>
                ))}
                <th style={globalStyles.tableheadercell}>Total</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ ...globalStyles.tableRow }}>
                <td style={{ ...globalStyles.tableCell, fontWeight: 600 }}>
                  {projects.find(p => p.projectId === Number(selectedProjectId))?.projectName || "—"}
                </td>
                {weekDates.map((date, idx) => {
                  const weekend = isWeekend(idx);
                  const entry = dailyEntries[idx] || {};
                  return (
                    <td key={idx} style={{ ...globalStyles.tableCell, textAlign: "center", background: weekend ? "#f5f5f5" : "white" }}>
                      {weekend ? (
                        <span style={{ color: designSystem.colors.textSecondary, fontSize: "12px" }}>—</span>
                      ) : (
                        <>
                          <input
                            type="number"
                            min="0"
                            max="24"
                            step="0.5"
                            value={entry.hours || ""}
                            onChange={e => handleDayChange(idx, "hours", e.target.value ? Number(e.target.value) : 0)}
                            style={{ width: "60px", padding: "4px 8px", textAlign: "center", border: "1px solid #ddd", borderRadius: "4px" }}
                          />
                          <br/>
                          <input
                            type="text"
                            placeholder="Notes"
                            value={entry.description || ""}
                            onChange={e => handleDayChange(idx, "description", e.target.value)}
                            style={{ width: "100%", padding: "4px 8px", marginTop: "4px", fontSize: "12px", border: "1px solid #ddd", borderRadius: "4px" }}
                          />
                        </>
                      )}
                    </td>
                  );
                })}
                <td style={{ ...globalStyles.tableCell, textAlign: "center", fontWeight: 600 }}>
                  {Object.values(dailyEntries).reduce((sum, e) => sum + (e.hours || 0), 0).toFixed(1)} hrs
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div style={{ marginTop: designSystem.spacing.lg, display: "flex", gap: designSystem.spacing.md, justifyContent: "flex-end" }}>
          <p style={{ alignSelf: "center", color: designSystem.colors.textSecondary, fontSize: "13px" }}>
            Weekends (Sat/Sun) are not editable. Enter hours for Mon-Fri only.
          </p>
          <Button variant="primary" onClick={handleSubmit} disabled={loading || !selectedProjectId || !hasWeekdayEntries}>
            {loading ? "Submitting..." : "Submit Weekly Timesheet"}
          </Button>
        </div>
      </div>
  );
}