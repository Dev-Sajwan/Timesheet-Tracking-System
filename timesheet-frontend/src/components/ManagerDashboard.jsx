import React, { useState } from "react";
import EmployeeList from "./EmployeeList";
import AllocationList from "./AllocationList";
import TimesheetForm from "./TimesheetForm";
import HolidayList from "./HolidayList";
import { useNavigate } from "react-router-dom";
import { designSystem } from "../styles/designSystem";
import Button from "./Button";

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

  const tabs = [
    { id: "timesheets", label: "Review Timesheets", icon: "🕒" },
    { id: "employees", label: "Employees", icon: "👤" },
    { id: "allocations", label: "Allocations", icon: "📊" },
    { id: "holidays", label: "Holidays", icon: "📅" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", fontFamily: "Roboto, Arial, sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: designSystem.colors.primary, color: designSystem.colors.white, padding: `${designSystem.spacing.sm} ${designSystem.spacing.lg}` }}>
        <h2 style={{ margin: 0, ...designSystem.typography.h1, fontSize: "18px", fontWeight: 700 }}>Manager Dashboard</h2>
        <div style={{ display: "flex", alignItems: "center", gap: designSystem.spacing.md }}>
          <span style={{ fontSize: "14px" }}>{fullName}</span>
          <Button variant="secondary" size="small" onClick={handleLogout} style={{ background: designSystem.colors.error, color: designSystem.colors.white, border: "none" }}>Logout</Button>
        </div>
      </div>

      <div style={{ display: "flex", flex: 1 }}>
        <div style={{ width: "220px", background: designSystem.colors.primaryDark, color: designSystem.colors.white, padding: designSystem.spacing.md }}>
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {tabs.map(tab => (
              <li key={tab.id} style={{ margin: `${designSystem.spacing.sm} 0`, cursor: "pointer", fontWeight: activeTab === tab.id ? "bold" : "normal" }} onClick={() => setActiveTab(tab.id)}>
                {tab.icon} {tab.label}
              </li>
            ))}
          </ul>
        </div>

        <div style={{ flex: 1, padding: designSystem.spacing.lg, background: designSystem.colors.background, overflowY: "auto" }}>
          {activeTab === "timesheets" && <TimesheetForm />}
          {activeTab === "employees" && <EmployeeList />}
          {activeTab === "allocations" && <AllocationList />}
          {activeTab === "holidays" && <HolidayList />}
        </div>
      </div>
    </div>
  );
};

export default ManagerDashboard;