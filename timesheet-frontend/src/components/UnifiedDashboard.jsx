import React, { useState, useEffect } from "react";
import EmployeeList from "./EmployeeList";
import ProjectList from "./ProjectList";
import AllocationList from "./AllocationList";
import TimesheetForm from "./TimesheetForm";
import WeeklyTimesheet from "./WeeklyTimesheet";
import HolidayList from "./HolidayList";
import PermissionManager from "./PermissionManager";
import { useNavigate } from "react-router-dom";
import { designSystem } from "../styles/designSystem";

const UnifiedDashboard = () => {
  const [activeTab, setActiveTab] = useState("timesheets");
  const [timesheetMode, setTimesheetMode] = useState("weekly"); // 'weekly' or 'daily'
  const navigate = useNavigate();
  const fullName = localStorage.getItem("fullName") || "User";
  
  const [permissions, setPermissions] = useState([]);

  useEffect(() => {
    const perms = JSON.parse(localStorage.getItem("permissions") || "[]");
    setPermissions(perms);
    
    // Set default active tab
    setActiveTab("timesheets");
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("employeeId");
    localStorage.removeItem("fullName");
    localStorage.removeItem("permissions");
    navigate("/");
  };

  const hasPerm = (p) => permissions.includes(p);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", fontFamily: "Roboto, sans-serif" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", background: designSystem.colors.primary, color: "white", padding: "10px 20px" }}>
        <h2>Dashboard</h2>
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
           <span>{fullName}</span>
           <button onClick={handleLogout} style={{ padding: "5px 15px", background: designSystem.colors.error, color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}>Logout</button>
        </div>
      </div>
      
      <div style={{ display: "flex", flex: 1 }}>
        {/* Sidebar - All tabs visible to everyone */}
        <div style={{ width: "220px", background: designSystem.colors.primaryDark, color: "#ecf0f1", padding: "20px" }}>
          <ul style={{ listStyle: "none", padding: 0 }}>
            <li style={{ margin: "15px 0", cursor: "pointer", fontWeight: activeTab === "timesheets" ? "bold" : "normal" }} onClick={() => setActiveTab("timesheets")}>
              📊 My Timesheets
            </li>
            { activeTab === "timesheets" && (
              <div style={{ marginLeft: "15px", marginBottom: "10px", borderLeft: "2px solid #3498db", paddingLeft: "10px" }}>
                <label style={{ display: "block", margin: "5px 0", cursor: "pointer", fontWeight: timesheetMode === "weekly" ? "bold" : "normal", color: timesheetMode === "weekly" ? "#3498db" : "inherit" }} onClick={() => setTimesheetMode("weekly")}>
                  📅 Weekly View
                </label>
                <label style={{ display: "block", margin: "5px 0", cursor: "pointer", fontWeight: timesheetMode === "daily" ? "bold" : "normal", color: timesheetMode === "daily" ? "#3498db" : "inherit" }} onClick={() => setTimesheetMode("daily")}>
                  📆 Daily Entry
                </label>
              </div>
            )}
            <li style={{ margin: "15px 0", cursor: "pointer", fontWeight: activeTab === "employees" ? "bold" : "normal" }} onClick={() => setActiveTab("employees")}>
              👤 Employees
            </li>
            <li style={{ margin: "15px 0", cursor: "pointer", fontWeight: activeTab === "projects" ? "bold" : "normal" }} onClick={() => setActiveTab("projects")}>
              📂 Projects
            </li>
            <li style={{ margin: "15px 0", cursor: "pointer", fontWeight: activeTab === "allocations" ? "bold" : "normal" }} onClick={() => setActiveTab("allocations")}>
              📊 Allocations
            </li>
            <li style={{ margin: "15px 0", cursor: "pointer", fontWeight: activeTab === "holidays" ? "bold" : "normal" }} onClick={() => setActiveTab("holidays")}>
              📅 Holidays
            </li>
            <li style={{ margin: "15px 0", cursor: "pointer", fontWeight: activeTab === "permissions" ? "bold" : "normal" }} onClick={() => setActiveTab("permissions")}>
              🔒 Permissions
            </li>
          </ul>
        </div>

        {/* Main Content */}
        <div style={{ flex: 1, padding: "30px", background: designSystem.colors.background, overflowY: "auto" }}>
          {activeTab === "timesheets" && timesheetMode === "weekly" && <WeeklyTimesheet employeeId={localStorage.getItem("employeeId")} />}
          {activeTab === "timesheets" && timesheetMode === "daily" && <TimesheetForm employeeId={localStorage.getItem("employeeId")} />}
          {activeTab === "employees" && <EmployeeList />}
          {activeTab === "projects" && <ProjectList />}
          {activeTab === "allocations" && <AllocationList />}
          {activeTab === "holidays" && <HolidayList />}
          {activeTab === "permissions" && <PermissionManager />}
        </div>
      </div>
    </div>
  );
};

export default UnifiedDashboard;
