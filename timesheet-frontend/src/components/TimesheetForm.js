// src/components/Timesheets.js

import React, { useCallback, useEffect, useState } from "react";
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
  // ============================================================
  // DATE
  // ============================================================

  const getTodayDate = () => {
    const today = new Date();

    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  // ============================================================
  // DATA
  // ============================================================

  const [employees, setEmployees] = useState([]);
  const [projects, setProjects] = useState([]);
  const [allocations, setAllocations] = useState([]);
  const [timesheets, setTimesheets] = useState([]);

  // ============================================================
  // UI STATE
  // ============================================================

  const [showTimesheetModal, setShowTimesheetModal] = useState(false);
  const [timesheetError, setTimesheetError] = useState("");

  // ============================================================
  // TIMESHEET FORM
  // ============================================================

  const [filteredProjects, setFilteredProjects] = useState([]);

  const [newTimesheet, setNewTimesheet] = useState({
    employeeId: employeeId || "",
    projectId: "",
    date: getTodayDate(),
    hours: "",
    description: ""
  });

  // ============================================================
  // FILTERS
  // ============================================================

  const [searchType, setSearchType] = useState("all");
  const [searchText, setSearchText] = useState("");
  const [filterDate, setFilterDate] = useState("");

  // ============================================================
  // INITIAL LOAD
  // ============================================================

  useEffect(() => {
    loadEmployees();
    loadProjects();
    loadAllocations();
    loadTimesheets();
  }, []);

  // ============================================================
  // LOAD DATA
  // ============================================================

  const loadEmployees = async () => {
    try {
      const res = await getEmployees();
      setEmployees(res.data);
    } catch (error) {
      console.error("Unable to load employees:", error);
    }
  };

  const loadProjects = async () => {
    try {
      const res = await getProjects();
      setProjects(res.data);
    } catch (error) {
      console.error("Unable to load projects:", error);
    }
  };

  const loadAllocations = async () => {
    try {
      const res = await getAllocations();
      setAllocations(res.data);
    } catch (error) {
      console.error("Unable to load allocations:", error);
    }
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

  // ============================================================
  // EMPLOYEE CHANGE
  // ============================================================

  const handleEmployeeChange = useCallback(
    (selectedEmployeeId) => {
      setNewTimesheet((previous) => ({
        ...previous,
        employeeId: selectedEmployeeId,
        projectId: ""
      }));

      const assignedProjects = allocations
        .filter(
          (allocation) =>
            String(allocation.employeeId) ===
            String(selectedEmployeeId)
        )
        .map((allocation) =>
          projects.find(
            (project) =>
              Number(project.projectId) ===
              Number(allocation.projectId)
          )
        )
        .filter(Boolean);

      // Remove duplicate projects
      const uniqueProjects = assignedProjects.filter(
        (project, index, self) =>
          index ===
          self.findIndex(
            (p) =>
              Number(p.projectId) ===
              Number(project.projectId)
          )
      );

      setFilteredProjects(uniqueProjects);
    },
    [allocations, projects]
  );

  // ============================================================
  // SET EMPLOYEE FROM PARENT
  // ============================================================

  useEffect(() => {
    if (
      employeeId &&
      allocations.length > 0 &&
      projects.length > 0
    ) {
      handleEmployeeChange(employeeId);
    }
  }, [
    employeeId,
    allocations,
    projects,
    handleEmployeeChange
  ]);

  // ============================================================
  // OPEN TIMESHEET MODAL
  // ============================================================

  const handleOpenTimesheetModal = () => {
    setTimesheetError("");

    setNewTimesheet({
      employeeId: employeeId || "",
      projectId: "",
      date: getTodayDate(),
      hours: "",
      description: ""
    });

    if (employeeId) {
      handleEmployeeChange(employeeId);
    } else {
      setFilteredProjects([]);
    }

    setShowTimesheetModal(true);
  };

  // ============================================================
  // CLOSE TIMESHEET MODAL
  // ============================================================

  const handleCloseTimesheetModal = () => {
    setTimesheetError("");
    setShowTimesheetModal(false);
  };

  // ============================================================
  // ADD TIMESHEET
  // ============================================================

  const handleAddTimesheet = async () => {
    const selectedEmployeeId = newTimesheet.employeeId;
    const selectedProjectId = Number(newTimesheet.projectId);
    const hoursWorked = Number(newTimesheet.hours);

    if (
      !selectedEmployeeId ||
      !newTimesheet.date ||
      hoursWorked <= 0
    ) {
      setTimesheetError(
        "Employee, date, and valid hours are required."
      );
      return;
    }

    if (!newTimesheet.projectId) {
      setTimesheetError("Please select a project.");
      return;
    }

    try {
      const entryDate = newTimesheet.date;

      const isCompOff = hoursWorked > 8;
      const compOffHours = isCompOff
        ? hoursWorked - 8
        : 0;

      await submitTimesheet({
        employeeId: selectedEmployeeId,
        projectId: selectedProjectId,
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
            description:
              newTimesheet.description +
              (isCompOff
                ? ` [Comp-off: ${compOffHours} hrs]`
                : "")
          }
        ],

        approvals: []
      });

      // Refresh list
      await loadTimesheets();

      // Reset form
      setNewTimesheet({
        employeeId: selectedEmployeeId || "",
        projectId: "",
        date: getTodayDate(),
        hours: "",
        description: ""
      });

      setTimesheetError("");

      // Close popup
      setShowTimesheetModal(false);

      if (onSubmitted) {
        onSubmitted();
      }
    } catch (error) {
      const validationErrors =
        error.response?.data?.errors;

      const message = validationErrors
        ? Object.values(validationErrors).flat().join(" ")
        : error.response?.data?.title ||
          "Unable to submit entry.";

      setTimesheetError(message);
    }
  };

  // ============================================================
  // FORMAT DATE
  // ============================================================

  const formatDate = (dateStr) => {
    if (!dateStr) {
      return "";
    }

    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      return dateStr;
    }

    return dateStr.substring(0, 10);
  };

  // ============================================================
  // GET EMPLOYEE
  // ============================================================

  const getEmployee = (id) => {
    return employees.find(
      (employee) =>
        String(employee.id) === String(id)
    );
  };

  // ============================================================
  // GET PROJECT
  // ============================================================

  const getProject = (id) => {
    return projects.find(
      (project) =>
        Number(project.projectId) === Number(id)
    );
  };

  // ============================================================
  // GET CLIENT NAME
  // ============================================================

  const getClientName = (project) => {
    if (!project) {
      return "";
    }

    /*
     * The current Timesheets API does not load clients
     * directly. If your Project API response contains
     * clientName, it will be used here.
     */
    return (
      project.clientName ||
      project.client?.clientName ||
      project.client?.name ||
      project.clientId ||
      ""
    );
  };

  // ============================================================
  // TIMESHEET DISPLAY DATA
  // ============================================================

  const displayEntries = timesheets.map((ts) => ({
    id: `timesheet-${ts.timesheetId}`,
    actualId: ts.timesheetId,
    type: "Project",
    employeeId: ts.employeeId,
    projectId: ts.projectId,
    date: ts.date,
    hours: ts.hoursWorked,
    description:
      ts.entries?.[0]?.description || "",
    status: ts.approvalStatus || "Pending"
  }));

  // ============================================================
  // FILTER TIMESHEETS
  // ============================================================

  const filteredTimesheets = displayEntries.filter(
    (entry) => {
      const employee = getEmployee(entry.employeeId);
      const project = getProject(entry.projectId);

      const employeeName =
        employee?.name?.toLowerCase() || "";

      const employeeEmail =
        employee?.email?.toLowerCase() || "";

      const projectName =
        project?.projectName?.toLowerCase() || "";

      const clientName =
        String(getClientName(project)).toLowerCase();

      const search =
        searchText.trim().toLowerCase();

      let matchesSearch = true;

      if (search) {
        switch (searchType) {
          case "employee":
            matchesSearch =
              employeeName.includes(search) ||
              employeeEmail.includes(search);
            break;

          case "project":
            matchesSearch =
              projectName.includes(search);
            break;

          case "client":
            matchesSearch =
              clientName.includes(search);
            break;

          case "all":
          default:
            matchesSearch =
              employeeName.includes(search) ||
              employeeEmail.includes(search) ||
              projectName.includes(search) ||
              clientName.includes(search);
            break;
        }
      }

      const matchesDate =
        !filterDate ||
        formatDate(entry.date) === filterDate;

      return matchesSearch && matchesDate;
    }
  );

  // ============================================================
  // CLEAR FILTERS
  // ============================================================

  const clearFilters = () => {
    setSearchType("all");
    setSearchText("");
    setFilterDate("");
  };

  // ============================================================
  // STYLES
  // ============================================================

  const labelStyle = {
    display: "block",
    marginBottom: designSystem.spacing.xs,
    color: designSystem.colors.text,
    ...designSystem.typography.bodyMedium
  };

  const inputStyle = {
    ...globalStyles.input,
    marginBottom: designSystem.spacing.sm
  };

  const selectStyle = {
    ...inputStyle
  };

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div
      style={{
        padding: designSystem.spacing.lg,
        maxWidth: "1100px",
        margin: "0 auto",
        fontFamily: "Roboto, Arial, sans-serif"
      }}
    >
      {/* ======================================================
          PAGE HEADER
      ====================================================== */}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: designSystem.spacing.lg
        }}
      >
        <h2
          style={{
            margin: 0,
            ...designSystem.typography.h1,
            color: designSystem.colors.text
          }}
        >
          Timesheets
        </h2>

        <Button
          variant="primary"
          onClick={handleOpenTimesheetModal}
        >
          Create Timesheet
        </Button>
      </div>

      {/* ======================================================
          ERROR MESSAGE
      ====================================================== */}

      {timesheetError && !showTimesheetModal && (
        <div
          role="alert"
          style={{
            marginBottom: designSystem.spacing.md,
            color: designSystem.colors.error,
            ...designSystem.typography.body
          }}
        >
          {timesheetError}
        </div>
      )}

      {/* ======================================================
          FILTER SECTION
      ====================================================== */}

      {!employeeId && (
        <div
          style={{
            ...globalStyles.card,
            marginBottom: designSystem.spacing.lg
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: designSystem.spacing.md,
              flexWrap: "wrap",
              gap: designSystem.spacing.sm
            }}
          >
            <h3
              style={{
                ...designSystem.typography.h2,
                margin: 0,
                color: designSystem.colors.text
              }}
            >
              Search Timesheets
            </h3>

            {(searchText || filterDate) && (
              <Button
                variant="secondary"
                size="small"
                onClick={clearFilters}
              >
                Clear Filters
              </Button>
            )}
          </div>

          <div
            style={{
              display: "flex",
              gap: designSystem.spacing.sm,
              flexWrap: "wrap",
              alignItems: "flex-end"
            }}
          >
            {/* Search By */}
            <div
              style={{
                flex: "0 0 180px",
                minWidth: "160px"
              }}
            >
              <label style={labelStyle}>
                Search By
              </label>

              <select
                value={searchType}
                onChange={(e) => {
                  setSearchType(e.target.value);
                  setSearchText("");
                }}
                style={selectStyle}
              >
                <option value="all">
                  All
                </option>

                <option value="employee">
                  Employee
                </option>

                <option value="project">
                  Project
                </option>

                <option value="client">
                  Client
                </option>
              </select>
            </div>

            {/* Search */}
            <div
              style={{
                flex: 1,
                minWidth: "250px"
              }}
            >
              <label style={labelStyle}>
                Search
              </label>

              <input
                type="text"
                value={searchText}
                onChange={(e) =>
                  setSearchText(e.target.value)
                }
                placeholder={
                  searchType === "employee"
                    ? "Search employee..."
                    : searchType === "project"
                    ? "Search project..."
                    : searchType === "client"
                    ? "Search client..."
                    : "Search employee, project or client..."
                }
                style={inputStyle}
              />
            </div>

            {/* Date */}
            <div
              style={{
                flex: "0 0 170px",
                minWidth: "150px"
              }}
            >
              <label style={labelStyle}>
                Date
              </label>

              <input
                type="date"
                value={filterDate}
                onChange={(e) =>
                  setFilterDate(e.target.value)
                }
                style={inputStyle}
              />
            </div>
          </div>

          {/* Result Count */}
          <div
            style={{
              marginTop: designSystem.spacing.xs,
              color: designSystem.colors.textSecondary,
              ...designSystem.typography.body
            }}
          >
            Showing {filteredTimesheets.length} of{" "}
            {displayEntries.length} timesheet
            {displayEntries.length !== 1 ? "s" : ""}
          </div>
        </div>
      )}

      {/* ======================================================
          TIMESHEET LIST
      ====================================================== */}

      {!employeeId && (
        <div>
          <h3
            style={{
              ...designSystem.typography.h2,
              margin: `0 0 ${designSystem.spacing.sm} 0`,
              color: designSystem.colors.text
            }}
          >
            Timesheet List
          </h3>

          <div
            style={{
              ...globalStyles.cardElevated
            }}
          >
            <div style={{ overflowX: "auto" }}>
              <table
                style={{
                  ...globalStyles.table
                }}
              >
                <thead>
                  <tr
                    style={{
                      ...globalStyles.tableHeader
                    }}
                  >
                    <th
                      style={
                        globalStyles.tableheadercell
                      }
                    >
                      Employee
                    </th>

                    <th
                      style={
                        globalStyles.tableheadercell
                      }
                    >
                      Project
                    </th>

                    <th
                      style={
                        globalStyles.tableheadercell
                      }
                    >
                      Client
                    </th>

                    <th
                      style={
                        globalStyles.tableheadercell
                      }
                    >
                      Date
                    </th>

                    <th
                      style={
                        globalStyles.tableheadercell
                      }
                    >
                      Hours
                    </th>

                    <th
                      style={
                        globalStyles.tableheadercell
                      }
                    >
                      Description
                    </th>

                    <th
                      style={
                        globalStyles.tableheadercell
                      }
                    >
                      Status
                    </th>

                    <th
                      style={
                        globalStyles.tableheadercell
                      }
                    >
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredTimesheets.map(
                    (entry) => {
                      const employee =
                        getEmployee(
                          entry.employeeId
                        );

                      const project =
                        getProject(
                          entry.projectId
                        );

                      const clientName =
                        getClientName(project);

                      return (
                        <tr
                          key={entry.id}
                          style={{
                            ...globalStyles.tableRowEven
                          }}
                        >
                          {/* Employee */}
                          <td
                            style={{
                              ...globalStyles.tableCell
                            }}
                          >
                            {employee
                              ? employee.name
                              : entry.employeeId}
                          </td>

                          {/* Project */}
                          <td
                            style={{
                              ...globalStyles.tableCell
                            }}
                          >
                            {project
                              ? project.projectName
                              : entry.projectId || "—"}
                          </td>

                          {/* Client */}
                          <td
                            style={{
                              ...globalStyles.tableCell
                            }}
                          >
                            {clientName || "—"}
                          </td>

                          {/* Date */}
                          <td
                            style={{
                              ...globalStyles.tableCell
                            }}
                          >
                            {formatDate(
                              entry.date
                            )}
                          </td>

                          {/* Hours */}
                          <td
                            style={{
                              ...globalStyles.tableCell
                            }}
                          >
                            {entry.hours} hr
                          </td>

                          {/* Description */}
                          <td
                            style={{
                              ...globalStyles.tableCell
                            }}
                          >
                            {entry.description}
                          </td>

                          {/* Status */}
                          <td
                            style={{
                              ...globalStyles.tableCell
                            }}
                          >
                            {entry.status}
                          </td>

                          {/* Action */}
                          <td
                            style={{
                              ...globalStyles.tableCell
                            }}
                          >
                            {entry.status ===
                              "Pending" && (
                              <div
                                style={{
                                  display: "flex",
                                  gap: designSystem.spacing.xs,
                                  flexWrap: "wrap"
                                }}
                              >
                                <Button
                                  variant="secondary"
                                  size="small"
                                  onClick={async () => {
                                    if (
                                      window.confirm(
                                        "Approve timesheet?"
                                      )
                                    ) {
                                      await approveTimesheet(
                                        entry.actualId,
                                        "Approved"
                                      );

                                      await loadTimesheets();
                                    }
                                  }}
                                >
                                  Approve
                                </Button>

                                <Button
                                  variant="secondary"
                                  size="small"
                                  onClick={async () => {
                                    if (
                                      window.confirm(
                                        "Reject timesheet?"
                                      )
                                    ) {
                                      await approveTimesheet(
                                        entry.actualId,
                                        "Rejected"
                                      );

                                      await loadTimesheets();
                                    }
                                  }}
                                  style={{
                                    background:
                                      designSystem
                                        .colors
                                        .error,
                                    color:
                                      designSystem
                                        .colors
                                        .white
                                  }}
                                >
                                  Reject
                                </Button>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    }
                  )}
                </tbody>
              </table>
            </div>

            {filteredTimesheets.length === 0 && (
              <p
                style={{
                  textAlign: "center",
                  padding: designSystem.spacing.xl,
                  color:
                    designSystem.colors
                      .textSecondary,
                  ...designSystem.typography.body
                }}
              >
                {searchText || filterDate
                  ? "No timesheets found matching your search."
                  : "No timesheets available."}
              </p>
            )}
          </div>
        </div>
      )}

      {/* ======================================================
          CREATE TIMESHEET MODAL
      ====================================================== */}

      {showTimesheetModal && (
        <div
          onClick={handleCloseTimesheetModal}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: designSystem.spacing.lg
          }}
        >
          <div
            onClick={(e) =>
              e.stopPropagation()
            }
            style={{
              ...globalStyles.cardElevated,
              width: "100%",
              maxWidth: "800px",
              maxHeight: "90vh",
              overflowY: "auto",
              position: "relative"
            }}
          >
            {/* Modal Header */}

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: designSystem.spacing.lg,
                paddingBottom: designSystem.spacing.md,
                borderBottom:
                  "1px solid #e5e7eb"
              }}
            >
              <div>
                <h3
                  style={{
                    ...designSystem.typography.h2,
                    margin: 0,
                    color: designSystem.colors.text
                  }}
                >
                  Create Timesheet
                </h3>

                <div
                  style={{
                    marginTop:
                      designSystem.spacing.xs,
                    color:
                      designSystem.colors
                        .textSecondary,
                    ...designSystem.typography.body
                  }}
                >
                  Enter the employee's daily
                  working hours.
                </div>
              </div>

              <button
                type="button"
                onClick={
                  handleCloseTimesheetModal
                }
                aria-label="Close"
                style={{
                  border: "none",
                  background: "transparent",
                  fontSize: "26px",
                  cursor: "pointer",
                  color:
                    designSystem.colors
                      .textSecondary,
                  lineHeight: 1
                }}
              >
                ×
              </button>
            </div>

            {/* Modal Error */}

            {timesheetError && (
              <div
                role="alert"
                style={{
                  marginBottom:
                    designSystem.spacing.md,
                  padding:
                    designSystem.spacing.sm,
                  borderRadius: "6px",
                  color:
                    designSystem.colors.error,
                  backgroundColor:
                    "rgba(220, 38, 38, 0.08)",
                  ...designSystem.typography.body
                }}
              >
                {timesheetError}
              </div>
            )}

            {/* ==================================================
                FORM
            ================================================== */}

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(220px, 1fr))",
                gap: designSystem.spacing.md
              }}
            >
              {/* Employee */}

              {!employeeId && (
                <div>
                  <label style={labelStyle}>
                    Employee
                  </label>

                  <select
                    value={
                      newTimesheet.employeeId
                    }
                    onChange={(e) =>
                      handleEmployeeChange(
                        e.target.value
                      )
                    }
                    style={selectStyle}
                  >
                    <option value="">
                      Select Employee
                    </option>

                    {employees.map(
                      (employee) => (
                        <option
                          key={employee.id}
                          value={employee.id}
                        >
                          {employee.name}
                        </option>
                      )
                    )}
                  </select>
                </div>
              )}

              {/* Project */}

              <div>
                <label style={labelStyle}>
                  Project
                </label>

                <select
                  value={
                    newTimesheet.projectId
                  }
                  onChange={(e) =>
                    setNewTimesheet(
                      (previous) => ({
                        ...previous,
                        projectId:
                          e.target.value
                      })
                    )
                  }
                  disabled={
                    !newTimesheet.employeeId
                  }
                  style={selectStyle}
                >
                  <option value="">
                    Select Project
                  </option>

                  {filteredProjects.map(
                    (project) => (
                      <option
                        key={project.projectId}
                        value={project.projectId}
                      >
                        {project.projectName}
                      </option>
                    )
                  )}
                </select>
              </div>

              {/* Date */}

              <div>
                <label style={labelStyle}>
                  Date
                </label>

                <input
                  type="date"
                  value={newTimesheet.date}
                  onChange={(e) =>
                    setNewTimesheet(
                      (previous) => ({
                        ...previous,
                        date: e.target.value
                      })
                    )
                  }
                  style={inputStyle}
                />
              </div>

              {/* Hours */}

              <div>
                <label style={labelStyle}>
                  Hours
                </label>

                <input
                  type="number"
                  value={newTimesheet.hours}
                  onChange={(e) =>
                    setNewTimesheet(
                      (previous) => ({
                        ...previous,
                        hours: e.target.value
                      })
                    )
                  }
                  placeholder="Enter hours"
                  min="0"
                  step="0.5"
                  style={inputStyle}
                />
              </div>

              {/* Description */}

              <div
                style={{
                  gridColumn:
                    "1 / -1"
                }}
              >
                <label style={labelStyle}>
                  Description
                </label>

                <textarea
                  value={
                    newTimesheet.description
                  }
                  onChange={(e) =>
                    setNewTimesheet(
                      (previous) => ({
                        ...previous,
                        description:
                          e.target.value
                      })
                    )
                  }
                  placeholder="Enter work description..."
                  rows={4}
                  style={{
                    ...globalStyles.input,
                    marginBottom:
                      designSystem.spacing.sm,
                    width: "100%",
                    resize: "vertical",
                    boxSizing: "border-box"
                  }}
                />
              </div>
            </div>

            {/* ==================================================
                MODAL FOOTER
            ================================================== */}

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: designSystem.spacing.sm,
                marginTop: designSystem.spacing.lg,
                paddingTop: designSystem.spacing.md,
                borderTop:
                  "1px solid #e5e7eb"
              }}
            >
              <Button
                variant="secondary"
                onClick={
                  handleCloseTimesheetModal
                }
              >
                Cancel
              </Button>

              <Button
                variant="primary"
                onClick={
                  handleAddTimesheet
                }
                disabled={
                  !newTimesheet.employeeId ||
                  !newTimesheet.projectId ||
                  !newTimesheet.date ||
                  Number(newTimesheet.hours) <= 0
                }
              >
                Create Timesheet
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

