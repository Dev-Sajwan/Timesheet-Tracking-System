import React, { useState } from "react";
import EmployeeList from "./EmployeeList";
import ProjectList from "./ProjectList";
import AllocationList from "./AllocationList";
import TimesheetForm from "./TimesheetForm";
import { useNavigate } from "react-router-dom";

const ManagerDashboard = () => {
  const [activeTab, setActiveTab] = useState("timesheets");
  const navigate = useNavigate();
  const fullName = localStorage.getItem("fullName") || "Manager";

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("employeeId");
    localStorage.removeItem("fullName");
    navigate("/");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", fontFamily: "Arial, sans-serif" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", background: "#34495e", color: "white", padding: "10px 20px" }}>
        <h2>Manager Dashboard</h2>
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
           <span>{fullName}</span>
           <button onClick={handleLogout} style={{ padding: "5px 15px", background: "#e74c3c", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}>Logout</button>
        </div>
      </div>
      
      <div style={{ display: "flex", flex: 1 }}>
        {/* Sidebar */}
        <div style={{ width: "220px", background: "#2c3e50", color: "#ecf0f1", padding: "20px" }}>
          <ul style={{ listStyle: "none", padding: 0 }}>
            <li style={{ margin: "15px 0", cursor: "pointer", fontWeight: activeTab === "timesheets" ? "bold" : "normal" }} onClick={() => setActiveTab("timesheets")}>
              🕒 Review Timesheets
            </li>
            <li style={{ margin: "15px 0", cursor: "pointer", fontWeight: activeTab === "employees" ? "bold" : "normal" }} onClick={() => setActiveTab("employees")}>
              👤 Employees
            </li>
            <li style={{ margin: "15px 0", cursor: "pointer", fontWeight: activeTab === "allocations" ? "bold" : "normal" }} onClick={() => setActiveTab("allocations")}>
              📊 Allocations
            </li>
          </ul>
        </div>

        {/* Main Content */}
        <div style={{ flex: 1, padding: "30px", background: "#ecf0f1", overflowY: "auto" }}>
          {activeTab === "timesheets" && <TimesheetForm />}
          {activeTab === "employees" && <EmployeeList />}
          {activeTab === "allocations" && <AllocationList />}
        </div>
      </div>
    </div>
  );
};

export default ManagerDashboard;
