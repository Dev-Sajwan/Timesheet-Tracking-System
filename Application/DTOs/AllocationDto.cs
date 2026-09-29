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



}
