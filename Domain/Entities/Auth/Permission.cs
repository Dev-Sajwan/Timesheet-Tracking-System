namespace Domain.Entities
{
    public class Permission
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public bool IsSensitive { get; set; }

        public ICollection<PermissionApi> PermissionApis { get; set; } = new List<PermissionApi>();
        public ICollection<PermissionSetPermission> PermissionSetPermissions { get; set; } = new List<PermissionSetPermission>();
        public ICollection<UserPermission> UserPermissions { get; set; } = new List<UserPermission>();
    }
}