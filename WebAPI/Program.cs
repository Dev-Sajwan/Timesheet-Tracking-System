using Application.Interfaces;
using Application.Mappings;
using Application.Services;
using Domain.Entities;
using Infrastructure.Persistence;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.Text;
using WebAPI.Middleware;
using Microsoft.Extensions.Logging;

var builder = WebApplication.CreateBuilder(args);

// Ensure appsettings files take priority over any externally injected configuration
//// (e.g., Visual Studio Connected Services / ChainedConfigurationProvider)
builder.Configuration.AddJsonFile("appsettings.json", optional: false, reloadOnChange: true);
builder.Configuration.AddJsonFile($"appsettings.{builder.Environment.EnvironmentName}.json", optional: true, reloadOnChange: true);

// Add services

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

Console.WriteLine("========================================");
Console.WriteLine("DEFAULT CONNECTION STRING:");
Console.WriteLine(connectionString);
Console.WriteLine("========================================");
Console.WriteLine("Content Root: " + builder.Environment.ContentRootPath);

//Console.WriteLine("Environment: " + builder.Environment.EnvironmentName);

builder.Services.AddDbContext<TimesheetDbContext>(options =>
    options.UseSqlServer(connectionString));

builder.Services.AddScoped<ITimesheetDbContext>(provider => provider.GetRequiredService<TimesheetDbContext>());


builder.Services.AddScoped<IEmployeeRepository, EmployeeRepository>();
builder.Services.AddScoped<IClientRepository, ClientRepository>();
builder.Services.AddScoped<IBenchHourRepository, BenchHourRepository>();
builder.Services.AddScoped<IApprovalRepository, ApprovalRepository>();
builder.Services.AddScoped<IAllocationRepository, AllocationRepository>();
builder.Services.AddScoped<IHolidayRepository, HolidayRepository>();
builder.Services.AddScoped<ILeaveRecordRepository, LeaveRecordRepository>();
builder.Services.AddScoped<IProjectRepository, ProjectRepository>();
builder.Services.AddScoped<ITimesheetRepository, TimesheetRepository>();
builder.Services.AddScoped<IPasswordHasher<Employee>, PasswordHasher<Employee>>();


builder.Services.AddScoped<IEmployeeService, EmployeeService>();
builder.Services.AddScoped<IClientService, ClientService>();
builder.Services.AddScoped<IBenchHourService, BenchHourService>();
builder.Services.AddScoped<IApprovalService, ApprovalService>();
builder.Services.AddScoped<IAllocationService, AllocationService>();
builder.Services.AddScoped<IHolidayService, HolidayService>();
builder.Services.AddScoped<ILeaveRecordService, LeaveRecordService>();
builder.Services.AddScoped<IProjectService, ProjectService>();
builder.Services.AddScoped<ITimesheetService, TimesheetService>();
builder.Services.AddScoped<IPermissionService, PermissionService>();


// Register AutoMapper with all profiles in Application.Mappings
//builder.Services.AddAutoMapper(typeof(MappingProfile).Assembly);
builder.Services.AddAutoMapper(cfg =>
{
    cfg.AddProfile<MappingProfile>();
});

foreach (var provider in ((IConfigurationRoot)builder.Configuration).Providers)
{
    Console.WriteLine(provider);
}

builder.Services.AddControllers(options =>
{
    // Add global authorization filter
    options.Filters.Add(new Microsoft.AspNetCore.Mvc.Authorization.AuthorizeFilter());
});
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "Timesheet API", Version = "v1" });
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });
    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Bearer" }
            },
            new string[] {}
        }
    });
});

// Add logging
builder.Logging.ClearProviders();
builder.Logging.AddConsole();
builder.Logging.AddDebug();
builder.Logging.SetMinimumLevel(LogLevel.Information);
builder.Services.AddIdentity<ApplicationUser, IdentityRole>(options =>
{
    options.User.AllowedUserNameCharacters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-._@+";
    options.User.RequireUniqueEmail = true;
})
    .AddEntityFrameworkStores<TimesheetDbContext>()
    .AddDefaultTokenProviders();


builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp",
        policy => policy.WithOrigins("http://localhost:3000")
                        .AllowAnyHeader()
                        .AllowAnyMethod());
});

// Add Authentication
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.SaveToken = true;
    options.RequireHttpsMetadata = false;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidAudience = builder.Configuration["Jwt:ValidAudience"],
        ValidIssuer = builder.Configuration["Jwt:ValidIssuer"],
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Secret"]))
    };
});

var app = builder.Build();

// Add global exception handling middleware (must be first)
app.UseMiddleware<GlobalExceptionMiddleware>();

using (var scope = app.Services.CreateScope())
{
    var _context = scope.ServiceProvider.GetRequiredService<TimesheetDbContext>();
    
    // ========== SEED GRANULAR PERMISSIONS ==========
    if (!_context.Permissions.Any())
    {
        var perms = new List<Permission>
        {
            // Employee permissions
            new Permission { Name = "Employee.View", Description = "Can view employees" },
            new Permission { Name = "Employee.Create", Description = "Can create employees" },
            new Permission { Name = "Employee.Edit", Description = "Can edit employees" },
            new Permission { Name = "Employee.Delete", Description = "Can delete employees" },
            new Permission { Name = "Employee.BulkUpload", Description = "Can bulk upload employees" },
            
            // Project permissions
            new Permission { Name = "Project.View", Description = "Can view projects" },
            new Permission { Name = "Project.Create", Description = "Can create projects" },
            new Permission { Name = "Project.Edit", Description = "Can edit projects" },
            new Permission { Name = "Project.Delete", Description = "Can delete projects" },
            
            // Business Unit permissions
            new Permission { Name = "BusinessUnit.View", Description = "Can view business units" },
            new Permission { Name = "BusinessUnit.Create", Description = "Can create business units" },
            new Permission { Name = "BusinessUnit.Edit", Description = "Can edit business units" },
            new Permission { Name = "BusinessUnit.Delete", Description = "Can delete business units" },
            
            // Allocation permissions
            new Permission { Name = "Allocation.View", Description = "Can view allocations" },
            new Permission { Name = "Allocation.Create", Description = "Can create allocations" },
            new Permission { Name = "Allocation.Edit", Description = "Can edit allocations" },
            new Permission { Name = "Allocation.Delete", Description = "Can delete allocations" },
            
            // Timesheet permissions
            new Permission { Name = "Timesheet.View", Description = "Can view timesheets" },
            new Permission { Name = "Timesheet.Create", Description = "Can create timesheets" },
            new Permission { Name = "Timesheet.Edit", Description = "Can edit timesheets" },
            new Permission { Name = "Timesheet.Delete", Description = "Can delete timesheets" },
            new Permission { Name = "Timesheet.Approve", Description = "Can approve/reject timesheets" },
            new Permission { Name = "Timesheet.WeeklySubmit", Description = "Can submit weekly timesheets" },
            
            // Holiday permissions
            new Permission { Name = "Holiday.View", Description = "Can view holidays" },
            new Permission { Name = "Holiday.Create", Description = "Can create holidays" },
            new Permission { Name = "Holiday.Edit", Description = "Can edit holidays" },
            new Permission { Name = "Holiday.Delete", Description = "Can delete holidays" },
            
            // Leave permissions
            new Permission { Name = "Leave.View", Description = "Can view leave records" },
            new Permission { Name = "Leave.Create", Description = "Can create leave records" },
            new Permission { Name = "Leave.Edit", Description = "Can edit leave records" },
            new Permission { Name = "Leave.Delete", Description = "Can delete leave records" },
            new Permission { Name = "Leave.Approve", Description = "Can approve/reject leave requests" },
            
            // Approval permissions
            new Permission { Name = "Approval.View", Description = "Can view approvals" },
            new Permission { Name = "Approval.Create", Description = "Can create approvals" },
            new Permission { Name = "Approval.Approve", Description = "Can approve/reject" },
            
            // Role/Permission management permissions
            new Permission { Name = "Role.View", Description = "Can view roles" },
            new Permission { Name = "Role.Create", Description = "Can create roles" },
            new Permission { Name = "Role.Edit", Description = "Can edit roles" },
            new Permission { Name = "Role.Delete", Description = "Can delete roles" },
            new Permission { Name = "Permission.View", Description = "Can view permissions" },
            new Permission { Name = "Permission.Create", Description = "Can create permissions" },
            new Permission { Name = "Permission.Edit", Description = "Can edit permissions" },
            new Permission { Name = "Permission.Delete", Description = "Can delete permissions" },
            new Permission { Name = "PermissionSet.View", Description = "Can view permission sets" },
            new Permission { Name = "PermissionSet.Create", Description = "Can create permission sets" },
            new Permission { Name = "PermissionSet.Edit", Description = "Can edit permission sets" },
            new Permission { Name = "PermissionSet.Delete", Description = "Can delete permission sets" },
            new Permission { Name = "PermissionSet.AssignToRole", Description = "Can assign permission sets to roles" },
            
            // Profile permissions
            new Permission { Name = "Profile.View", Description = "Can view profiles" },
            new Permission { Name = "Profile.Create", Description = "Can create profiles" },
            new Permission { Name = "Profile.Edit", Description = "Can edit profiles" },
            new Permission { Name = "Profile.Delete", Description = "Can delete profiles" },
            new Permission { Name = "Profile.AssignToUser", Description = "Can assign profiles to users" },
            
            // Client permissions
            new Permission { Name = "Client.View", Description = "Can view clients" },
            new Permission { Name = "Client.Create", Description = "Can create clients" },
            new Permission { Name = "Client.Edit", Description = "Can edit clients" },
            new Permission { Name = "Client.Delete", Description = "Can delete clients" },
        };
        _context.Permissions.AddRange(perms);
        _context.SaveChanges();
    }

    // ========== SEED PROFILES ==========
    if (!_context.Profiles.Any())
    {
        var profiles = new List<Profile>
        {
            new Profile { Name = "System Administrator", Description = "Full system access with all permissions", IsSystemAdmin = true },
            new Profile { Name = "L1 Manager", Description = "L1 Level - Full access to all modules", IsSystemAdmin = false },
            new Profile { Name = "L2 Manager", Description = "L2 Level - Management access, no permission management", IsSystemAdmin = false },
            new Profile { Name = "L3 Supervisor", Description = "L3 Level - Project/Timesheet management", IsSystemAdmin = false },
            new Profile { Name = "L4 Employee", Description = "L4 Level - Basic timesheet access", IsSystemAdmin = false },
        };
        _context.Profiles.AddRange(profiles);
        _context.SaveChanges();
    }

    // ========== SEED PERMISSION SETS & ASSIGN TO L1-L4 ROLES ==========
    if (!_context.PermissionSets.Any())
    {
        var allPerms = _context.Permissions.ToList();

        // L1 - Full access (System Admin level)
        var l1Set = new PermissionSet { Name = "L1 Full Access", Description = "Full access to all modules" };
        l1Set.Permissions = allPerms;

        // L2 - Management access, no permission/profile management
        var l2Set = new PermissionSet { Name = "L2 Management Access", Description = "Management access without admin functions" };
        l2Set.Permissions = allPerms.Where(p => 
            !p.Name.StartsWith("Permission") && 
            !p.Name.StartsWith("Role") && 
            !p.Name.StartsWith("Profile") &&
            p.Name != "Employee.Delete"
        ).ToList();

        // L3 - Project/Timesheet management
        var l3Set = new PermissionSet { Name = "L3 Supervisor Access", Description = "Project and timesheet management" };
        l3Set.Permissions = allPerms.Where(p => 
            p.Name.StartsWith("Project") ||
            p.Name.StartsWith("BusinessUnit") ||
            p.Name.StartsWith("Allocation") ||
            p.Name.StartsWith("Timesheet") ||
            p.Name.StartsWith("Holiday") ||
            p.Name.StartsWith("Leave") ||
            p.Name.StartsWith("Approval") ||
            p.Name.StartsWith("Client") ||
            p.Name == "Employee.View"
        ).ToList();

        // L4 - Basic timesheet access only
        var l4Set = new PermissionSet { Name = "L4 Employee Access", Description = "Basic timesheet and view access" };
        l4Set.Permissions = allPerms.Where(p => 
            p.Name == "Timesheet.View" ||
            p.Name == "Timesheet.Create" ||
            p.Name == "Timesheet.WeeklySubmit" ||
            p.Name == "Project.View" ||
            p.Name == "Holiday.View" ||
            p.Name == "Leave.View" ||
            p.Name == "Employee.View" ||
            p.Name == "Client.View"
        ).ToList();

        _context.PermissionSets.AddRange(l1Set, l2Set, l3Set, l4Set);
        _context.SaveChanges();

        // Assign permission sets to L1-L4 roles
        var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole>>();
        var rolePermMap = new Dictionary<string, string>
        {
            { "L1", "L1 Full Access" },
            { "L2", "L2 Management Access" },
            { "L3", "L3 Supervisor Access" },
            { "L4", "L4 Employee Access" }
        };

        foreach (var kvp in rolePermMap)
        {
            var role = await roleManager.FindByNameAsync(kvp.Key);
            var permSet = _context.PermissionSets.FirstOrDefault(ps => ps.Name == kvp.Value);
            if (role != null && permSet != null)
            {
                var existing = _context.RolePermissionSets.FirstOrDefault(rps => rps.RoleId == role.Id);
                if (existing == null)
                {
                    _context.RolePermissionSets.Add(new RolePermissionSet { RoleId = role.Id, PermissionSetId = permSet.Id });
                }
                else
                {
                    existing.PermissionSetId = permSet.Id;
                }
            }
        }
        _context.SaveChanges();
    }

    // ========== CREATE L1-L4 ROLES ONLY ==========
    var roleManager2 = scope.ServiceProvider
        .GetRequiredService<RoleManager<IdentityRole>>();

    string[] roles = { "L1", "L2", "L3", "L4" };

    foreach (var role in roles)
    {
        if (!await roleManager2.RoleExistsAsync(role))
        {
            await roleManager2.CreateAsync(
                new IdentityRole(role));
        }
    }

    // ========== CREATE DEFAULT ADMIN USER WITH SYSTEM ADMIN PROFILE ==========
    var userManager = scope.ServiceProvider
        .GetRequiredService<UserManager<ApplicationUser>>();
    
    var adminEmail = "admin@timesheet.com";
    var adminUser = await userManager.FindByEmailAsync(adminEmail);
    if (adminUser == null)
    {
        adminUser = new ApplicationUser
        {
            UserName = "admin",
            Email = adminEmail,
            EmailConfirmed = true,
            FullName = "System Administrator"
        };
        var result = await userManager.CreateAsync(adminUser, "Admin@123");
        if (result.Succeeded)
        {
            await userManager.AddToRoleAsync(adminUser, "L1");
            
            // Assign System Administrator profile
            var sysAdminProfile = _context.Profiles.FirstOrDefault(p => p.IsSystemAdmin);
            if (sysAdminProfile != null)
            {
                adminUser.ProfileId = sysAdminProfile.ProfileId;
                await userManager.UpdateAsync(adminUser);
            }
            
            // Create employee record for admin
            var employeeRepo = scope.ServiceProvider
                .GetRequiredService<IEmployeeRepository>();
            var adminEmployee = new Employee
            {
                Id = Guid.NewGuid().ToString(),
                Name = "System Administrator",
                Email = adminEmail,
                Department = "IT",
                Status = "Active",
                UserId = adminUser.Id
            };
            await employeeRepo.AddAsync(adminEmployee);
        }
    }
}



app.UseCors("AllowReactApp");

// Middleware
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();
