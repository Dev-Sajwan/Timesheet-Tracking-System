namespace Domain.Entities
{
    public class Api
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Route { get; set; } = string.Empty;
        public string HttpMethod { get; set; } = string.Empty;
        public string Controller { get; set; } = string.Empty;
        public bool IsSensitive { get; set; }

        public ICollection<PermissionSetApi> ApiPermissionSets { get; set; } = new List<PermissionSetApi>();
        public ICollection<PermissionApi> PermissionApis { get; set; } = new List<PermissionApi>();
    }
}
