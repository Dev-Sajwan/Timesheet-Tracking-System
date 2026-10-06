# Development Log

## Backend 
- Addressed AuthController issue where JWT token was not generated.
- JwtBearer authentication plugin setup configured in Program.cs.
- JWT Token with expiration, roles, and claims issued natively on login successful verification.
- Add GetByUserIdAsync to EmployeeRepository.
- Implement React Router for role-based navigation.
- Implement Login component that authenticates against /api/auth/login and decodes the JWT to establish the user role.
- Configure Axios HTTP interceptor to pass the authorization Bearer Token automatically in Api.js.
- Developed Dashboard views customized for Employee, Manager, and Admin roles according to requirements. 
- Fixed AuthController role assignment: Register now assigns 'Employee' role instead of 'User'
- Updated Program.cs: Seed roles as Admin, Manager, Employee and create default admin user (admin@timesheet.com / Admin@123)
- Added approve/reject timesheet endpoint in TimesheetsController: PUT /api/timesheets/approve/{id} with Manager/Admin authorization
- Added ApproveTimesheetDto to EmployeeDto.cs for approve/reject payload
- Updated frontend Api.js and TimesheetForm.js to send approval status (Approved/Rejected) in request body
- Build succeeds with no errors
- Removed Role from EmployeeDto - ASP.NET Core Identity is now the single source of truth for authorization
- Updated EmployeeDto to include Roles (List<string>) and Department properties
- Fixed EmployeeController Update endpoint to use ID instead of email
- Added role management endpoints in EmployeeController (Admin only):
  * GET /api/employees/{id}/roles - Get employee's Identity roles
  * PUT /api/employees/{id}/roles - Assign role (Admin/Manager/Employee)
- Updated MappingProfile to ignore Roles mapping (comes from Identity)
- Updated frontend EmployeeList.js:
  * Displays roles from Identity (Roles array)
  * Role assignment UI for Admin users only
  * Separate role assignment from employee profile updates
  * Uses jwtDecode to check current user's admin status
- Updated Api.js with getEmployeeRoles and assignEmployeeRole functions
- Employee profile updates no longer affect roles
- Build succeeds (file locking from running process only)
- Fixed frontend updateEmployee to only send allowed fields (id, name, email, department, status)
- Removed Roles from update payload to avoid any validation issues
- Backend GET /employees/{id}/roles endpoint exists at line 140-151
- Need to stop running WebAPI process (PID 35324) and rebuild
- Fixed EmployeeController.Create to create Identity user and link via UserId (default password: TempPass123!)
- Added ResetPasswordDto to EmployeeDto.cs
- Added POST /api/employees/{id}/reset-password endpoint (Admin only) to reset employee passwords
- Updated frontend Api.js with resetEmployeePassword function
- Updated EmployeeList.js with Reset Password button for Admin users
- Employee creation now properly links Identity user with Employee record
- Build succeeds
- Removed Register link from Login page (no longer required)
- Removed Bench hours tracking - only Project hours now tracked
- Updated standard weekly project hours to 48 hours
- Added weekly hours summary on Employee Dashboard showing:
  * Standard 48 hrs/week
  * Holiday reduction (8 hrs per weekday holiday)
  * Effective standard hours (48 - holiday reduction)
  * Actual hours logged
  * Regular hours (actual - comp-off)
  * Comp-off hours (hours > 8/day, needs manager approval)
  * Weekly status (Complete/Pending/Short)
- Added holiday list display on Employee Dashboard with impact indicator
- Added comp-off logic: Hours > 8 in a single day flagged as comp-off requiring manager approval
- Updated TimesheetForm.js:
  * Removed Entry Type selector (Project/Bench)
  * Removed Bench hours functionality
  * Added comp-off detection on submit (> 8 hrs = pending with comp-off flag)
  * Description includes comp-off hours for tracking
- Employee Dashboard now shows: Allocations, Weekly Hours Summary, Holiday List, Submit Timesheet, Timesheet History
- Frontend builds successfully with warnings only
- Fixed allocation display in EmployeeDashboard:
  * Added getAllocationsByEmployee API call to fetch allocations directly by employee ID
  * Fixed property names: allocationPercent (not allocationPercentage), allocationId (not id), projectId (not projectId in DTO)
  * Added pagination to all tables in EmployeeDashboard (timesheets, holidays, allocations)
  * Moved TimesheetForm to the top of the dashboard (before weekly summary)
  * Added Pagination helper component
  * Added getAllocationsByEmployee to Api.js
- Fixed AllocationsController route conflicts:
  * GET /api/allocations - Get all
  * GET /api/allocations/employee/{employeeId} - Get allocations by employee
  * GET /api/allocations/{id} - Get by ID
  * POST /api/allocations - Create
  * DELETE /api/allocations/{id} - Delete
- Fixed HolidaysController authorization:
  * GET - All authenticated users
  * POST/DELETE - Admin, Manager only
- Created HolidayList.jsx component with role-based UI
- Added Holiday management tabs to ManagerDashboard and AdminDashboard
- Added deleteHoliday function to Api.js
- Fixed HolidayList.jsx removing duplicate isWeekend function
- EmployeeDto now includes Allocations list
- MappingProfile updated to map Allocations from Employee to EmployeeDto
- GetByUserIdAsync in EmployeeRepository now includes Allocations and Timesheets
- Build succeeds (need to stop VS debugging first for backend build)
- Added GlobalExceptionMiddleware for centralized error handling
- Added [Authorize] attribute to all controllers (class-level)
- Added [AllowAnonymous] to AuthController endpoints (Register, Login, ForgotPassword, ResetPassword)
- Added ILogger to all controllers with structured logging
- Added try-catch blocks to ALL controller actions with proper error responses
- Added detailed logging for all operations (Info, Warning, Error levels)
- Configured global exception middleware in Program.cs
- Added Swagger security definition for Bearer token
- All controllers now return consistent error responses with status codes
- Errors no longer crash the running program - caught and logged gracefully
