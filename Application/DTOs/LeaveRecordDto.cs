using Domain.Entities;

namespace Application.DTOs
{
    public class LeaveRecordDto
    {
        //public int LeaveRecordId { get; set; }
        public int EmployeeId { get; set; }
        public DateTime Date { get; set; }
        public string LeaveType { get; set; } = "";
        public int Hours { get; set; } = 8;
    }

}
