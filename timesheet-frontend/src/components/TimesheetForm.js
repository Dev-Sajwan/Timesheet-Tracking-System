import React, { useEffect, useState } from "react";
import {
  getEmployees,
  getProjects,
  getAllocations,   // <-- NEW
  getAllTimesheets,
  submitTimesheet,
  getBenchHours,
  addBenchHour
} from "../Services/Api";

export default function Timesheets() {
  const getTodayDate = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

   return `${year}-${month}-${day}`;
  };
  const [employees, setEmployees] = useState([]);
  const [projects, setProjects] = useState([]);
  const [allocations, setAllocations] = useState([]); // NEW
  const [timesheets, setTimesheets] = useState([]);
  const [timesheetError, setTimesheetError] = useState("");
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [benchHours, setBenchHours] = useState([]);
  const [filters, setFilters] = useState({ employeeId: "", projectId: "", date: "" });
  const [newTimesheet, setNewTimesheet] = useState({
    employeeId: "",
    entryType: "Project",
    projectId: "",
    date: getTodayDate(),
    hours: "",
    description: ""
  });

  useEffect(() => {
    loadEmployees();
    loadProjects();
    loadAllocations();   // NEW
    loadTimesheets();
    loadBenchHours();
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

  const loadBenchHours = async () => {
    try {
      const res = await getBenchHours();
      setBenchHours(res.data);
    } catch (error) {
      setTimesheetError("Unable to load bench hours.");
    }
  };

  const handleEmployeeChange = (employeeId) => {
    setNewTimesheet({ ...newTimesheet, employeeId, projectId: "" });

    // ✅ Correct filtering using allocations
    const assignedProjects = allocations
      .filter((a) => String(a.employeeId) === String(employeeId))
      .map((a) => projects.find((p) => p.projectId === a.projectId))
      .filter(Boolean);

    setFilteredProjects(assignedProjects);
  };

  const handleAddTimesheet = async () => {
    const employeeId = newTimesheet.employeeId;
    const projectId = Number(newTimesheet.projectId);
    const hoursWorked = Number(newTimesheet.hours);

    if (!employeeId || !newTimesheet.date || hoursWorked <= 0) {
      setTimesheetError(
        "Employee, date, and valid hours are required."
      );
      return;
    }

      if (
        newTimesheet.entryType === "Project" &&
        !newTimesheet.projectId
      ) {
        setTimesheetError("Please select a project.");
        return;
      }

        // const entryDate = new Date(
        //   `${newTimesheet.date}T00:00:00`
        // ).toISOString();  // Convert to ISO format for backend
        const entryDate = newTimesheet.date;
        
    try {
    if (newTimesheet.entryType === "Bench") {
      await addBenchHour({
        employeeId,
        date: entryDate,
        hours: hoursWorked,
        description: newTimesheet.description
      });

      await loadBenchHours();
    } else {
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

      await loadTimesheets();
    }

    setNewTimesheet({
      employeeId: "",
      entryType: "Project",
      projectId: "",
      date: getTodayDate(),
      hours: "",
      description: ""
    });

    setFilteredProjects([]);
    setTimesheetError("");
  } catch (error) {
    const validationErrors = error.response?.data?.errors;

    const message = validationErrors
      ? Object.values(validationErrors).flat().join(" ")
      : error.response?.data?.title ||
        "Unable to submit entry.";

    setTimesheetError(message);
  }
};

  // ✅ Apply filters correctly
  // Format dates consistently
const formatDate = (dateStr) => {
  if (!dateStr) return "";

  // Keep date-only values unchanged
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return dateStr;
  }

  // For ISO datetime values, use the date portion
  return dateStr.substring(0, 10);
};

// Filter project timesheets
const filteredTimesheets = timesheets.filter((ts) => {
  return (
    (!filters.employeeId ||
      String(ts.employeeId) === String(filters.employeeId)) &&
    (!filters.projectId ||
      Number(ts.projectId) === Number(filters.projectId)) &&
    (!filters.date ||
      formatDate(ts.date) === filters.date)
  );
});



const filteredBenchHours = benchHours.filter((bench) => {
  return (
    (!filters.employeeId ||
      String(bench.employeeId) === String(filters.employeeId)) &&
    !filters.projectId &&
    (!filters.date ||
      formatDate(bench.date) === filters.date)
  );
});

// Combine project timesheets and bench hours
const displayEntries = [
  ...filteredTimesheets.map((ts) => ({
    id: `timesheet-${ts.timesheetId}`,
    type: "Project",
    employeeId: ts.employeeId,
    projectId: ts.projectId,
    date: ts.date,
    hours: ts.hoursWorked,
    description: ts.entries?.[0]?.description || "",
  })),

  ...filteredBenchHours.map((bench) => ({
    id: `bench-${bench.benchHourId}`,
    type: "Bench",
    employeeId: bench.employeeId,
    projectId: null,
    date: bench.date,
    hours: bench.hours,
    description: bench.description || "",
  })),
];



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
                  <option key={emp.id} value={emp.id}>
                    {emp.name}
                  </option>
                ))}
              </select>
            </td>
            <td>
              <label>Entry Type</label><br />

              <select
                value={newTimesheet.entryType}
                onChange={(e) =>
                  setNewTimesheet({
                    ...newTimesheet,
                    entryType: e.target.value,
                    projectId: ""
                  })
                }
              >
                <option value="Project">Project</option>
                <option value="Bench">Bench</option>
              </select>
            </td>
            {newTimesheet.entryType === "Project" && (
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
            </td>)}
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
            <option key={emp.id} value={emp.id}>
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
            <th>Type</th>
            <th>Project</th>
            <th>Date</th>
            <th>Hours</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
        {displayEntries.map((entry) => (
          <tr key={entry.id}>
            <td>
              {employees.find(
                (e) => String(e.id) === String(entry.employeeId)
              )?.name || entry.employeeId}
            </td>
            <td>{entry.type}</td>
            <td>
              {entry.projectId
                ? projects.find(
                    (p) =>
                      Number(p.projectId) === Number(entry.projectId)
                  )?.projectName || entry.projectId
                : "—"}
            </td>
            <td>{formatDate(entry.date)}</td>
            <td>{entry.hours} hr</td>
            <td>{entry.description}</td>
          </tr>
        ))}
      </tbody>
      </table>
    </div>
  );
}
