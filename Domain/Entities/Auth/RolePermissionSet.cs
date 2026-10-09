using Microsoft.AspNetCore.Identity;

namespace Domain.Entities
{
    public class RolePermissionSet
    {
        public int Id { get; set; }
        public string RoleId { get; set; } = string.Empty;
        public int PermissionSetId { get; set; }

        public PermissionSet PermissionSet { get; set; } = null!;
    }
}
