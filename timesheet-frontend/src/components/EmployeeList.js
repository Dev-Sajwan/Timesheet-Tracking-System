import React, { useEffect, useState } from "react";
import { getEmployees, addEmployee, updateEmployee, assignEmployeeRole, resetEmployeePassword } from "../Services/Api";
import { jwtDecode } from "jwt-decode";
import { designSystem, globalStyles } from "../styles/designSystem";
import Modal from "./Modal";
import Button from "./Button";

export default function EmployeeList() {
  const [employees, setEmployees] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [newEmployee, setNewEmployee] = useState({ name: "", email: "", department: "", status: "" });
  const [assigningRole, setAssigningRole] = useState(null);
  const [selectedRole, setSelectedRole] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [resettingPassword, setResettingPassword] = useState(null);
  const [newPassword, setNewPassword] = useState("");

  const employeesPerPage = 8;

  useEffect(() => {
    checkAdminRole();
    loadEmployees();
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

  const handleAddEmployee = async () => {
    await addEmployee(newEmployee);
    setNewEmployee({ name: "", email: "", department: "", status: "" });
    setShowForm(false);
    loadEmployees();
  };

  const handleUpdateEmployee = async () => {
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

  const filteredEmployees = employees.filter(
    (emp) =>
      emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastEmployee = currentPage * employeesPerPage;
  const indexOfFirstEmployee = indexOfLastEmployee - employeesPerPage;
  const currentEmployees = filteredEmployees.slice(indexOfFirstEmployee, indexOfLastEmployee);
  const totalPages = Math.ceil(filteredEmployees.length / employeesPerPage);

  const formatRoles = (roles) => {
    if (!roles || roles.length === 0) return "No roles";
    return roles.join(", ");
  };

  const labelStyle = { display: "block", marginBottom: designSystem.spacing.xs, color: designSystem.colors.text, ...designSystem.typography.bodyMedium };
  const inputStyle = { ...globalStyles.input, marginBottom: designSystem.spacing.sm };

  return (
    <div style={{ padding: designSystem.spacing.lg, maxWidth: "1100px", margin: "0 auto", fontFamily: "Roboto, Arial, sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: designSystem.spacing.md }}>
        <h2 style={{ margin: 0, ...designSystem.typography.h1, color: designSystem.colors.text }}>Employees</h2>
        <Button variant="primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : "+ Add Employee"}
        </Button>
      </div>

      {showForm && (
        <div style={{ ...globalStyles.card, marginBottom: designSystem.spacing.md }}>
          <div style={{ display: "flex", gap: designSystem.spacing.sm, flexWrap: "wrap", alignItems: "flex-end" }}>
            <div style={{ flex: 1, minWidth: "140px" }}>
              <label style={labelStyle}>Name</label>
              <input placeholder="Name" value={newEmployee.name} onChange={(e) => setNewEmployee({ ...newEmployee, name: e.target.value })} style={inputStyle} />
            </div>
            <div style={{ flex: 1, minWidth: "180px" }}>
              <label style={labelStyle}>Email</label>
              <input placeholder="Email" value={newEmployee.email} onChange={(e) => setNewEmployee({ ...newEmployee, email: e.target.value })} style={inputStyle} />
            </div>
            <div style={{ flex: 1, minWidth: "120px" }}>
              <label style={labelStyle}>Department</label>
              <input placeholder="Department" value={newEmployee.department} onChange={(e) => setNewEmployee({ ...newEmployee, department: e.target.value })} style={inputStyle} />
            </div>
            <div style={{ flex: 1, minWidth: "120px" }}>
              <label style={labelStyle}>Status</label>
              <select value={newEmployee.status} onChange={(e) => setNewEmployee({ ...newEmployee, status: e.target.value })} style={inputStyle}>
                <option value="">Select</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
            <Button variant="primary" onClick={handleAddEmployee}>Save</Button>
          </div>
        </div>
      )}

      <div style={{ marginBottom: designSystem.spacing.md }}>
        <input
          type="text"
          placeholder="Search by name or email..."
          value={searchTerm}
          onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
          style={{ ...inputStyle, width: "100%", maxWidth: "400px" }}
        />
      </div>

      <div style={{ overflowX: "auto" }}>
        <table style={{ ...globalStyles.table }}>
          <thead>
            <tr style={{ ...globalStyles.tableHeader }}>
              <th style={globalStyles.tableheadercell}>Name</th>
              <th style={globalStyles.tableheadercell}>Email</th>
              <th style={globalStyles.tableheadercell}>Roles</th>
              <th style={globalStyles.tableheadercell}>Status</th>
              <th style={globalStyles.tableheadercell}>Action</th>
            </tr>
          </thead>
          <tbody>
            {currentEmployees.map((emp) => (
              <tr key={emp.id} style={{ ...globalStyles.tableRowEven }}>
                <td style={{ ...globalStyles.tableCell }}>{emp.name}</td>
                <td style={{ ...globalStyles.tableCell }}>{emp.email}</td>
                <td style={{ ...globalStyles.tableCell }}>{formatRoles(emp.roles)}</td>
                <td style={{ ...globalStyles.tableCell }}>{emp.status}</td>
                <td style={{ ...globalStyles.tableCell }}>
                  <Button variant="secondary" size="small" onClick={() => setSelectedEmployee(emp)} style={{ marginRight: designSystem.spacing.xs }}>View</Button>
                  <Button variant="secondary" size="small" onClick={() => setEditingEmployee(emp)} style={{ marginRight: designSystem.spacing.xs }}>Edit</Button>
                  {isAdmin && (
                    <>
                      <Button variant="secondary" size="small" onClick={() => setAssigningRole(emp.id)} style={{ marginRight: designSystem.spacing.xs }}>Role</Button>
                      <Button variant="secondary" size="small" onClick={() => setResettingPassword(emp.id)}>Reset Password</Button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: designSystem.spacing.md, display: "flex", gap: designSystem.spacing.sm, alignItems: "center" }}>
        <Button variant="secondary" size="small" disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)}>Prev</Button>
        <span style={{ ...designSystem.typography.body }}>Page {currentPage} of {totalPages}</span>
        <Button variant="secondary" size="small" disabled={currentPage === totalPages} onClick={() => setCurrentPage(currentPage + 1)}>Next</Button>
      </div>

      {/* View Employee Modal */}
      <Modal
        isOpen={!!selectedEmployee}
        onClose={() => setSelectedEmployee(null)}
        title="Employee Details"
        footer={<Button variant="secondary" onClick={() => setSelectedEmployee(null)}>Close</Button>}
      >
        {selectedEmployee && (
          <div>
            <p><strong>Name:</strong> {selectedEmployee.name}</p>
            <p><strong>Email:</strong> {selectedEmployee.email}</p>
            <p><strong>Roles:</strong> {formatRoles(selectedEmployee.roles)}</p>
            <p><strong>Status:</strong> {selectedEmployee.status}</p>
            <p><strong>Department:</strong> {selectedEmployee.department || "N/A"}</p>
          </div>
        )}
      </Modal>

      {/* Edit Employee Modal */}
      <Modal
        isOpen={!!editingEmployee}
        onClose={() => setEditingEmployee(null)}
        title="Edit Employee"
        footer={
          <>
            <Button variant="secondary" onClick={() => setEditingEmployee(null)}>Cancel</Button>
            <Button variant="primary" onClick={handleUpdateEmployee}>Update</Button>
          </>
        }
      >
        {editingEmployee && (
          <div>
            <label style={labelStyle}>Name</label>
            <input placeholder="Name" value={editingEmployee.name} onChange={(e) => setEditingEmployee({ ...editingEmployee, name: e.target.value })} style={inputStyle} />
            <label style={labelStyle}>Email</label>
            <input placeholder="Email" value={editingEmployee.email} onChange={(e) => setEditingEmployee({ ...editingEmployee, email: e.target.value })} style={inputStyle} />
            <label style={labelStyle}>Department</label>
            <input placeholder="Department" value={editingEmployee.department || ""} onChange={(e) => setEditingEmployee({ ...editingEmployee, department: e.target.value })} style={inputStyle} />
            <label style={labelStyle}>Status</label>
            <select value={editingEmployee.status || ""} onChange={(e) => setEditingEmployee({ ...editingEmployee, status: e.target.value })} style={inputStyle}>
              <option value="">Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
            <p style={{ ...designSystem.typography.caption, color: designSystem.colors.textSecondary }}>Roles are managed via "Role" button (Admin only)</p>
          </div>
        )}
      </Modal>

      {/* Assign Role Modal */}
      <Modal
        isOpen={!!assigningRole}
        onClose={() => { setAssigningRole(null); setSelectedRole(""); }}
        title="Assign Role"
        footer={
          <>
            <Button variant="secondary" onClick={() => { setAssigningRole(null); setSelectedRole(""); }}>Cancel</Button>
            <Button variant="primary" onClick={() => handleAssignRole(assigningRole, selectedRole)}>Assign</Button>
          </>
        }
      >
        <label style={labelStyle}>Select Role</label>
        <select value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)} style={inputStyle}>
          <option value="">Select Role</option>
          <option value="Admin">Admin</option>
          <option value="Manager">Manager</option>
          <option value="Employee">Employee</option>
        </select>
      </Modal>

      {/* Reset Password Modal */}
      <Modal
        isOpen={!!resettingPassword}
        onClose={() => { setResettingPassword(null); setNewPassword(""); }}
        title="Reset Password"
        footer={
          <>
            <Button variant="secondary" onClick={() => { setResettingPassword(null); setNewPassword(""); }}>Cancel</Button>
            <Button variant="primary" onClick={() => handleResetPassword(resettingPassword, newPassword)}>Reset</Button>
          </>
        }
      >
        <label style={labelStyle}>New Password</label>
        <input type="password" placeholder="New Password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} style={inputStyle} />
      </Modal>
    </div>
  );
}