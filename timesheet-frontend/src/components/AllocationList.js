// src/components/AllocationList.js
import React, { useEffect, useState } from "react";
import {
  getAllocations,
  addAllocation,
  deleteAllocation,
  getEmployees,
  getProjects,
  getClients
} from "../Services/Api";
import { designSystem, globalStyles } from "../styles/designSystem";
import Button from "./Button";

export default function AllocationList() {
  const [allocations, setAllocations] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [projects, setProjects] = useState([]);
  const [clients, setClients] = useState([]);

  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [selectedProject, setSelectedProject] = useState("");
  const [allocationPercent, setAllocationPercent] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    loadAllocations();
    loadEmployees();
    loadProjects();
    loadClients();
  }, []);

  const loadClients = async () => {
    const res = await getClients();
    setClients(res.data);
  };

  const loadAllocations = async () => {
    const res = await getAllocations();
    console.log("Allocations API response:", res.data);
    setAllocations(res.data);
  };

  const loadEmployees = async () => {
    const res = await getEmployees();
    console.log("Employees API response:", res.data);
    setEmployees(res.data);
  };

  const loadProjects = async () => {
    const res = await getProjects();
    console.log("Projects API response:", res.data);
    setProjects(res.data);
  };

  const handleAdd = async () => {
    if (
      !selectedProject ||
      selectedEmployees.length === 0 ||
      !allocationPercent ||
      !startDate
    ) {
      return;
    }

    for (const empId of selectedEmployees) {
      const allocationData = {
        employeeId: empId,
        projectId: Number(selectedProject),
        allocationPercent: Number(allocationPercent),
        startDate: new Date(startDate).toISOString(),
        endDate: endDate ? new Date(endDate).toISOString() : null
      };

      console.log("Posting allocation:", allocationData);
      await addAllocation(allocationData);
    }

    setSelectedEmployees([]);
    setSelectedProject("");
    setAllocationPercent("");
    setStartDate("");
    setEndDate("");

    await loadAllocations();
  };

  const handleDelete = async (id) => {
    await deleteAllocation(id);
    await loadAllocations();
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

  const labelStyle = { display: "block", marginBottom: designSystem.spacing.xs, color: designSystem.colors.text, ...designSystem.typography.bodyStrong };
  const inputStyle = { ...globalStyles.input, marginBottom: designSystem.spacing.sm };
  const selectStyle = { ...globalStyles.select, marginBottom: designSystem.spacing.sm };

  return (
    <div style={{ padding: designSystem.spacing.lg, maxWidth: "1100px", margin: "0 auto", fontFamily: "Segoe UI Variable, Segoe UI, sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: designSystem.spacing.md }}>
        <h2 style={{ margin: 0, ...designSystem.typography.h1, color: designSystem.colors.text }}>Allocations</h2>
      </div>

      <div style={{ ...globalStyles.cardElevated, marginBottom: designSystem.spacing.lg }}>
        <h3 style={{ ...designSystem.typography.h3, margin: `0 0 ${designSystem.spacing.md} 0`, color: designSystem.colors.text }}>Assign Allocation</h3>
        <div style={{ display: "flex", gap: designSystem.spacing.sm, flexWrap: "wrap", alignItems: "flex-end" }}>
          <div style={{ flex: 1, minWidth: "200px" }}>
            <label style={labelStyle}>Project</label>
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              style={selectStyle}
            >
              <option value="">Select Project</option>
              {projects.map((proj) => (
                <option key={proj.projectId} value={proj.projectId}>
                  {proj.projectName} - ({clients.find((c) => c.clientId === proj.clientId)?.clientName || proj.clientId})
                </option>
              ))}
            </select>
          </div>

          <div style={{ flex: 1, minWidth: "250px" }}>
            <label style={labelStyle}>Employees (hold Ctrl/Cmd to multi-select)</label>
            <select
              multiple
              value={selectedEmployees}
              onChange={handleEmployeeSelect}
              style={{ ...selectStyle, minHeight: '80px'}}
            >
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.name} - {emp.email}
                </option>
              ))}
            </select>
          </div>

          <div style={{ flex: 1, minWidth: "120px" }}>
            <label style={labelStyle}>Allocation %</label>
            <input
              type="number"
              value={allocationPercent}
              onChange={(e) => setAllocationPercent(e.target.value)}
              placeholder="Enter %"
              style={inputStyle}
              min="0"
              max="100"
            />
          </div>

          <div style={{ flex: 1, minWidth: "140px" }}>
            <label style={labelStyle}>Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              style={inputStyle}
            />
          </div>

          <div style={{ flex: 1, minWidth: "140px" }}>
            <label style={labelStyle}>End Date (optional)</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              style={inputStyle}
            />
          </div>

          <Button variant="primary" onClick={handleAdd} style={{ marginTop: 'auto' }}>Assign Project</Button>
        </div>
      </div>

      <div style={{ ...globalStyles.cardElevated }}>
        <h3 style={{ ...designSystem.typography.h3, margin: `0 0 ${designSystem.spacing.md} 0`, color: designSystem.colors.text }}>Current Allocations</h3>
        <div style={{ overflowX: "auto" }}>
          <table style={{ ...globalStyles.table }}>
            <thead>
              <tr style={{ ...globalStyles.tableHeader }}>
                <th style={globalStyles.tableheadercell}>Employee</th>
                <th style={globalStyles.tableheadercell}>Project</th>
                <th style={globalStyles.tableheadercell}>Client</th>
                <th style={globalStyles.tableheadercell}>Allocation %</th>
                <th style={globalStyles.tableheadercell}>Start Date</th>
                <th style={globalStyles.tableheadercell}>End Date</th>
                <th style={globalStyles.tableheadercell}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {allocations.map((alloc) => {
                const emp = employees.find((e) => String(e.id) === String(alloc.employeeId));
                const proj = projects.find((p) => Number(p.projectId) === Number(alloc.projectId));
                const clientName = proj
                  ? clients.find((c) => Number(c.clientId) === Number(proj.clientId))?.clientName
                  : null;

                return (
                  <tr key={alloc.allocationId} style={{ ...globalStyles.tableRow }}>
                    <td style={{ ...globalStyles.tableCell }}>
                      {emp ? `${emp.name} (${emp.email})` : `Employee ${alloc.employeeId}`}
                    </td>
                    <td style={{ ...globalStyles.tableCell }}>
                      {proj ? proj.projectName : `Project ${alloc.projectId}`}
                    </td>
                    <td style={{ ...globalStyles.tableCell }}>
                      {clientName || proj?.clientId || "—"}
                    </td>
                    <td style={{ ...globalStyles.tableCell }}>{alloc.allocationPercent}%</td>
                    <td style={{ ...globalStyles.tableCell }}>
                      {alloc.startDate ? new Date(alloc.startDate).toLocaleDateString() : ""}
                    </td>
                    <td style={{ ...globalStyles.tableCell }}>
                      {alloc.endDate ? new Date(alloc.endDate).toLocaleDateString() : ""}
                    </td>
                    <td style={{ ...globalStyles.tableCell }}>
                      <Button variant="danger" size="small" onClick={() => handleDelete(alloc.allocationId)}>Remove</Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {allocations.length === 0 && (
          <p style={{ textAlign: 'center', padding: designSystem.spacing.xl, color: designSystem.colors.textSecondary, ...designSystem.typography.body }}>
            No allocations configured yet.
          </p>
        )}
      </div>
    </div>
  );
}