import React, { useState } from "react";
import EmployeeList from "./components/EmployeeList";
import ProjectList from "./components/ProjectList";
import AllocationList from "./components/AllocationList";
import TimesheetForm from "./components/TimesheetForm";

function App() {
  const [activeTab, setActiveTab] = useState("employees");

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "Arial, sans-serif" }}>
      {/* Sidebar */}
      <div style={{ width: "220px", background: "#2c3e50", color: "#ecf0f1", padding: "20px" }}>
        <h2 style={{ textAlign: "center" }}>Dashboard</h2>
        <ul style={{ listStyle: "none", padding: 0 }}>
          <li style={{ margin: "15px 0", cursor: "pointer" }} onClick={() => setActiveTab("employees")}>
            👤 Employees
          </li>
          <li style={{ margin: "15px 0", cursor: "pointer" }} onClick={() => setActiveTab("projects")}>
            📂 Projects
          </li>
          <li style={{ margin: "15px 0", cursor: "pointer" }} onClick={() => setActiveTab("allocations")}>
            📊 Allocations
          </li>
          <li style={{ margin: "15px 0", cursor: "pointer" }} onClick={() => setActiveTab("timesheets")}>
            🕒 Timesheets
          </li>
        </ul>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, padding: "30px", background: "#ecf0f1" }}>
        {activeTab === "employees" && <EmployeeList />}
        {activeTab === "projects" && <ProjectList />}
        {activeTab === "allocations" && <AllocationList />}
        {activeTab === "timesheets" && <TimesheetForm />}
      </div>
    </div>
  );
}

export default App;
