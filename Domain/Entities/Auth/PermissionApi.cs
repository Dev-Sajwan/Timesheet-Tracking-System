namespace Domain.Entities
{
    public class PermissionApi
    {
        public int PermissionId { get; set; }
        public int ApiId { get; set; }

        public Permission Permission { get; set; } = null!;
        public Api Api { get; set; } = null!;
    }
}