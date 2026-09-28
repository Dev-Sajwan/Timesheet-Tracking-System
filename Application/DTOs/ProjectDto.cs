namespace Application.DTOs
{
    public class ProjectDto
    {
        public int ClientId { get; set; }
        public int ProjectId { get; set; }
        public string ProjectName { get; set; } = "";
        public DateTime StartDate { get; set; }
        public DateTime? EndDate { get; set; }
    }


}
