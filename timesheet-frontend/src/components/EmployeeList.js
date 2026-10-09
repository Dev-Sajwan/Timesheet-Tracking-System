import React, { useEffect, useState, useRef } from "react";
import { getEmployees, addEmployee, updateEmployee, assignEmployeeRole, resetEmployeePassword, getRoles} from "../Services/Api";
import { jwtDecode } from "jwt-decode";
import { designSystem, globalStyles } from "../styles/designSystem";
import Modal from "./Modal";
import Button from "./Button";
import * as XLSX from "xlsx";
import axios from "axios";

export const uploadBulkEmployees = (data) => {
    const token = localStorage.getItem("token");
    return axios.post("http://localhost:5162/api/employees/bulk", data, { headers: { Authorization: `Bearer ${token}` } });
};

export default function EmployeeList() {
  const [employees, setEmployees] = useState([]);
  const [roles, setRoles] = useState([]);
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
  
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [bulkData, setBulkData] = useState([]);
  const [bulkHeaders, setBulkHeaders] = useState([]);
  const [columnMapping, setColumnMapping] = useState({ Name: "", Email: "", Department: "" });
  const [bulkErrors, setBulkErrors] = useState([]);
  const [showErrorLog, setShowErrorLog] = useState(false);
  const fileInputRef = useRef(null);

  const employeesPerPage = 8;

  useEffect(() => {
    checkAdminRole();
    loadEmployees();
    loadRoles();
  }, []);

  const checkAdminRole = () => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        // Check for System Admin profile (takes precedence over role)
        const isSystemAdmin = decoded["isSystemAdmin"] === "true" || decoded["isSystemAdmin"] === true;
        setIsAdmin(isSystemAdmin);
      } catch (e) {
        setIsAdmin(false);
      }
    }
  };

  const loadEmployees = async () => {
    const res = await getEmployees();
    setEmployees(res.data);
  };

  const loadRoles = async () => {
    const res = await getRoles();
    setRoles(res.data);
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

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target.result;
      const wb = XLSX.read(bstr, { type: "binary" });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws, { header: 1 });
      if (data.length > 0) {
          const headers = data[0];
          setBulkHeaders(headers);
          
          let initialMapping = { Name: "", Email: "", Department: "" };
          headers.forEach(h => {
              if(h.toLowerCase().includes("name")) initialMapping.Name = h;
              if(h.toLowerCase().includes("email")) initialMapping.Email = h;
              if(h.toLowerCase().includes("dept") || h.toLowerCase().includes("department")) initialMapping.Department = h;
          });
          setColumnMapping(initialMapping);

          const rows = data.slice(1).map(row => {
              let obj = {};
              headers.forEach((h, i) => obj[h] = row[i]);
              return obj;
          });
          setBulkData(rows);
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleBulkSubmit = async () => {
    if (!columnMapping.Name || !columnMapping.Email) {
        alert("Name and Email mappings are required.");
        return;
    }
    
    const validEmployees = [];
    const errorLog = [];
    
    bulkData.forEach((row, index) => {
        const name = row[columnMapping.Name];
        const email = row[columnMapping.Email];
        const department = row[columnMapping.Department] || "";
        
        if (!name || !email) {
            errorLog.push({
                row: index + 2, // +2 because data starts at row 2 (after header)
                name: name || "MISSING",
                email: email || "MISSING",
                department: department,
                reason: "Missing required field: " + (!name ? "Name" : "") + (!name && !email ? " and " : "") + (!email ? "Email" : "")
            });
        } else {
            validEmployees.push({
                name: name,
                email: email,
                department: department,
                status: "Active"
            });
        }
    });
    
    setBulkErrors(errorLog);
    
    if (validEmployees.length === 0) {
        alert("No valid employees to upload. All rows have missing Name or Email.");
        setShowErrorLog(true);
        return;
    }
    
    if (errorLog.length > 0) {
        const confirmUpload = window.confirm(
            `${errorLog.length} row(s) have missing Name or Email and will be skipped.\n\n` +
            `Do you want to upload the ${validEmployees.length} valid employee(s)?`
        );
        if (!confirmUpload) {
            return;
        }
    }

    try {
        await uploadBulkEmployees(validEmployees);
        alert(`Upload successful! ${validEmployees.length} employee(s) uploaded.`);
        setShowBulkUpload(false);
        setBulkData([]);
        setBulkHeaders([]);
        setBulkErrors([]);
        loadEmployees();
    } catch(e) {
        console.error(e);
        alert("Failed bulk upload: " + (e.response?.data?.message || e.message));
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
        <div>
          <Button variant="secondary" onClick={() => setShowBulkUpload(!showBulkUpload)} style={{ marginRight: designSystem.spacing.sm }}>
            Bulk Upload
          </Button>
          <Button variant="primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? "Cancel" : "+ Add Employee"}
          </Button>
        </div>
      </div>

      {showBulkUpload && (
        <div style={{ ...globalStyles.card, marginBottom: designSystem.spacing.sm }}>
            <h3 style={designSystem.typography.h3}>Bulk Upload (.csv, .xls, .xlsx)</h3>
            <input type="file" accept=".csv, .xls, .xlsx" ref={fileInputRef} onChange={handleFileUpload} style={{marginBottom: designSystem.spacing.sm}} />
            
            {bulkHeaders.length > 0 && (
                <div>
                    <h4 style={{marginTop: designSystem.spacing.sm}}>Map Columns</h4>
                    <div style={{display: 'flex', gap: designSystem.spacing.md, flexWrap: 'wrap'}}>
                        <div style={{ ...designSystem.typography.h3}}>
                            <label style={labelStyle}>*Existing columns</label> 
                            <label style={labelStyle}>Match uploaded file <br/>with existing columns</label>
                        </div>
                        <div>
                            <label style={labelStyle}>Name Column</label>
                            <select value={columnMapping.Name} onChange={e => setColumnMapping({...columnMapping, Name: e.target.value})} style={inputStyle}>
                                <option value="">-Select-</option>
                                {bulkHeaders.map(h => <option key={h} value={h}>{h}</option>)}
                            </select>
                        </div>
                        <div>
                            <label style={labelStyle}>Email Column</label>
                            <select value={columnMapping.Email} onChange={e => setColumnMapping({...columnMapping, Email: e.target.value})} style={inputStyle}>
                                <option value="">-Select-</option>
                                {bulkHeaders.map(h => <option key={h} value={h}>{h}</option>)}
                            </select>
                        </div>
                        <div>
                            <label style={labelStyle}>Department Column</label>
                            <select value={columnMapping.Department} onChange={e => setColumnMapping({...columnMapping, Department: e.target.value})} style={inputStyle}>
                                <option value="">-Select-</option>
                                {bulkHeaders.map(h => <option key={h} value={h}>{h}</option>)}
                            </select>
                        </div>
                    </div>
                    <Button variant="primary" onClick={handleBulkSubmit}>Upload {bulkData.length} Employees</Button>
                    
                    {bulkErrors.length > 0 && (
                        <div style={{ marginTop: designSystem.spacing.md, border: `1px solid ${designSystem.colors.warning}`, borderRadius: designSystem.radius, padding: designSystem.spacing.md }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: designSystem.spacing.sm }}>
                                <h4 style={{ margin: 0, color: designSystem.colors.warning }}>
                                    ⚠️ {bulkErrors.length} Row(s) Skipped - Missing Data
                                </h4>
                                <Button variant="secondary" size="small" onClick={() => setShowErrorLog(!showErrorLog)}>
                                    {showErrorLog ? "Hide" : "View"} Error Log
                                </Button>
                            </div>
                            
                            {showErrorLog && (
                                <div style={{ overflowX: "auto", marginTop: designSystem.spacing.sm }}>
                                    <table style={{ ...globalStyles.table, width: "100%" }}>
                                        <thead>
                                            <tr style={{ ...globalStyles.tableHeader }}>
                                                <th style={globalStyles.tableheadercell}>Row</th>
                                                <th style={globalStyles.tableheadercell}>Name</th>
                                                <th style={globalStyles.tableheadercell}>Email</th>
                                                <th style={globalStyles.tableheadercell}>Department</th>
                                                <th style={globalStyles.tableheadercell}>Reason</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {bulkErrors.map((err, idx) => (
                                                <tr key={idx} style={{ ...globalStyles.tableRowEven }}>
                                                    <td style={{ ...globalStyles.tableCell }}>{err.row}</td>
                                                    <td style={{ ...globalStyles.tableCell }}>{err.name}</td>
                                                    <td style={{ ...globalStyles.tableCell }}>{err.email}</td>
                                                    <td style={{ ...globalStyles.tableCell }}>{err.department || "—"}</td>
                                                    <td style={{ ...globalStyles.tableCell, color: designSystem.colors.error }}>{err.reason}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    <p style={{ ...designSystem.typography.caption, color: designSystem.colors.textSecondary, marginTop: designSystem.spacing.sm }}>
                                        These rows were not uploaded due to missing Name or Email. Please fix the data in your file and re-upload.
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
      )}

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
          <option value="">-- Select Role --</option>
              {roles.map((rol) => (
                <option key={rol.id} value={rol.name}>
                  {rol.name}
                  {rol.description && ` (${rol.description})`}
                </option>
              ))}
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