namespace Application.DTOs
{
    public class ApprovalDto
    {
        public int ApprovalId { get; set; }
        public int TimesheetId { get; set; }
        public string ApprovedBy { get; set; } = "";
        public DateTime ApprovalDate { get; set; }
        public string ApprovalType { get; set; } = "Manual"; // or Auto
    }


}
