// src/components/AllocationList.js
import React, { useEffect, useState } from "react";
import { getAllocations, addAllocation, deleteAllocation, getEmployees, getProjects, getClients } from "../Services/Api";

export default function AllocationList() {
  const [allocations, setAllocations] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [selectedProject, setSelectedProject] = useState("");
  const [allocationPercent, setAllocationPercent] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    loadAllocations();
    loadEmployees();
    loadProjects();
  }, []);

  const [clients, setClients] = useState([]);

useEffect(() => {
  loadAllocations();
  loadEmployees();
  loadProjects();
  loadClients();   // <-- new
}, []);

const loadClients = async () => {
  const res = await getClients();
  setClients(res.data);
};


  const loadAllocations = async () => {
    const res = await getAllocations();
    setAllocations(res.data);
  };

  const loadEmployees = async () => {
    const res = await getEmployees();
    setEmployees(res.data);
  };

  const loadProjects = async () => {
    const res = await getProjects();
    console.log("Projects API response:", res.data); // <-- check structure
    setProjects(res.data);
  };

  const handleAdd = async () => {
  if (!selectedProject || selectedEmployees.length === 0 || !allocationPercent) return;


  
  for (const empId of selectedEmployees) {
    await addAllocation({
      employeeId: parseInt(empId),                // convert to number
      projectId: parseInt(selectedProject),       // convert to number
      allocationPercent: parseInt(allocationPercent),
      startDate: new Date(startDate).toISOString(), // ISO format
      endDate: new Date(endDate).toISOString(),
    });

    console.log("Posting allocation:", {
  employeeId: Number(empId),
  projectId: Number(selectedProject),
  allocationPercent: Number(allocationPercent),
  startDate: new Date(startDate).toISOString(),
  endDate: new Date(endDate).toISOString(),
});

  }

  
  setSelectedEmployees([]);
  setSelectedProject("");
  setAllocationPercent("");
  setStartDate("");
  setEndDate("");
  loadAllocations();
};


  const handleDelete = async (id) => {
    await deleteAllocation(id);
    loadAllocations();
  };

  const handleEmployeeSelect = (e) => {
  const options = e.target.options;
  const selected = [];
  for (let i = 0; i < options.length; i++) {
    if (options[i].selected) {
      selected.push(Number(options[i].value)); // force number
    }
  }
  setSelectedEmployees(selected);
};


  return (
    <div style={{ background: "#fff", padding: "20px", borderRadius: "8px", alignItems: "center", boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)" }}>
      <h2>Allocations</h2>

      {/* Project Dropdown */}
      <table style={{ width: "80%", borderCollapse: "collapse", marginBottom: "20px" }}>
        <tbody>
          <tr>
            <td><label>Project</label></td>
            <td>
              <select
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
              >
                <option value="">Select Project</option>
        {projects.map((proj) => (
          <option key={proj.projectId} value={proj.projectId}>
            {proj.projectName} - ({clients.find(c => c.clientId === proj.clientId)?.clientName || proj.clientId})
          </option>

        ))}
      </select>
      </td></tr>

      {/* Employee Multi-Select */}
      <tr><td><label>Employees</label></td>
      <td>
        <select multiple value={selectedEmployees} onChange={handleEmployeeSelect}>
          {employees.map((emp) => (
            <option key={emp.employeeId} value={emp.employeeId}>
              {emp.name} - {emp.email}
            </option>

        ))}
      </select>
</td></tr>
      {/* Allocation Percent */}
      <tr><td><label>Allocation Percent</label></td>
      <td><input
        type="number"
        value={allocationPercent}
        onChange={(e) => setAllocationPercent(e.target.value)}
        placeholder="Enter %"
      /></td></tr>

      {/* Start Date */}
      <tr>
      <td><label>Start Date</label></td>
      <td>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
      </td></tr>

      {/* End Date */}
     <tr> <td><label>End Date</label></td>
      <td><input
        type="date"
        value={endDate}
        onChange={(e) => setEndDate(e.target.value)}
      /></td></tr>
    <tr align="center"><td colSpan="2">
      <button onClick={handleAdd}>Assign Project</button>
    </td></tr>
    </tbody>
      </table>
      
      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "20px" }}>
  <thead>
    <tr style={{ background: "#f4f4f4" }}>
      <th style={{ border: "1px solid #ddd", padding: "8px" }}>Employee</th>
      <th style={{ border: "1px solid #ddd", padding: "8px" }}>Project</th>
      <th style={{ border: "1px solid #ddd", padding: "8px" }}>Client</th>
      <th style={{ border: "1px solid #ddd", padding: "8px" }}>Allocation %</th>
      <th style={{ border: "1px solid #ddd", padding: "8px" }}>Start Date</th>
      <th style={{ border: "1px solid #ddd", padding: "8px" }}>End Date</th>
      <th style={{ border: "1px solid #ddd", padding: "8px" }}>Actions</th>
    </tr>
  </thead>
  <tbody>
    {allocations.map((alloc) => {
      const emp = employees.find((e) => e.employeeId === alloc.employeeId);
      const proj = projects.find((p) => p.projectId === alloc.projectId);
      const clientName = proj ? (clients.find(c => c.clientId === proj.clientId)?.clientName) : null;

      return (
        <tr key={alloc.id}>
          <td style={{ border: "1px solid #ddd", padding: "8px" }}>
            {emp ? `${emp.name} (${emp.email})` : `Employee ${alloc.employeeId}`}
          </td>
          <td style={{ border: "1px solid #ddd", padding: "8px" }}>
            {proj ? proj.projectName : `Project ${alloc.projectId}`}
          </td>
          <td style={{ border: "1px solid #ddd", padding: "8px" }}>
            {clientName || proj?.clientId}
          </td>
          <td style={{ border: "1px solid #ddd", padding: "8px" }}>
            {alloc.allocationPercent}%
          </td>
          <td style={{ border: "1px solid #ddd", padding: "8px" }}>
            {new Date(alloc.startDate).toLocaleDateString()}
          </td>
          <td style={{ border: "1px solid #ddd", padding: "8px" }}>
            {new Date(alloc.endDate).toLocaleDateString()}
          </td>
          <td style={{ border: "1px solid #ddd", padding: "8px" }}>
            <button onClick={() => handleDelete(alloc.id)}>Remove</button>
          </td>
        </tr>
      );
    })}
  </tbody>
</table>

    </div>
  );
}
