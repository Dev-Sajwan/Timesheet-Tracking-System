namespace Domain.Entities
{
    public class UserPermissionSet
    {
        public string UserId { get; set; } = string.Empty;
        public int PermissionSetId { get; set; }
        public DateTime AssignedAt { get; set; }
        public string AssignedBy { get; set; } = string.Empty;

        public ApplicationUser User { get; set; } = null!;
        public PermissionSet PermissionSet { get; set; } = null!;
    }
}
