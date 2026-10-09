import React, { useEffect, useState, useMemo } from "react";
  import {
    getAllocations,
    addAllocation,
    deleteAllocation,
    getEmployees,
    getProjects,
    getClients,
    getBusinessUnits,
    addBusinessUnit
  } from "../Services/Api";
  import { designSystem, globalStyles } from "../styles/designSystem";
  import Button from "./Button";

const formatDate = (value) => {
  if (!value) return "";
  const d = new Date(value);
  if (isNaN(d)) return value;
  return d.toLocaleDateString("en-CA");
};

export default function AllocationList() {
  const [allocations, setAllocations] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [projects, setProjects] = useState([]);
  const [clients, setClients] = useState([]);
  const [businessUnits, setBusinessUnits] = useState([]);

  // Allocation form
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [selectedBusinessUnit, setSelectedBusinessUnit] = useState("");
  const [selectedProject, setSelectedProject] = useState("");
  const [allocationPercent, setAllocationPercent] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Modal
  const [showAllocationModal, setShowAllocationModal] = useState(false);
  const [newBUName, setNewBUName] = useState("");
  const [showAddBU, setShowAddBU] = useState(false);

  // Search
  const [searchTerm, setSearchTerm] = useState("");

  // Filtered projects based on selected Business Unit
  const filteredProjects = useMemo(() => {
    if (!selectedBusinessUnit) return projects;
    return projects.filter(p => p.businessUnitId === Number(selectedBusinessUnit));
  }, [projects, selectedBusinessUnit]);

  useEffect(() => {
    loadAllocations();
    loadEmployees();
    loadProjects();
    loadClients();
    loadBusinessUnits();
  }, []);

  const loadClients = async () => {
    try {
      const res = await getClients();
      setClients(res.data);
    } catch (error) {
      console.error("Error loading clients:", error);
    }
  };

  const loadBusinessUnits = async () => {
    try {
      const res = await getBusinessUnits();
      setBusinessUnits(res.data);
    } catch (error) {
      console.error("Error loading business units:", error);
    }
  };

  const loadAllocations = async () => {
    try {
      const res = await getAllocations();
      console.log("Allocations API response:", res.data);
      setAllocations(res.data);
    } catch (error) {
      console.error("Error loading allocations:", error);
    }
  };

  const loadEmployees = async () => {
    try {
      const res = await getEmployees();
      console.log("Employees API response:", res.data);
      setEmployees(res.data);
    } catch (error) {
      console.error("Error loading employees:", error);
    }
  };

  const loadProjects = async () => {
    try {
      const res = await getProjects();
      console.log("Projects API response:", res.data);
      setProjects(res.data);
    } catch (error) {
      console.error("Error loading projects:", error);
    }
  };

  const handleAdd = async () => {
    if (
      !selectedBusinessUnit ||
      !selectedProject ||
      selectedEmployees.length === 0 ||
      !allocationPercent ||
      !startDate
    ) {
      return;
    }

    try {
      for (const empId of selectedEmployees) {
        const allocationData = {
          employeeId: empId,
          businessUnitId: Number(selectedBusinessUnit),
          projectId: Number(selectedProject),
          allocationPercent: Number(allocationPercent),
          startDate: new Date(startDate).toISOString(),
          endDate: endDate
            ? new Date(endDate).toISOString()
            : null
        };

        console.log("Posting allocation:", allocationData);

        await addAllocation(allocationData);
      }

      // Clear form
      resetAllocationForm();

      // Close modal
      setShowAllocationModal(false);

      // Refresh allocations
      await loadAllocations();
    } catch (error) {
      console.error("Error adding allocation:", error);
    }
  };

  const resetAllocationForm = () => {
    setSelectedEmployees([]);
    setSelectedBusinessUnit("");
    setSelectedProject("");
    setAllocationPercent("");
    setStartDate("");
    setEndDate("");
  };

  const handleAddBusinessUnit = async () => {
    if (!newBUName.trim()) return;
    try {
      await addBusinessUnit({ name: newBUName });
      setNewBUName("");
      setShowAddBU(false);
      await loadBusinessUnits();
    } catch (error) {
      console.error("Error adding business unit:", error);
    }
  };

  const handleCloseModal = () => {
    resetAllocationForm();
    setShowAllocationModal(false);
  };

  const handleDelete = async (id) => {
    try {
      await deleteAllocation(id);
      await loadAllocations();
    } catch (error) {
      console.error("Error deleting allocation:", error);
    }
  };

  const handleEmployeeSelect = (e) => {
    const options = e.target.options;
    const selected = [];

    for (let i = 0; i < options.length; i++) {
      if (options[i].selected) {
        selected.push(options[i].value);
      }
    }

    setSelectedEmployees(selected);
  };

  /*
   * Resolve Employee
   */
  const getEmployee = (employeeId) => {
    return employees.find(
      (emp) => String(emp.id) === String(employeeId)
    );
  };

  /*
   * Resolve Project
   */
  const getProject = (projectId) => {
    return projects.find(
      (project) => Number(project.projectId) === Number(projectId)
    );
  };

  /*
   * Resolve Client
   */
  const getClientName = (project) => {
    if (!project) {
      return "";
    }

    const client = clients.find(
      (client) =>
        Number(client.clientId) === Number(project.clientId)
    );

    return client?.clientName || "";
  };

  /*
   * Search allocations by:
   * - Employee name
   * - Employee email
   * - Project name
   * - Client name
   */
  const filteredAllocations = allocations.filter((alloc) => {
    const employee = getEmployee(alloc.employeeId);
    const project = getProject(alloc.projectId);
    const clientName = getClientName(project);

    const search = searchTerm.trim().toLowerCase();

    if (!search) {
      return true;
    }

    const employeeName = employee?.name || "";
    const employeeEmail = employee?.email || "";
    const projectName = project?.projectName || "";

    return (
      employeeName.toLowerCase().includes(search) ||
      employeeEmail.toLowerCase().includes(search) ||
      projectName.toLowerCase().includes(search) ||
      clientName.toLowerCase().includes(search)
    );
  });

  const labelStyle = {
    display: "block",
    marginBottom: designSystem.spacing.xs,
    color: designSystem.colors.text,
    ...designSystem.typography.bodyStrong
  };

  const inputStyle = {
    ...globalStyles.input,
    marginBottom: designSystem.spacing.sm
  };

  const selectStyle = {
    ...globalStyles.select,
    marginBottom: designSystem.spacing.sm
  };

  return (
    <div
      style={{
        padding: designSystem.spacing.lg,
        maxWidth: "1100px",
        margin: "0 auto",
        fontFamily: "Segoe UI Variable, Segoe UI, sans-serif"
      }}
    >
      {/* =========================================================
          PAGE HEADER
      ========================================================= */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: designSystem.spacing.md
        }}
      >
        <h2
          style={{
            margin: 0,
            ...designSystem.typography.h1,
            color: designSystem.colors.text
          }}
        >
          Allocations
        </h2>

        <Button
          variant="primary"
          onClick={() => setShowAllocationModal(true)}
        >
          Assign Project
        </Button>
      </div>

      {/* =========================================================
          CURRENT ALLOCATIONS
      ========================================================= */}
      <div style={{ ...globalStyles.cardElevated }}>
        {/* Header + Search */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: designSystem.spacing.md,
            marginBottom: designSystem.spacing.md,
            flexWrap: "wrap"
          }}
        >
          <h3
            style={{
              ...designSystem.typography.h3,
              margin: 0,
              color: designSystem.colors.text
            }}
          >
            Current Allocations
          </h3>

          {/* Search */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: designSystem.spacing.xs,
              minWidth: "300px",
              flex: 1,
              maxWidth: "450px"
            }}
          >
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search employee, project or client..."
              style={{
                ...globalStyles.input,
                marginBottom: 0,
                width: "100%"
              }}
            />

            {searchTerm && (
              <Button
                variant="secondary"
                size="small"
                onClick={() => setSearchTerm("")}
              >
                Clear
              </Button>
            )}
          </div>
        </div>

        {/* Search result information */}
        {searchTerm && (
          <div
            style={{
              marginBottom: designSystem.spacing.sm,
              color: designSystem.colors.textSecondary,
              ...designSystem.typography.body
            }}
          >
            Showing {filteredAllocations.length} of {allocations.length}{" "}
            allocation{allocations.length !== 1 ? "s" : ""}
          </div>
        )}

        <div style={{ overflowX: "auto" }}>
          <table style={{ ...globalStyles.table }}>
            <thead>
              <tr style={{ ...globalStyles.tableHeader }}>
                <th style={globalStyles.tableheadercell}>
                  Employee
                </th>

                <th style={globalStyles.tableheadercell}>
                  Business Unit
                </th>

                <th style={globalStyles.tableheadercell}>
                  Project
                </th>

                <th style={globalStyles.tableheadercell}>
                  Client
                </th>

                <th style={globalStyles.tableheadercell}>
                  Allocation %
                </th>

                <th style={globalStyles.tableheadercell}>
                  Start Date
                </th>

                <th style={globalStyles.tableheadercell}>
                  End Date
                </th>

                <th style={globalStyles.tableheadercell}>
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredAllocations.map((alloc) => {
                const emp = getEmployee(alloc.employeeId);
                const proj = getProject(alloc.projectId);
                const clientName = getClientName(proj);

                return (
                  <tr
                    key={alloc.allocationId}
                    style={{ ...globalStyles.tableRow }}
                  >
                    <td style={{ ...globalStyles.tableCell }}>
                      {emp
                        ? `${emp.name} (${emp.email})`
                        : `Employee ${alloc.employeeId}`}
                    </td>

                    <td style={{ ...globalStyles.tableCell }}>
                      {businessUnits.find(bu => bu.businessUnitId === alloc.businessUnitId)?.name || "—"}
                    </td>

                    <td style={{ ...globalStyles.tableCell }}>
                      {proj
                        ? proj.projectName
                        : `Project ${alloc.projectId}`}
                    </td>

                    <td style={{ ...globalStyles.tableCell }}>
                      {clientName ||
                        proj?.clientId ||
                        "—"}
                    </td>

                    <td style={{ ...globalStyles.tableCell }}>
                      {alloc.allocationPercent}%
                    </td>

                    <td style={{ ...globalStyles.tableCell }}>
                      {formatDate(alloc.startDate)}
                    </td>

                    <td style={{ ...globalStyles.tableCell }}>
                      {formatDate(alloc.endDate)}
                    </td>

                    <td style={{ ...globalStyles.tableCell }}>
                      <Button
                        variant="danger"
                        size="small"
                        onClick={() =>
                          handleDelete(
                            alloc.allocationId
                          )
                        }
                      >
                        Remove
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredAllocations.length === 0 && (
          <p
            style={{
              textAlign: "center",
              padding: designSystem.spacing.xl,
              color: designSystem.colors.textSecondary,
              ...designSystem.typography.body
            }}
          >
            {searchTerm
              ? "No allocations found matching your search."
              : "No allocations configured yet."}
          </p>
        )}
      </div>

      {/* =========================================================
          ASSIGN PROJECT MODAL
      ========================================================= */}
      {showAllocationModal && (
        <div
          onClick={handleCloseModal}
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
            onClick={(e) => e.stopPropagation()}
            style={{
              ...globalStyles.cardElevated,
              width: "100%",
              maxWidth: "900px",
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
                borderBottom: "1px solid #e5e7eb"
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
                  Assign Project
                </h3>

                <div
                  style={{
                    marginTop: designSystem.spacing.xs,
                    color: designSystem.colors.textSecondary,
                    ...designSystem.typography.body
                  }}
                >
                  Assign one or more employees to a project.
                </div>
              </div>

              <button
                type="button"
                onClick={handleCloseModal}
                aria-label="Close"
                style={{
                  border: "none",
                  background: "transparent",
                  fontSize: "24px",
                  cursor: "pointer",
                  color: designSystem.colors.textSecondary,
                  lineHeight: 1
                }}
              >
                ×
              </button>
            </div>

            {/* =====================================================
                ALLOCATION FORM
            ===================================================== */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(250px, 1fr))",
                gap: designSystem.spacing.md
              }}
            >
              {/* Business Unit */}
<div>
                <label style={labelStyle}>
                  Business Unit
                </label>

                <select
                  value={selectedBusinessUnit}
                  onChange={(e) => {
                    if (e.target.value === "add") {
                      setShowAddBU(true);
                      setSelectedBusinessUnit("");
                    } else {
                      setSelectedBusinessUnit(e.target.value);
                      setSelectedProject("");
                    }
                  }}
                  style={selectStyle}
                >
                  <option value="">
                    Select Business Unit
                  </option>

                  {businessUnits.map((bu) => (
                    <option
                      key={bu.businessUnitId}
                      value={bu.businessUnitId}
                    >
                      {bu.name}
                    </option>
                  ))}
                  <option value="add" style={{ color: designSystem.colors.primary, fontWeight: 600 }}>
                    ➕ Add New Business Unit
                  </option>
                </select>

                {showAddBU && (
                  <div style={{ marginTop: designSystem.spacing.sm, border: `1px solid ${designSystem.colors.primary}`, borderRadius: designSystem.radius, padding: designSystem.spacing.sm }}>
                    <div style={{ display: "flex", gap: designSystem.spacing.sm, flexWrap: "wrap", alignItems: "flex-end" }}>
                      <div style={{ flex: 1, minWidth: "200px" }}>
                        <label style={{ display: "block", marginBottom: designSystem.spacing.xs, ...designSystem.typography.bodyMedium }}>Business Unit Name</label>
                        <input
                          type="text"
                          placeholder="Enter Business Unit Name"
                          value={newBUName}
                          onChange={(e) => setNewBUName(e.target.value)}
                          style={inputStyle}
                        />
                      </div>
                      <Button variant="primary" onClick={handleAddBusinessUnit}>Save BU</Button>
                      <Button variant="secondary" onClick={() => { setShowAddBU(false); setNewBUName(""); }}>Cancel</Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Project */}
              <div>
                <label style={labelStyle}>
                  Project
                </label>

                <select
                  value={selectedProject}
                  onChange={(e) =>
                    setSelectedProject(e.target.value)
                  }
                  style={selectStyle}
                >
                  <option value="">
                    Select Project
                  </option>

                  {filteredProjects.map((proj) => (
                    <option
                      key={proj.projectId}
                      value={proj.projectId}
                    >
                      {proj.projectName} - (
                      {clients.find(
                        (c) =>
                          Number(c.clientId) ===
                          Number(proj.clientId)
                      )?.clientName ||
                        proj.clientId}
                      )
                    </option>
                  ))}
                </select>

                {!selectedBusinessUnit && (
                  <div style={{ fontSize: "12px", color: designSystem.colors.textSecondary, marginTop: 4 }}>
                    Select a Business Unit first to filter projects
                  </div>
                )}
              </div>

              {/* Employees */}
              <div>
                <label style={labelStyle}>
                  Employees
                </label>

                <select
                  multiple
                  value={selectedEmployees}
                  onChange={handleEmployeeSelect}
                  style={{
                    ...selectStyle,
                    minHeight: "120px"
                  }}
                >
                  {employees.map((emp) => (
                    <option
                      key={emp.id}
                      value={emp.id}
                    >
                      {emp.name} - {emp.email}
                    </option>
                  ))}
                </select>

                <div
                  style={{
                    marginTop: `-${designSystem.spacing.xs}`,
                    marginBottom: designSystem.spacing.sm,
                    color:
                      designSystem.colors.textSecondary,
                    fontSize: "12px"
                  }}
                >
                  Hold Ctrl/Cmd to select multiple
                  employees.
                </div>
              </div>

              {/* Allocation Percentage */}
              <div>
                <label style={labelStyle}>
                  Allocation %
                </label>

                <input
                  type="number"
                  value={allocationPercent}
                  onChange={(e) =>
                    setAllocationPercent(
                      e.target.value
                    )
                  }
                  placeholder="Enter %"
                  style={inputStyle}
                  min="1"
                  max="100"
                />
              </div>

              {/* Start Date */}
              <div>
                <label style={labelStyle}>
                  Start Date
                </label>

                <input
                  type="date"
                  value={startDate}
                  onChange={(e) =>
                    setStartDate(e.target.value)
                  }
                  style={inputStyle}
                />
              </div>

              {/* End Date */}
              <div>
                <label style={labelStyle}>
                  End Date (optional)
                </label>

                <input
                  type="date"
                  value={endDate}
                  min={startDate || undefined}
                  onChange={(e) =>
                    setEndDate(e.target.value)
                  }
                  style={inputStyle}
                />
              </div>
            </div>

            {/* =====================================================
                MODAL FOOTER
            ===================================================== */}
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: designSystem.spacing.sm,
                marginTop: designSystem.spacing.lg,
                paddingTop: designSystem.spacing.md,
                borderTop: "1px solid #e5e7eb"
              }}
            >
              <Button
                variant="secondary"
                onClick={handleCloseModal}
              >
                Cancel
              </Button>

              <Button
                variant="primary"
                onClick={handleAdd}
                disabled={
                  !selectedBusinessUnit ||
                  !selectedProject ||
                  selectedEmployees.length === 0 ||
                  !allocationPercent ||
                  !startDate
                }
              >
                Assign Project
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

