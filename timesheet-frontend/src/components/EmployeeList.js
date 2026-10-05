import React, { useEffect, useState } from "react";
import { getEmployees, addEmployee, updateEmployee, getProjects, getClients, assignEmployeeRole, resetEmployeePassword } from "../Services/Api";
import { jwtDecode } from "jwt-decode";

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
    department: "",
    status: ""
  });
  const [assigningRole, setAssigningRole] = useState(null);
  const [selectedRole, setSelectedRole] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [resettingPassword, setResettingPassword] = useState(null);
  const [newPassword, setNewPassword] = useState("");

  const employeesPerPage = 8;

  useEffect(() => {
    checkAdminRole();
    loadEmployees();
    loadProjects();
    loadClients();
  }, []);

  const checkAdminRole = () => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        const userRoles = decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] || [];
        const rolesArray = Array.isArray(userRoles) ? userRoles : [userRoles];
        setIsAdmin(rolesArray.includes("Admin"));
      } catch (e) {
        setIsAdmin(false);
      }
    }
  };

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
    setNewEmployee({ name: "", email: "", department: "", status: "" });
    setShowForm(false);
    loadEmployees();
  };

  const handleUpdateEmployee = async () => {
    // Only send allowed fields for profile update (not Roles)
    const updateData = {
      id: editingEmployee.id,
      name: editingEmployee.name,
      email: editingEmployee.email,
      department: editingEmployee.department || "",
      status: editingEmployee.status
    };
    await updateEmployee(editingEmployee.id, updateData);
    setEditingEmployee(null);
    loadEmployees();
  };

  const handleAssignRole = async (employeeId, role) => {
    try {
      await assignEmployeeRole(employeeId, role);
      setAssigningRole(null);
      setSelectedRole("");
      loadEmployees();
    } catch (error) {
      alert("Failed to assign role: " + (error.response?.data?.message || error.message));
    }
  };

  const handleResetPassword = async (employeeId, password) => {
    try {
      await resetEmployeePassword(employeeId, password);
      setResettingPassword(null);
      setNewPassword("");
      alert("Password reset successfully!");
    } catch (error) {
      alert("Failed to reset password: " + (error.response?.data?.message || error.message));
    }
  };

  const openResetPassword = (emp) => {
    setResettingPassword(emp.id);
    setNewPassword("");
  };

  const closeResetPassword = () => {
    setResettingPassword(null);
    setNewPassword("");
  };

  const openAssignRole = (emp) => {
    setAssigningRole(emp.id);
    setSelectedRole(emp.Roles?.[0] || "");
  };

  const closeAssignRole = () => {
    setAssigningRole(null);
    setSelectedRole("");
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

  const formatRoles = (roles) => {
    if (!roles || roles.length === 0) return "No roles";
    return roles.join(", ");
  };

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
            style={{ marginRight: "5px" }}
          />
          <input
            placeholder="Email"
            value={newEmployee.email}
            onChange={(e) => setNewEmployee({ ...newEmployee, email: e.target.value })}
            style={{ marginRight: "5px" }}
          />
          <input
            placeholder="Department"
            value={newEmployee.department}
            onChange={(e) => setNewEmployee({ ...newEmployee, department: e.target.value })}
            style={{ marginRight: "5px" }}
          />
          <select
            value={newEmployee.status}
            onChange={(e) => setNewEmployee({ ...newEmployee, status: e.target.value })}
            style={{ marginRight: "5px" }}
          >
            <option value="">Select Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
          <button onClick={handleAddEmployee}>Save Employee</button>
        </div>
      )}

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
            <th>Roles</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {currentEmployees.map((emp) => (
            <tr key={emp.id}>
              <td>{emp.name}</td>
              <td>{emp.email}</td>
              <td>{formatRoles(emp.roles)}</td>
              <td>{emp.status}</td>
              <td>
                <button onClick={() => setSelectedEmployee(emp)}>View</button>&nbsp;
                <button onClick={() => setEditingEmployee(emp)}>Edit</button>
                {isAdmin && (
                  <>
                    &nbsp;
                    {assigningRole === emp.id ? (
                      <>
                        <select
                          value={selectedRole}
                          onChange={(e) => setSelectedRole(e.target.value)}
                          style={{ marginRight: "5px" }}
                        >
                          <option value="">Select Role</option>
                          <option value="Admin">Admin</option>
                          <option value="Manager">Manager</option>
                          <option value="Employee">Employee</option>
                        </select>
                        <button onClick={() => handleAssignRole(emp.id, selectedRole)} style={{ marginRight: "5px" }}>Assign</button>
                        <button onClick={closeAssignRole}>Cancel</button>
                      </>
                    ) : (
                      <button onClick={() => openAssignRole(emp)}>Assign Role</button>
                    )}
                    &nbsp;
                    {resettingPassword === emp.id ? (
                      <>
                        <input
                          type="password"
                          placeholder="New Password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          style={{ marginRight: "5px" }}
                        />
                        <button onClick={() => handleResetPassword(emp.id, newPassword)}>Reset</button>
                        <button onClick={closeResetPassword}>Cancel</button>
                      </>
                    ) : (
                      <button onClick={() => openResetPassword(emp)}>Reset Password</button>
                    )}
                  </>
                )}
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
          <p><strong>Roles:</strong> {formatRoles(selectedEmployee.roles)}</p>
          <p><strong>Status:</strong> {selectedEmployee.status}</p>
          <p><strong>Department:</strong> {selectedEmployee.department || "N/A"}</p>
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
            style={{ marginRight: "5px" }}
          />
          <input
            placeholder="Email"
            value={editingEmployee.email}
            onChange={(e) => setEditingEmployee({ ...editingEmployee, email: e.target.value })}
            style={{ marginRight: "5px" }}
          />
          <input
            placeholder="Department"
            value={editingEmployee.department || ""}
            onChange={(e) => setEditingEmployee({ ...editingEmployee, department: e.target.value })}
            style={{ marginRight: "5px" }}
          />
          <select
            value={editingEmployee.status || ""}
            onChange={(e) => setEditingEmployee({ ...editingEmployee, status: e.target.value })}
            style={{ marginRight: "5px" }}
          >
            <option value="">Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
          <p><em>Roles are managed separately via "Assign Role" button (Admin only)</em></p>
          <button onClick={handleUpdateEmployee} style={{ marginRight: "5px" }}>Update Employee</button>
          <button onClick={() => setEditingEmployee(null)}>Cancel</button>
        </div>
      )}
    </div>
  );
}