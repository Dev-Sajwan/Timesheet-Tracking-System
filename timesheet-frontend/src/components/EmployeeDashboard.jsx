import React, { useState, useEffect, useMemo } from "react";
import { getTimesheetsByEmployee, getEmployees, getProjects, getHolidays, getAllocationsByEmployee } from "../Services/Api";
import TimesheetForm from "./TimesheetForm";
import { useNavigate } from "react-router-dom";

// Helper functions
const getWeekRange = (date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const start = new Date(d);
  start.setDate(d.getDate() + diffToMonday);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return { start, end };
};

const isWeekend = (date) => {
  const day = new Date(date).getDay();
  return day === 0 || day === 6;
};

const getWeekKey = (date) => {
  const { start } = getWeekRange(date);
  return start.toISOString().split('T')[0];
};

// Pagination helper component
const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;
  const pages = [];
  const start = Math.max(1, currentPage - 2);
  const end = Math.min(totalPages, start + 4);
  for (let i = start; i <= end; i++) pages.push(i);

  return (
    <div style={{ marginTop: "10px" }}>
      <button disabled={currentPage === 1} onClick={() => onPageChange(currentPage - 1)}>Prev</button>
      {start > 1 && <span> ... </span>}
      {pages.map(p => (
        <button key={p} onClick={() => onPageChange(p)} style={{ margin: "0 2px", fontWeight: p === currentPage ? "bold" : "normal" }}>{p}</button>
      ))}
      {end < totalPages && <span> ... </span>}
      <button disabled={currentPage === totalPages} onClick={() => onPageChange(currentPage + 1)}>Next</button>
    </div>
  );
};

