import React, { useEffect, useState } from "react";
import {
  getEmployees,
  getProjects,
  getAllocations,   // <-- NEW
  getAllTimesheets,
  submitTimesheet
} from "../Services/Api";

export default function Timesheets() {
  const [employees, setEmployees] = useState([]);
  const [projects, setProjects] = useState([]);
  const [allocations, setAllocations] = useState([]); // NEW
  const [timesheets, setTimesheets] = useState([]);
  const [timesheetError, setTimesheetError] = useState("");
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [filters, setFilters] = useState({ employeeId: "", projectId: "", date: "" });
  const [newTimesheet, setNewTimesheet] = useState({
    employeeId: "",
    projectId: "",
    date: "",
    hours: "",
    description: ""
  });

  useEffect(() => {
    loadEmployees();
    loadProjects();
    loadAllocations();   // NEW
    loadTimesheets();
  }, []);

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

  const handleEmployeeChange = (employeeId) => {
    setNewTimesheet({ ...newTimesheet, employeeId, projectId: "" });

    // ✅ Correct filtering using allocations
    const assignedProjects = allocations
      .filter((a) => a.employeeId === Number(employeeId))
      .map((a) => projects.find((p) => p.projectId === a.projectId))
      .filter(Boolean);

    setFilteredProjects(assignedProjects);
  };

  const handleAddTimesheet = async () => {
    const employeeId = Number(newTimesheet.employeeId);
    const projectId = Number(newTimesheet.projectId);
    const hoursWorked = Number(newTimesheet.hours);

    if (!employeeId || !projectId || !newTimesheet.date || !hoursWorked) {
      setTimesheetError("Employee, project, date, and hours are required.");
      return;
    }

    const entryDate = new Date(`${newTimesheet.date}T00:00:00`).toISOString();

    try {
      await submitTimesheet({
        employeeId,
        projectId,
        date: entryDate,
        hoursWorked,
        submissionType: "Daily",
        approvalStatus: "Pending",
        weekStartDate: entryDate,
        weekEndDate: entryDate,
        entries: [
          {
            date: entryDate,
            hours: hoursWorked,
            description: newTimesheet.description
          }
        ],
        approvals: []
      });
      setNewTimesheet({ employeeId: "", projectId: "", date: "", hours: "", description: "" });
      setTimesheetError("");
      await loadTimesheets();
    } catch (error) {
      const validationErrors = error.response?.data?.errors;
      const validationMessage = validationErrors
        ? Object.values(validationErrors).flat().join(" ")
        : "Unable to submit timesheet.";
      setTimesheetError(validationMessage);
    }
  };

  // ✅ Apply filters correctly
  const formatDate = (dateStr) => {
      if (!dateStr) return "";
      return new Date(dateStr).toLocaleDateString("en-US"); // MM/DD/YYYY
    };

    const filteredTimesheets = timesheets.filter((ts) => {
    const tsDateFormatted = formatDate(ts.date);
    const filterDateFormatted = filters.date ? formatDate(filters.date) : "";

    return (
      (filters.employeeId ? ts.employeeId === Number(filters.employeeId) : true) &&
      (filters.projectId ? ts.projectId === Number(filters.projectId) : true) &&
      (filters.date ? tsDateFormatted === filterDateFormatted : true)
    );
  });



  return (
    <div style={{ padding: "20px" }}>
      <h2>Timesheets</h2>
      {timesheetError && (
        <p role="alert" style={{ color: "#b00020" }}>
          {timesheetError}
        </p>
      )}

      {/* Timesheet Entry Form */}
      <table border="1" cellPadding="8" style={{ marginBottom: "20px", width: "100%" }}>
        <tbody>
          <tr>
            <td>
              <label>Employee</label><br />
              <select
                value={newTimesheet.employeeId}
                onChange={(e) => handleEmployeeChange(e.target.value)}
              >
                <option value="">Select Employee</option>
                {employees.map((emp) => (
                  <option key={emp.employeeId} value={emp.employeeId}>
                    {emp.name}
                  </option>
                ))}
              </select>
            </td>
            <td>
              <label>Project</label><br />
              <select
                value={newTimesheet.projectId}
                onChange={(e) => setNewTimesheet({ ...newTimesheet, projectId: e.target.value })}
                disabled={!newTimesheet.employeeId}
              >
                <option value="">Select Project</option>
                {filteredProjects.map((proj) => (
                  <option key={proj.projectId} value={proj.projectId}>
                    {proj.projectName}
                  </option>
                ))}
              </select>
            </td>
            <td>
              <label>Date</label><br />
              <input
                type="date"
                value={newTimesheet.date}
                onChange={(e) => setNewTimesheet({ ...newTimesheet, date: e.target.value })}
              />
            </td>
            <td>
              <label>Hours</label><br />
              <input
                type="number"
                value={newTimesheet.hours}
                onChange={(e) => setNewTimesheet({ ...newTimesheet, hours: e.target.value })}
              />
            </td>
            <td>
              <label>Description</label><br />
              <input
                type="text"
                value={newTimesheet.description}
                onChange={(e) => setNewTimesheet({ ...newTimesheet, description: e.target.value })}
              />
            </td>
            <td>
              <button onClick={handleAddTimesheet}>Submit Timesheet</button>
            </td>
          </tr>
        </tbody>
      </table>

      {/* Filters */}
      <h3>Filter Timesheets</h3>
      <div style={{ marginBottom: "15px" }}>
        <select
          value={filters.employeeId}
          onChange={(e) => setFilters({ ...filters, employeeId: e.target.value })}
        >
          <option value="">Filter by Employee</option>
          {employees.map((emp) => (
            <option key={emp.employeeId} value={emp.employeeId}>
              {emp.name}
            </option>
          ))}
        </select>

        <select
          value={filters.projectId}
          onChange={(e) => setFilters({ ...filters, projectId: e.target.value })}
          style={{ marginLeft: "10px" }}
        >
          <option value="">Filter by Project</option>
          {projects.map((proj) => (
            <option key={proj.projectId} value={proj.projectId}>
              {proj.projectName}
            </option>
          ))}
        </select>

        <input
          type="date"
          value={filters.date}
          onChange={(e) => setFilters({ ...filters, date: e.target.value })}
          style={{ marginLeft: "10px" }}
        />
      </div>

      {/* Timesheet List */}
      <table border="1" width="100%" cellPadding="8">
        <thead>
          <tr>
            <th>Employee</th>
            <th>Project</th>
            <th>Date</th>
            <th>Hours</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          {filteredTimesheets.map((ts) => (
            <tr key={ts.timesheetId}>
              <td>{employees.find((e) => e.employeeId === ts.employeeId)?.name}</td>
              <td>{projects.find((p) => p.projectId === ts.projectId)?.projectName}</td>
              <td>{formatDate(ts.date)}</td>
              <td>{ts.hoursWorked} hr</td> {/* ✅ root-level hours */}
              <td>{ts.entries?.[0]?.description || ""}</td> {/* ✅ from entries */}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
