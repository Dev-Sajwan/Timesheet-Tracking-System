namespace Domain.Entities
{
    public class PermissionSetPermission
    {
        public int PermissionSetId { get; set; }
        public int PermissionId { get; set; }

        public PermissionSet PermissionSet { get; set; } = null!;
        public Permission Permission { get; set; } = null!;
    }
}