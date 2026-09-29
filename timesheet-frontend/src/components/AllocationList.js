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

export default function AllocationList() {
  const [allocations, setAllocations] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [projects, setProjects] = useState([]);
  const [clients, setClients] = useState([]);

  // Employee IDs are strings because Employee inherits IdentityUser
  const [selectedEmployees, setSelectedEmployees] = useState([]);

  // Project ID remains numeric
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
        // Identity Employee.Id is a string
        employeeId: empId,

        // ProjectId remains an integer
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
        // DO NOT convert Identity ID to Number
        selected.push(options[i].value);
      }
    }

    setSelectedEmployees(selected);
  };

  return (
    <div
      style={{
        background: "#fff",
        padding: "20px",
        borderRadius: "8px",
        alignItems: "center",
        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)"
      }}
    >
      <h2>Allocations</h2>

      {/* Allocation Form */}
      <table
        style={{
          width: "80%",
          borderCollapse: "collapse",
          marginBottom: "20px"
        }}
      >
        <tbody>

          {/* Project Dropdown */}
          <tr>
            <td>
              <label>Project</label>
            </td>

            <td>
              <select
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
              >
                <option value="">Select Project</option>

                {projects.map((proj) => (
                  <option
                    key={proj.projectId}
                    value={proj.projectId}
                  >
                    {proj.projectName} - (
                    {
                      clients.find(
                        (c) => c.clientId === proj.clientId
                      )?.clientName || proj.clientId
                    }
                    )
                  </option>
                ))}
              </select>
            </td>
          </tr>

          {/* Employee Multi-Select */}
          <tr>
            <td>
              <label>Employees</label>
            </td>

            <td>
              <select
                multiple
                value={selectedEmployees}
                onChange={handleEmployeeSelect}
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
            </td>
          </tr>

          {/* Allocation Percent */}
          <tr>
            <td>
              <label>Allocation Percent</label>
            </td>

            <td>
              <input
                type="number"
                value={allocationPercent}
                onChange={(e) =>
                  setAllocationPercent(e.target.value)
                }
                placeholder="Enter %"
              />
            </td>
          </tr>

          {/* Start Date */}
          <tr>
            <td>
              <label>Start Date</label>
            </td>

            <td>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </td>
          </tr>

          {/* End Date */}
          <tr>
            <td>
              <label>End Date</label>
            </td>

            <td>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </td>
          </tr>

          {/* Assign */}
          <tr align="center">
            <td colSpan="2">
              <button onClick={handleAdd}>
                Assign Project
              </button>
            </td>
          </tr>

        </tbody>
      </table>

      {/* Allocation List */}
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          marginTop: "20px"
        }}
      >
        <thead>
          <tr style={{ background: "#f4f4f4" }}>
            <th style={{ border: "1px solid #ddd", padding: "8px" }}>
              Employee
            </th>

            <th style={{ border: "1px solid #ddd", padding: "8px" }}>
              Project
            </th>

            <th style={{ border: "1px solid #ddd", padding: "8px" }}>
              Client
            </th>

            <th style={{ border: "1px solid #ddd", padding: "8px" }}>
              Allocation %
            </th>

            <th style={{ border: "1px solid #ddd", padding: "8px" }}>
              Start Date
            </th>

            <th style={{ border: "1px solid #ddd", padding: "8px" }}>
              End Date
            </th>

            <th style={{ border: "1px solid #ddd", padding: "8px" }}>
              Actions
            </th>
          </tr>
        </thead>

        <tbody>
          {allocations.map((alloc) => {

            // Employee.Id is a string
            const emp = employees.find(
              (e) => String(e.id) === String(alloc.employeeId)
            );

            // ProjectId is an integer
            const proj = projects.find(
              (p) => Number(p.projectId) === Number(alloc.projectId)
            );

            const clientName = proj
              ? clients.find(
                  (c) =>
                    Number(c.clientId) === Number(proj.clientId)
                )?.clientName
              : null;

            return (
              <tr key={alloc.allocationId}>

                <td
                  style={{
                    border: "1px solid #ddd",
                    padding: "8px"
                  }}
                >
                  {emp
                    ? `${emp.name} (${emp.email})`
                    : `Employee ${alloc.employeeId}`}
                </td>

                <td
                  style={{
                    border: "1px solid #ddd",
                    padding: "8px"
                  }}
                >
                  {proj
                    ? proj.projectName
                    : `Project ${alloc.projectId}`}
                </td>

                <td
                  style={{
                    border: "1px solid #ddd",
                    padding: "8px"
                  }}
                >
                  {clientName || proj?.clientId}
                </td>

                <td
                  style={{
                    border: "1px solid #ddd",
                    padding: "8px"
                  }}
                >
                  {alloc.allocationPercent}%
                </td>

                <td
                  style={{
                    border: "1px solid #ddd",
                    padding: "8px"
                  }}
                >
                  {alloc.startDate
                    ? new Date(
                        alloc.startDate
                      ).toLocaleDateString()
                    : ""}
                </td>

                <td
                  style={{
                    border: "1px solid #ddd",
                    padding: "8px"
                  }}
                >
                  {alloc.endDate
                    ? new Date(
                        alloc.endDate
                      ).toLocaleDateString()
                    : ""}
                </td>

                <td
                  style={{
                    border: "1px solid #ddd",
                    padding: "8px"
                  }}
                >
                  <button
                    onClick={() =>
                      handleDelete(alloc.allocationId)
                    }
                  >
                    Remove
                  </button>
                </td>

              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}