using Application.Interfaces;
using Application.Mappings;
using Application.Services;
using Domain.Entities;
using Infrastructure.Persistence;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;

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

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
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

using (var scope = app.Services.CreateScope())
{
    var roleManager = scope.ServiceProvider
        .GetRequiredService<RoleManager<IdentityRole>>();

    string[] roles = { "Admin", "Manager", "Employee" };

    foreach (var role in roles)
    {
        if (!await roleManager.RoleExistsAsync(role))
        {
            await roleManager.CreateAsync(
                new IdentityRole(role));
        }
    }

    // Create default admin user
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
            EmailConfirmed = true
        };
        var result = await userManager.CreateAsync(adminUser, "Admin@123");
        if (result.Succeeded)
        {
            await userManager.AddToRoleAsync(adminUser, "Admin");
            
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
