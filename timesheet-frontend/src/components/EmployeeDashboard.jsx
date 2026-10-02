import React, { useState, useEffect } from "react";
import { getTimesheetsByEmployee, getEmployees, getProjects } from "../Services/Api";
import TimesheetForm from "./TimesheetForm";
import { useNavigate } from "react-router-dom";

const EmployeeDashboard = () => {
  const [timesheets, setTimesheets] = useState([]);
  const [employeeInfo, setEmployeeInfo] = useState(null);
  const [projects, setProjects] = useState([]);
  const employeeId = localStorage.getItem("employeeId");
  const fullName = localStorage.getItem("fullName");
  const navigate = useNavigate();

  useEffect(() => {
    if (employeeId) {
      loadData();
    }
  }, [employeeId]);

  const loadData = async () => {
    try {
      const timesheetRes = await getTimesheetsByEmployee(employeeId);
      setTimesheets(timesheetRes.data);

      const empRes = await getEmployees();
      const me = empRes.data.find(e => e.id === employeeId);
      setEmployeeInfo(me);

      const projRes = await getProjects();
      setProjects(projRes.data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("employeeId");
    localStorage.removeItem("fullName");
    navigate("/");
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", background: "#2c3e50", color: "white", padding: "10px 20px" }}>
        <h2>Employee Dashboard</h2>
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
           <span>{fullName}</span>
           <button onClick={handleLogout} style={{ padding: "5px 15px", background: "#e74c3c", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}>Logout</button>
        </div>
      </div>
      
      <div style={{ padding: "20px" }}>
        <h3>Your Allocations</h3>
        {employeeInfo && employeeInfo.allocations && employeeInfo.allocations.length > 0 ? (
          <table border="1" cellPadding="10" style={{ width: "100%", borderCollapse: "collapse", marginBottom: "20px" }}>
            <thead>
              <tr style={{ background: "#f2f2f2" }}>
                <th>Project ID</th>
                <th>Role</th>
                <th>Allocation %</th>
              </tr>
            </thead>
            <tbody>
              {employeeInfo.allocations.map(a => (
                <tr key={a.id}>
                  <td>{projects.find(p => p.projectId === a.projectId)?.projectName || a.projectId}</td>
                  <td>{a.role}</td>
                  <td>{a.allocationPercentage}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No project allocations.</p>
        )}

        <hr />
        
        <h3>Submit Timesheet</h3>
        <TimesheetForm employeeId={employeeId} onSubmitted={loadData} />

        <hr />

        <h3>Your Timesheets</h3>
        {timesheets.length > 0 ? (
          <table border="1" cellPadding="10" style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f2f2f2" }}>
                <th>Date</th>
                <th>Project ID</th>
                <th>Hours Worked</th>
                <th>Description</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {timesheets.map(t => (
                <tr key={t.id}>
                  <td>{new Date(t.date).toLocaleDateString()}</td>
                  <td>{projects.find(p => p.projectId === t.projectId)?.projectName || t.projectId}</td>
                  <td>{t.hoursWorked}</td>
                  <td>{t.entries?.[0]?.description}</td>
                  <td>{t.approvalStatus}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No timesheets found.</p>
        )}
      </div>
    </div>
  );
};

export default EmployeeDashboard;
