namespace Application.DTOs
{
    public class BenchHourDto
    {
        public int BenchHourId { get; set; }
        public string? EmployeeId { get; set; }
        public DateTime Date { get; set; }
        public int Hours { get; set; }
        
        public string? Description { get; set; }
    }



}