const EmployeeDashboard = () => {
  const [timesheets, setTimesheets] = useState([]);
  const [allocations, setAllocations] = useState([]);
  const [employeeInfo, setEmployeeInfo] = useState(null);
  const [projects, setProjects] = useState([]);
  const [holidays, setHolidays] = useState([]);
  const [timesheetPage, setTimesheetPage] = useState(1);
  const employeeId = localStorage.getItem("employeeId");
  const fullName = localStorage.getItem("fullName");
  const navigate = useNavigate();
  const itemsPerPage = 4;

  useEffect(() => {
    if (employeeId) {
      loadData();
    }
  }, [employeeId]);

  const loadData = async () => {
    try {
      // Get employee info and allocations from getEmployees (includes allocations)
      const empRes = await getEmployees();
      const me = empRes.data.find(e => e.id === employeeId);
      setEmployeeInfo(me);
      
      // Also fetch allocations directly by employee ID
      const allocRes = await getAllocationsByEmployee(employeeId);
      setAllocations(allocRes.data || []);

      const timesheetRes = await getTimesheetsByEmployee(employeeId);
      setTimesheets(timesheetRes.data);

      const projRes = await getProjects();
      setProjects(projRes.data);

      const holidayRes = await getHolidays();
      setHolidays(holidayRes.data);
    } catch (e) {
      console.error(e);
    }
  };

  // Calculate weekly hours summary
  const weeklySummary = useMemo(() => {
    if (!timesheets.length) return [];
    
    const weekMap = {};
    timesheets.forEach(ts => {
      const weekKey = getWeekKey(ts.date);
      if (!weekMap[weekKey]) {
        weekMap[weekKey] = { timesheets: [], totalHours: 0, compOffHours: 0 };
      }
      weekMap[weekKey].timesheets.push(ts);
      weekMap[weekKey].totalHours += Number(ts.hoursWorked) || 0;
      
      const dayHours = Number(ts.hoursWorked) || 0;
      if (dayHours > 8) {
        weekMap[weekKey].compOffHours += dayHours - 8;
      }
    });

    const holidayMap = {};
    holidays.forEach(h => {
      const holidayDate = new Date(h.date);
      const weekKey = getWeekKey(holidayDate);
      if (!holidayMap[weekKey]) holidayMap[weekKey] = 0;
      if (!isWeekend(holidayDate)) {
        holidayMap[weekKey] += 8;
      }
    });

    return Object.entries(weekMap).map(([weekKey, data]) => {
      const holidayReduction = holidayMap[weekKey] || 0;
      const standardHours = 40 - holidayReduction;
      const actualHours = data.totalHours;
      const compOffHours = data.compOffHours;
      const regularHours = actualHours - compOffHours;
      const pendingApproval = data.timesheets.some(t => t.approvalStatus === "Pending");
      
      return {
        weekStart: weekKey,
        weekEnd: new Date(new Date(weekKey).getTime() + 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        standardHours: Math.max(0, standardHours),
        actualHours,
        regularHours: Math.max(0, regularHours),
        compOffHours,
        holidayReduction,
        timesheetCount: data.timesheets.length,
        hasPendingApproval: pendingApproval,
        timesheets: data.timesheets
      };
    }).sort((a, b) => b.weekStart.localeCompare(a.weekStart));
  }, [timesheets, holidays]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("employeeId");
    localStorage.removeItem("fullName");
    navigate("/");
  };

  // Pagination for timesheets
  const timesheetPages = Math.ceil(timesheets.length / itemsPerPage);
  const paginatedTimesheets = timesheets.slice(
    (timesheetPage - 1) * itemsPerPage,
    timesheetPage * itemsPerPage
  );

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
        {/* Submit Timesheet - at the top */}
        <h3>Submit Timesheet</h3>
        <TimesheetForm employeeId={employeeId} onSubmitted={loadData} />

        <hr />

        {/* Weekly Hours Summary */}
        <div style={{ marginBottom: "20px"}}>
          <h3>Weekly Project Hours Summary</h3>
          {weeklySummary.length > 0 ? (
            <table border="1" cellPadding="10" style={{ width: "80%", borderCollapse: "collapse", marginBottom: "20px"}}>
              <thead>
                <tr style={{ background: "#f2f2f2" }}>
                  <th>Week</th>
                  <th>Standard Hours</th>
                  <th>Holiday Reduction</th>
                  <th>Effective Standard</th>
                  <th>Actual Hours</th>
                  <th>Regular Hours</th>
                  <th>Comp-Off Hours</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {weeklySummary.map(week => (
                  <tr key={week.weekStart}>
                    <td>{week.weekStart} to {week.weekEnd}</td>
                    <td>40</td>
                    <td>{week.holidayReduction} hrs</td>
                    <td><strong>{week.standardHours}</strong></td>
                    <td><strong>{week.actualHours}</strong></td>
                    <td>{week.regularHours}</td>
                    <td style={{ color: week.compOffHours > 0 ? "#e74c3c" : "#27ae60" }}>
                      {week.compOffHours > 0 ? `${week.compOffHours} (needs approval)` : "0"}
                    </td>
                    <td>
                      {week.hasPendingApproval ? (
                        <span style={{ color: "#f39c12", fontWeight: "bold" }}>Pending Approval</span>
                      ) : week.actualHours >= week.standardHours ? (
                        <span style={{ color: "#27ae60" }}>✓ Complete</span>
                      ) : (
                        <span style={{ color: "#e74c3c" }}>{week.standardHours - week.actualHours} hrs short</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No timesheets submitted yet.</p>
          )}
        </div>

        {/* Holiday List */}
        <div style={{ marginBottom: "20px" }}>
          <h3>Holidays</h3>
          {holidays.length > 0 ? (
            <table border="1" cellPadding="10" style={{ width: "80%", borderCollapse: "collapse", marginBottom: "20px" }}>
              <thead>
                <tr style={{ background: "#f2f2f2" }}>
                  <th>Date</th>
                  <th>Description</th>
                  <th>Impact</th>
                </tr>
              </thead>
              <tbody>
                {holidays.slice(0, itemsPerPage).map(h => {
                  const holidayDate = new Date(h.date);
                  const isWeekendDay = isWeekend(holidayDate);
                  return (
                    <tr key={h.holidayId}>
                      <td>{holidayDate.toLocaleDateString()}</td>
                      <td>{h.description}</td>
                      <td>{isWeekendDay ? "Weekend (no impact)" : "Reduces week by 8 hrs"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <p>No holidays configured.</p>
          )}
        </div>

        <hr />
        
        <h3>Your Allocations</h3>
        {allocations.length > 0 ? (
          <table border="1" cellPadding="10" style={{ width: "80%", borderCollapse: "collapse", marginBottom: "20px" }}>
            <thead>
              <tr style={{ background: "#f2f2f2" }}>
                <th>Project</th>
                <th>Allocation %</th>
                <th>Start Date</th>
              </tr>
            </thead>
            <tbody>
              {allocations.slice(0, itemsPerPage).map(a => (
                <tr key={a.allocationId || a.id}>
                  <td>{projects.find(p => p.projectId === a.projectId)?.projectName || a.projectId}</td>
                  <td>{a.allocationPercent || a.allocationPercentage}%</td>
                  <td>{a.startDate ? new Date(a.startDate).toLocaleDateString() : "N/A"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No project allocations.</p>
        )}

        <Pagination 
          currentPage={timesheetPage} 
          totalPages={timesheetPages} 
          onPageChange={setTimesheetPage} 
        />

        <hr />

        <h3>Your Timesheets</h3>
        {paginatedTimesheets.length > 0 ? (
          <>
            <table border="1" cellPadding="10" style={{ width: "80%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#f2f2f2" }}>
                  <th>Date</th>
                  <th>Project</th>
                  <th>Hours Worked</th>
                  <th>Description</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {paginatedTimesheets.map(t => (
                  <tr key={t.id}>
                    <td>{new Date(t.date).toLocaleDateString()}</td>
                    <td>{projects.find(p => p.projectId === t.projectId)?.projectName || t.projectId}</td>
                    <td>
                      {t.hoursWorked}
                      {Number(t.hoursWorked) > 8 && (
                        <span style={{ color: "#e74c3c", fontSize: "0.8em", marginLeft: "5px" }}>
                          ({Number(t.hoursWorked) - 8} comp-off)
                        </span>
                      )}
                    </td>
                    <td>{t.entries?.[0]?.description}</td>
                    <td>
                      {t.approvalStatus}
                      {t.approvalStatus === "Pending" && (
                        <span style={{ color: "#f39c12", fontSize: "0.8em" }}> (awaiting approval)</span>
                      )}
                      {Number(t.hoursWorked) > 8 && t.approvalStatus === "Approved" && (
                        <span style={{ color: "#27ae60", fontSize: "0.8em", display: "block" }}>Comp-off approved</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Pagination 
              currentPage={timesheetPage} 
              totalPages={timesheetPages} 
              onPageChange={setTimesheetPage} 
            />
          </>
        ) : (
          <p>No timesheets found.</p>
        )}
      </div>
    </div>
  );
};

export default EmployeeDashboard;
