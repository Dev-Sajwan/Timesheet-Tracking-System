import React, { useState, useEffect, useMemo } from "react";
import { getTimesheetsByEmployee, getEmployees, getProjects, getHolidays, getAllocationsByEmployee } from "../Services/Api";
import TimesheetForm from "./TimesheetForm";
import { useNavigate } from "react-router-dom";
import { designSystem, globalStyles } from "../styles/designSystem";
import Modal from "./Modal";
import Button from "./Button";

const formatDate = (value) => {
  if (!value) return "";
  const d = new Date(value);
  if (isNaN(d)) return value;
  return d.toLocaleDateString("en-CA");
};

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

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;
  const pages = [];
  const start = Math.max(1, currentPage - 2);
  const end = Math.min(totalPages, start + 4);
  for (let i = start; i <= end; i++) pages.push(i);

  return (
    <div style={{ marginTop: designSystem.spacing.md, display: "flex", gap: designSystem.spacing.sm, alignItems: "center" }}>
      <Button variant="secondary" size="small" disabled={currentPage === 1} onClick={() => onPageChange(currentPage - 1)}>Prev</Button>
      {start > 1 && <span style={{ ...designSystem.typography.caption, color: designSystem.colors.textSecondary }}> ... </span>}
      {pages.map(p => (
        <Button key={p} variant="secondary" size="small" onClick={() => onPageChange(p)} style={{ fontWeight: p === currentPage ? "bold" : "normal" }}>{p}</Button>
      ))}
      {end < totalPages && <span style={{ ...designSystem.typography.caption, color: designSystem.colors.textSecondary }}> ... </span>}
      <Button variant="secondary" size="small" disabled={currentPage === totalPages} onClick={() => onPageChange(currentPage + 1)}>Next</Button>
    </div>
  );
};

