namespace Domain.Entities
{
    public class UserPermission
    {
        public string UserId { get; set; } = string.Empty;
        public int PermissionId { get; set; }
        public DateTime AssignedAt { get; set; }
        public string AssignedBy { get; set; } = string.Empty;

        public ApplicationUser User { get; set; } = null!;
        public Permission Permission { get; set; } = null!;
    }
}