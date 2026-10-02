# Employee Timesheet and Bench Hours Management System

## 1. Project Overview & Objectives
The goal of this project is to provide a robust system for tracking employee timesheets, project allocations, and bench hours. It enables calculating effective weekly hours considering time off (like leaves and holidays). Multiple roles interact with the system matching a multi-tier authorization structure: Employees (submission), Managers (review and supervise), and Admins (system oversight).

## 2. Technology Stack
- **Backend**: ASP.NET Core 9 Minimal API / Web API (C#).
- **Database Core**: Entity Framework Core with SQL Server.
- **Identity Framework**: Microsoft ASP.NET Core Identity for Role-Based Access Control (RBAC). 
- **Frontend**: React hooks and React Router, Axios for Backend connectivity, and JWT for Auth session state management.

## 3. Database Design
- **ApplicationUser** extended from IdentityUser bridging the authentication and domain entities.
- **Employee**: Represents the staff, storing department, linked via UserId to ApplicationUser.
- **Project & Allocation**: Defines work boundaries limit to percentage allocations.
- **Timesheet**: Submitted periodically associating with Employee and Project or directly logged into BenchHour.
- **LeaveRecord & Holiday**: Utilized for accurately filtering required available hours.

## 4. API Endpoints
All protected endpoints expect a \Bearer <JWT-Token>\ inside the \Authorization\ Header.
- **Auth**: \/api/auth/register\, \/api/auth/login\, \/api/auth/assign-role\ 
- **Employees**: \/api/employees\ (GET, POST, PUT, DELETE)
- **Projects & Allocations**: \/api/projects\, \/api/allocations\
- **Timesheets**: \/api/timesheets\ (POST for submit, PUT for approve)
- **Leave & Holidays**: \/api/leaverecords\, \/api/holidays\

## 5. Security & Authentication Model
- **Token**: Json Web Token (JWT) issued locally containing User ID, FullName, assigned Role(s), generated via ASP.NET Identity pipeline and JWT Bearer extensions.
- **Frontend Interceptor**: Using \xios.interceptors.request\, the JWT token extracted from \localStorage\ is automatically embedded onto every outgoing network call preventing 401 exceptions.

## 6. Frontend Roles & Routing
1. **Employee Dashboard** (\/employee\): Loads personalized allocations, submit timesheets to specific projects / bench, and view prior submission status histories.
2. **Manager Dashboard** (\/manager\): Overview of all employees, allocations summary, and tools for reviewing/approving timesheet entries.
3. **Admin Dashboard** (\/admin\): Broad access encompassing everything from the previous Dashboards with added full CRUD interfaces for managing projects / employees directly.

## 7. Working Hours Logic
* **Standard week**: 40 hours (8 hours/day - M-F).
* **Leaves and Holidays**: Deduct 8 hours for each weekday affected.
* **Bench**: Time not allocated to an active Project is recorded as Bench Hours keeping hour consistency.

## 8. Run Instructions
1. Run backend using \dotnet run\ inside \WebAPI\ directory. Wait until hosted on \localhost:5162\.
2. Inside \	imesheet-frontend\, run \
pm start\ connecting against the launched API proxy.
