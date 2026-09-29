namespace Application.DTOs
{
    public class EmployeeDto
    {
        public string? Id { get; set; }
        public string Name { get; set; } = "";
        public string Email { get; set; } = "";
        public string Role { get; set; } = "";
        public string Status { get; set; } = "";
    }

    public class CreateUserRequestDto
    {
        public string EmployeeId { get; set; }   // Link to employee
        public string UserName { get; set; }
        public string Email { get; set; }
        public string Password { get; set; }
    }

    public class LoginRequest
    {
        public string UserName { get; set; }
        public string Password { get; set; }
    }

    public class AssignRoleRequest
    {
        public string EmployeeId { get; set; }
        public string RoleName { get; set; }
    }

}
