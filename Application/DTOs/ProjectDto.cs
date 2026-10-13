using System.ComponentModel.DataAnnotations;

namespace Application.DTOs
{
    public class ProjectDto
    {
        [Required(ErrorMessage = "Project name is required.")]
        public int ProjectId { get; set; }
        [Required(ErrorMessage = "Client is required.")]
        public int ClientId { get; set; }
        public int? BusinessUnitId { get; set; }
        public string ProjectName { get; set; } = "";
        [Required(ErrorMessage = "Start date is required.")]
        public DateTime StartDate { get; set; }
        public DateTime? EndDate { get; set; }
    }


}
