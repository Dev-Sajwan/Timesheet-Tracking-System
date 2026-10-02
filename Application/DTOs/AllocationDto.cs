namespace Application.DTOs
{
    public class AllocationDto
    {

        public int AllocationId { get; set; }
        public string? EmployeeId { get; set; }
        public int ProjectId { get; set; }
        public int AllocationPercent { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime? EndDate { get; set; }
    }
    public class RegisterRequestDto
    {
        public string UserName { get; set; }
        public string Email { get; set; }
        public string Password { get; set; }
    }

     public class LoginRequestDto
     {
         public string UserName { get; set; }
         public string Password { get; set; }
     }

     public class AssignRoleRequestDto
     {
        public string UserId { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
    }
 }



