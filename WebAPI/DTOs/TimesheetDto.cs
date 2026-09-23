namespace WebAPI.DTOs
{
    public class TimesheetDto
    {
        public int EmployeeId { get; set; }
        public int ProjectId { get; set; }
        public DateTime Date { get; set; }
        public int HoursWorked { get; set; }
        public string SubmissionType { get; set; } = "Daily"; // or Weekly
        public string ApprovalStatus { get; set; } = "Pending";
    }


}
