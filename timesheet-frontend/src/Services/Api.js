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
export const getMyPermissions = () => API.get("/permissions/my-permissions");
export const getAllPermissions = () => API.get("/permissions/all-permissions");
export const getPermissionSets = () => API.get("/permissions/permission-sets");
export const createPermissionSet = (data) => API.post("/permissions/permission-sets", data);
export const updatePermissionSet = (id, data) => API.put(`/permissions/permission-sets/${id}`, data);
export const deletePermissionSet = (id) => API.delete(`/permissions/permission-sets/${id}`);
export const getRoles = () => API.get("/permissions/roles");
export const assignPermissionSetToRole = (roleId, permissionSetId) => API.post(`/permissions/roles/${roleId}/permission-set/${permissionSetId}`);

// Profiles
export const getProfiles = () => API.get("/profile/profiles");
export const createProfile = (data) => API.post("/profile/profiles", data);
export const updateProfile = (id, data) => API.put(`/profile/profiles/${id}`, data);
export const deleteProfile = (id) => API.delete(`/profile/profiles/${id}`);
export const getUsers = () => API.get("/profile/users");
export const assignProfileToUser = (userId, profileId) => API.put(`/profile/users/${userId}/profile`, { profileId });
export const getUserProfile = (userId) => API.get(`/profile/users/${userId}/profile`);
// export const register = (data) => API.post("/auth/register", data);
export const forgotPassword = (data) => API.post("/auth/forgot-password", data);
export const resetPassword = (data) => API.post("/auth/reset-password", data);

// Timesheets
export const submitTimesheet = (data) => API.post("/timesheets", data);
export const submitBatchTimesheet = (data) => API.post("/timesheets/batch", data);
export const getTimesheetsByEmployee = (employeeId) => API.get(`/timesheets/employee/${employeeId}`);
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
export const updateProject = (id, data) => API.put(`/projects/${id}`, data);
export const deleteProject = (id) => API.delete(`/projects/${id}`);

// Allocations
export const addAllocation = (data) => API.post("/allocations", data);
export const getAllocations = () => API.get("/allocations");
export const getAllocationsByEmployee = (employeeId) => API.get(`/allocations/employee/${employeeId}`);
export const deleteAllocation = (id) => API.delete(`/allocations/${id}`);

// BenchHours
export const addBenchHour = (data) => API.post("/benchhours", data);
export const getBenchHours = () => API.get("/benchhours");

// Clients
export const addClient = (data) => API.post("/clients", data);
export const getClients = () => API.get("/clients");

// Business Units
export const getBusinessUnits = () => API.get("/businessunits");
export const addBusinessUnit = (data) => API.post("/businessunits", data);
export const deleteBusinessUnit = (id) => API.delete(`/businessunits/${id}`);

// LeaveRecords
export const addLeaveRecord = (data) => API.post("/leaverecords", data);
export const getLeaveRecords = () => API.get("/leaverecords");

// Holidays
export const addHoliday = (data) => API.post("/holidays", data);
export const getHolidays = () => API.get("/holidays");
export const deleteHoliday = (id) => API.delete(`/holidays/${id}`);

// Approvals
export const addApproval = (data) => API.post("/approvals", data);
export const getApprovals = () => API.get("/approvals");
