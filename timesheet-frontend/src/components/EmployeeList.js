import React, { useEffect, useState } from "react";
import { getEmployees, addEmployee, updateEmployee, getProjects, getClients } from "../Services/Api";

export default function EmployeeList() {
  const [employees, setEmployees] = useState([]);
  const [projects, setProjects] = useState([]);
  const [clients, setClients] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [newEmployee, setNewEmployee] = useState({
    name: "",
    email: "",
    Role: "",
    Status: ""
  });

  const employeesPerPage = 8;

  useEffect(() => {
    loadEmployees();
    loadProjects();
    loadClients();
  }, []);

  const loadEmployees = async () => {
    const res = await getEmployees();
    setEmployees(res.data);
  };

  const loadProjects = async () => {
    const res = await getProjects();
    setProjects(res.data);
  };

  const loadClients = async () => {
    const res = await getClients();
    setClients(res.data);
  };

  const handleAddEmployee = async () => {
    await addEmployee(newEmployee);
    setNewEmployee({ name: "", email: "", Role: "", Status: "" });
    setShowForm(false);
    loadEmployees();
  };

  const handleUpdateEmployee = async () => {
    await updateEmployee(editingEmployee.employeeId, editingEmployee);
    setEditingEmployee(null);
    loadEmployees();
  };

  // Filter employees by search term
  const filteredEmployees = employees.filter(
    (emp) =>
      emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination logic
  const indexOfLastEmployee = currentPage * employeesPerPage;
  const indexOfFirstEmployee = indexOfLastEmployee - employeesPerPage;
  const currentEmployees = filteredEmployees.slice(indexOfFirstEmployee, indexOfLastEmployee);
  const totalPages = Math.ceil(filteredEmployees.length / employeesPerPage);

  return (
    <div style={{ padding: "20px" }}>
      <h2>Employees</h2>

      {/* Add Employee Button */}
      <button onClick={() => setShowForm(!showForm)} padding="10px" style={{ marginRight: "15px" }}>
        {showForm ? "Cancel" : "➕ Add Employee"}
      </button>

      {/* Add Employee Form */}
      {showForm && (
        <div style={{ marginTop: "15px", border: "1px solid #ccc", padding: "10px" }}>
          <input
            placeholder="Name"
            value={newEmployee.name}
            onChange={(e) => setNewEmployee({ ...newEmployee, name: e.target.value })}
          />
          <input
            placeholder="Email"
            value={newEmployee.email}
            onChange={(e) => setNewEmployee({ ...newEmployee, email: e.target.value })}
          />
          <select
            value={newEmployee.Role}
            onChange={(e) => setNewEmployee({ ...newEmployee, Role: e.target.value })}
          >
           <option value="">Select Role</option>
            <option value="Manager">Manager</option>
            <option value="Developer">Developer</option>
            <option value="Tester">User</option>
          </select>
          <select
            value={newEmployee.Status}
            onChange={(e) => setNewEmployee({ ...newEmployee, Status: e.target.value })}
          >
            <option value="">Select Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
          <button onClick={handleAddEmployee}>Save Employee</button>
        </div>
      )}

      {/* Search Bar */}
      

      {/* Search Bar */}
      <input
        type="text"
        placeholder="Search by name or email..."
        value={searchTerm}
        onChange={(e) => {
          setSearchTerm(e.target.value);
          setCurrentPage(1);
        }}
        style={{ width: "300px", padding: "8px", margin: "15px 0" }}
      />

      {/* Employee Table */}
      <table border="1" width="100%" cellPadding="8">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {currentEmployees.map((emp) => (
            <tr key={emp.employeeId}>
              <td>{emp.name}</td>
              <td>{emp.email}</td>
              <td>
                <button onClick={() => setSelectedEmployee(emp)}>View</button>&nbsp;
                <button onClick={() => setEditingEmployee(emp)}>Edit</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      <div style={{ marginTop: "10px" }}>
        <button disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)}>
          Prev
        </button>
        <span> Page {currentPage} of {totalPages} </span>
        <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(currentPage + 1)}>
          Next
        </button>
      </div>

      {/* Employee Details */}
      {selectedEmployee && (
        <div style={{ marginTop: "20px", border: "1px solid #ccc", padding: "10px" }}>
          <h3>Employee Details</h3>
          <p><strong>Name:</strong> {selectedEmployee.name}</p>
          <p><strong>Email:</strong> {selectedEmployee.email}</p>
          <p><strong>Role:</strong> {selectedEmployee.role}</p>
          <p><strong>Status:</strong> {selectedEmployee.status}</p>
          {/* <p><strong>Client:</strong> {clients.find(c => c.clientId === selectedEmployee.clientId)?.clientName}</p> */}
          <button onClick={() => setSelectedEmployee(null)}>Close</button>
        </div>
      )}

      {/* Edit Employee Form */}
      {editingEmployee && (
        <div style={{ marginTop: "20px", border: "1px solid #ccc", padding: "10px" }}>
          <h3>Edit Employee</h3>
          <input
            placeholder="Name"
            value={editingEmployee.name}
            onChange={(e) => setEditingEmployee({ ...editingEmployee, name: e.target.value })}
          />
          <input
            placeholder="Email"
            value={editingEmployee.email}
            onChange={(e) => setEditingEmployee({ ...editingEmployee, email: e.target.value })}
          />
          <select
            value={editingEmployee.role || ""}
            onChange={(e) => setEditingEmployee({ ...editingEmployee, role: e.target.value })}
          >
            <option value="">Role</option>
            <option value="Manager">Manager</option>
            <option value="Developer">Developer</option>
            <option value="Tester">User</option>
          </select>
          <select
            value={editingEmployee.status || ""}
            onChange={(e) => setEditingEmployee({ ...editingEmployee, status: e.target.value })}
          >
            <option value="">Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
          <button onClick={handleUpdateEmployee}>Update Employee</button>
          <button onClick={() => setEditingEmployee(null)}>Cancel</button>
        </div>
      )}
    </div>
  );
}
