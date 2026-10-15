namespace Domain.Entities
{
    public class PermissionSet
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public bool IsSystem { get; set; }
        public bool IsAssignable { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }

        public ICollection<PermissionSetApi> PermissionSetApis { get; set; } = new List<PermissionSetApi>();
        public ICollection<PermissionSetPermission> PermissionSetPermissions { get; set; } = new List<PermissionSetPermission>();
        public ICollection<UserPermissionSet> UserPermissionSets { get; set; } = new List<UserPermissionSet>();
    }
}
