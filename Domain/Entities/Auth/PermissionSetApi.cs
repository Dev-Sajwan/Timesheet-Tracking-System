namespace Domain.Entities
{
    public class PermissionSetApi
    {
        public int PermissionSetId { get; set; }
        public int ApiId { get; set; }

        public PermissionSet PermissionSet { get; set; } = null!;
        public Api Api { get; set; } = null!;
    }
}