const EmployeeDashboard = () => {
  const [timesheets, setTimesheets] = useState([]);
  const [allocations, setAllocations] = useState([]);
  const [projects, setProjects] = useState([]);
  const [holidays, setHolidays] = useState([]);
  const [timesheetPage, setTimesheetPage] = useState(1);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const employeeId = localStorage.getItem("employeeId");
  const fullName = localStorage.getItem("fullName");
  const navigate = useNavigate();
  const itemsPerPage = 4;

  const loadData = React.useCallback(async () => {
    try {
      await getEmployees();
      
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
  }, [employeeId]);

  useEffect(() => {
    if (employeeId) {
      loadData();
    }
  }, [employeeId, loadData]);

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

  const timesheetPages = Math.ceil(timesheets.length / itemsPerPage);
  const paginatedTimesheets = timesheets.slice(
    (timesheetPage - 1) * itemsPerPage,
    timesheetPage * itemsPerPage
  );

  return (
    <div style={{ minHeight: "100vh", background: designSystem.colors.background, fontFamily: "Roboto, Arial, sans-serif" }}>
      <div style={{ 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center",
        background: designSystem.colors.primary, 
        color: designSystem.colors.white, 
        padding: `${designSystem.spacing.sm} ${designSystem.spacing.lg}`,
        ...designSystem.typography.h1,
      }}>
        <h2 style={{ margin: 0, fontSize: "18px", fontWeight: 700 }}>Employee Dashboard</h2>
        <div style={{ display: "flex", alignItems: "center", gap: designSystem.spacing.md }}>
           <span style={{ fontSize: "14px" }}>{fullName}</span>
           <Button variant="secondary" size="small" onClick={handleLogout} style={{ background: designSystem.colors.error, color: designSystem.colors.white, border: 'none' }}>Logout</Button>
        </div>
      </div>
      
      <div style={{ padding: designSystem.spacing.lg, maxWidth: "900px", margin: "0 auto" }}>
        <div style={{ ...globalStyles.card, marginBottom: designSystem.spacing.lg }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: designSystem.spacing.sm }}>
            <h3 style={{ margin: 0, ...designSystem.typography.h2 }}>Submit Timesheet</h3>
            <Button variant="primary" onClick={() => setShowSubmitModal(true)}>Open Form</Button>
          </div>
          <p style={{ ...designSystem.typography.body, color: designSystem.colors.textSecondary, margin: 0 }}>
            Record your daily hours and comp-off entries using the submission form.
          </p>
        </div>

        <Modal
          isOpen={showSubmitModal}
          onClose={() => setShowSubmitModal(false)}
          title="Submit Timesheet"
          footer={
            <Button variant="secondary" onClick={() => setShowSubmitModal(false)}>Close</Button>
          }
        >
          <TimesheetForm employeeId={employeeId} onSubmitted={() => { loadData(); setShowSubmitModal(false); }} />
        </Modal>

        <hr style={{ border: `1px solid ${designSystem.colors.divider}`, margin: `${designSystem.spacing.lg} 0` }} />

        <div style={{ marginBottom: designSystem.spacing.lg }}>
          <h3 style={{ ...designSystem.typography.h2, margin: `0 0 ${designSystem.spacing.sm} 0`, color: designSystem.colors.text }}>Weekly Project Hours Summary</h3>
          {weeklySummary.length > 0 ? (
            <div style={globalStyles.tableWrapper}>
              <table style={{ ...globalStyles.table, ...globalStyles.tableWrapper }}>
              <thead>
                <tr style={{ ...globalStyles.tableHeader }}>
                  <th style={{...globalStyles.tableheadercell}}>Week</th>
                  <th style={{...globalStyles.tableheadercell}}>Standard Hours</th>
                  <th style={{...globalStyles.tableheadercell}}>Holiday Reduction</th>
                  <th style={{...globalStyles.tableheadercell}}>Effective Standard</th>
                  <th style={{...globalStyles.tableheadercell}}>Actual Hours</th>
                  <th style={{...globalStyles.tableheadercell}}>Regular Hours</th>
                  <th style={{...globalStyles.tableheadercell}}>Comp-Off  Hours</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {weeklySummary.map(week => (
                  <tr key={week.weekStart} style={{ ...globalStyles.tableRowEven }}>
                    <td style={{ ...globalStyles.tableCell }}>{week.weekStart} to {week.weekEnd}</td>
                    <td style={{ ...globalStyles.tableCell }}>40</td>
                    <td style={{ ...globalStyles.tableCell }}>{week.holidayReduction} hrs</td>
                    <td style={{ ...globalStyles.tableCell }}><strong>{week.standardHours}</strong></td>
                    <td style={{ ...globalStyles.tableCell }}><strong>{week.actualHours}</strong></td>
                    <td style={{ ...globalStyles.tableCell }}>{week.regularHours}</td>
                    <td style={{ ...globalStyles.tableCell, color: week.compOffHours > 0 ? designSystem.colors.error : designSystem.colors.success }}>
                      {week.compOffHours > 0 ? `${week.compOffHours} (needs approval)` : "0"}
                    </td>
                    <td style={{ ...globalStyles.tableCell }}>
                      {week.hasPendingApproval ? (
                        <span style={{ color: designSystem.colors.warning, fontWeight: "bold" }}>Pending Approval</span>
                      ) : week.actualHours >= week.standardHours ? (
                        <span style={{ color: designSystem.colors.success }}>Complete</span>
                      ) : (
                        <span style={{ color: designSystem.colors.error }}>{week.standardHours - week.actualHours} hrs short</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
              </table>
            </div>
          ) : (
            <p style={{ ...designSystem.typography.body, color: designSystem.colors.textSecondary }}>No timesheets submitted yet.</p>
          )}
        </div>

        <div style={{ marginBottom: designSystem.spacing.lg }}>
          <h3 style={{ ...designSystem.typography.h2, margin: `0 0 ${designSystem.spacing.sm} 0`, color: designSystem.colors.text }}>Holidays</h3>
          {holidays.length > 0 ? (
            <div style={globalStyles.tableWrapper}>
              <table style={{ ...globalStyles.table }}>
              <thead>
                <tr style={{ ...globalStyles.tableHeader }}>
                  <th style={{ ...globalStyles.tableheadercell }}>Date</th>
                  <th style={{ ...globalStyles.tableheadercell }}>Description</th>
                  <th style={{ ...globalStyles.tableheadercell }}>Impact</th>
                </tr>
              </thead>
              <tbody>
                {holidays.slice(0, itemsPerPage).map(h => {
                  const holidayDate = new Date(h.date);
                  const isWeekendDay = isWeekend(holidayDate);
                  return (
                    <tr key={h.holidayId} style={{ ...globalStyles.tableRowEven }}>
                      <td style={{ ...globalStyles.tableCell }}>{formatDate(h.date)}</td>
                      <td style={{ ...globalStyles.tableCell }}>{h.description}</td>
                      <td style={{ ...globalStyles.tableCell }}>{isWeekendDay ? "Weekend (no impact)" : "Reduces week by 8 hrs"}</td>
                    </tr>
                  );
                })}
</tbody>
              </table>
            </div>
          ) : (
            <p style={{ ...designSystem.typography.body, color: designSystem.colors.textSecondary }}>No holidays configured.</p>
          )}
        </div>

        <hr style={{ border: `1px solid ${designSystem.colors.divider}`, margin: `${designSystem.spacing.lg} 0` }} />
        
        <h3 style={{ ...designSystem.typography.h2, margin: `0 0 ${designSystem.spacing.sm} 0`, color: designSystem.colors.text }}>Your Allocations</h3>
        {allocations.length > 0 ? (
          <div style={globalStyles.tableWrapper}>
            <table style={{ ...globalStyles.table }}>
            <thead>
              <tr style={{ ...globalStyles.tableHeader }}>
                <th style={{ ...globalStyles.tableheadercell }}>Project</th>
                <th style={{ ...globalStyles.tableheadercell }}>Allocation %</th>
                <th style={{ ...globalStyles.tableheadercell }}>Start Date</th>
              </tr>
            </thead>
            <tbody>
              {allocations.slice(0, itemsPerPage).map(a => (
                <tr key={a.allocationId || a.id} style={{ ...globalStyles.tableRowEven }}>
                  <td style={{ ...globalStyles.tableCell }}>{projects.find(p => p.projectId === a.projectId)?.projectName || a.projectId}</td>
                  <td style={{ ...globalStyles.tableCell }}>{a.allocationPercent || a.allocationPercentage}%</td>
                  <td style={{ ...globalStyles.tableCell }}>{a.startDate ? formatDate(a.startDate) : "N/A"}</td>
                </tr>
              ))}
</tbody>
            </table>
          </div>
        ) : (
          <p style={{ ...designSystem.typography.body, color: designSystem.colors.textSecondary }}>No project allocations.</p>
        )}

        <Pagination 
          currentPage={timesheetPage} 
          totalPages={timesheetPages} 
          onPageChange={setTimesheetPage} 
        />

        <hr style={{ border: `1px solid ${designSystem.colors.divider}`, margin: `${designSystem.spacing.lg} 0` }} />

        <h3 style={{ ...designSystem.typography.h2, margin: `0 0 ${designSystem.spacing.sm} 0`, color: designSystem.colors.text }}>Your Timesheets</h3>
        {paginatedTimesheets.length > 0 ? (
          <>
            <div style={globalStyles.tableWrapper}>
              <table style={{ ...globalStyles.table }}>
              <thead>
                <tr style={{ ...globalStyles.tableHeader }}>
                  <th style={{ ...globalStyles.tableheadercell }}>Date</th>
                  <th style={{ ...globalStyles.tableheadercell }}>Project</th>
                  <th style={{ ...globalStyles.tableheadercell }}>Hours Worked</th>
                  <th style={{ ...globalStyles.tableheadercell }}>Description</th>
                  <th style={{ ...globalStyles.tableheadercell }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {paginatedTimesheets.map(t => (
                  <tr key={t.id} style={{ ...globalStyles.tableRowEven }}>
                    <td style={{ ...globalStyles.tableCell }}>{formatDate(t.date)}</td>
                    <td style={{ ...globalStyles.tableCell }}>{projects.find(p => p.projectId === t.projectId)?.projectName || t.projectId}</td>
                    <td style={{ ...globalStyles.tableCell }}>
                      {t.hoursWorked}
                      {Number(t.hoursWorked) > 8 && (
                        <span style={{ color: designSystem.colors.error, fontSize: "0.8em", marginLeft: "5px" }}>
                          ({Number(t.hoursWorked) - 8} comp-off)
                        </span>
                      )}
                    </td>
                    <td style={{ ...globalStyles.tableCell }}>{t.entries?.[0]?.description}</td>
                    <td style={{ ...globalStyles.tableCell }}>
                      {t.approvalStatus}
                      {t.approvalStatus === "Pending" && (
                        <span style={{ color: designSystem.colors.warning, fontSize: "0.8em" }}> (awaiting approval)</span>
                      )}
                      {Number(t.hoursWorked) > 8 && t.approvalStatus === "Approved" && (
                        <span style={{ color: designSystem.colors.success, fontSize: "0.8em", display: "block" }}>Comp-off approved</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
              </table>
            </div>
            <Pagination 
              currentPage={timesheetPage} 
              totalPages={timesheetPages} 
              onPageChange={setTimesheetPage} 
            />
          </>
        ) : (
          <p style={{ ...designSystem.typography.body, color: designSystem.colors.textSecondary }}>No timesheets found.</p>
        )}
      </div>
    </div>
  );
};

export default EmployeeDashboard;
