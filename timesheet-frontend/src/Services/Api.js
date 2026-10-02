import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5162/api", // backend base URL
});

// Interceptor to add authorization token to requests
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth
export const login = (data) => API.post("/auth/login", data);
export const register = (data) => API.post("/auth/register", data);

// Timesheets
export const submitTimesheet = (data) => API.post("/timesheets", data);
export const getTimesheetsByEmployee = (id) => API.get(`/timesheets/${id}`);
export const getAllTimesheets = () => API.get("/timesheets");
export const approveTimesheet = (id, status) => API.put(`/timesheets/approve/${id}`, { approvalStatus: status });
export const deleteTimesheet = (id) => API.delete(`/timesheets/${id}`);

// Employees
export const addEmployee = (data) => API.post("/employees", data);
export const getEmployees = () => API.get("/employees");
export const getEmployeeById = (id) => API.get(`/employees/${id}`);
export const deleteEmployee = (id) => API.delete(`/employees/${id}`);
// Update employee (PUT request)
export const updateEmployee = (id, employee) =>
  API.put(`/employees/${id}`, employee);
// Role management (Admin only)
export const getEmployeeRoles = (id) => API.get(`/employees/${id}/roles`);
export const assignEmployeeRole = (id, role) => API.put(`/employees/${id}/roles`, { role });
export const resetEmployeePassword = (id, newPassword) => API.post(`/employees/${id}/reset-password`, { newPassword });

// Projects
export const addProject = (data) => API.post("/projects", data);
export const getProjects = () => API.get("/projects");
export const getProjectById = (id) => API.get(`/projects/${id}`);
export const deleteProject = (id) => API.delete(`/projects/${id}`);

// Allocations
export const addAllocation = (data) => API.post("/allocations", data);
export const getAllocations = () => API.get("/allocations");
export const deleteAllocation = (id) => API.delete(`/allocations/${id}`);

// BenchHours
export const addBenchHour = (data) => API.post("/benchhours", data);
export const getBenchHours = () => API.get("/benchhours");

// Clients
export const addClient = (data) => API.post("/clients", data);
export const getClients = () => API.get("/clients");

// LeaveRecords
export const addLeaveRecord = (data) => API.post("/leaverecords", data);
export const getLeaveRecords = () => API.get("/leaverecords");

// Holidays
export const addHoliday = (data) => API.post("/holidays", data);
export const getHolidays = () => API.get("/holidays");

// Approvals
export const addApproval = (data) => API.post("/approvals", data);
export const getApprovals = () => API.get("/approvals");
