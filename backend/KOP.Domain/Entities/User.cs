using System.ComponentModel.DataAnnotations.Schema;

namespace KOP.Domain.Entities;

public class User
{
    public int Id { get; set; }
    public int ExternalId { get; set; } // PebadaId
    
    public string Vathmos { get; set; } = string.Empty;
    public string Eidikotita { get; set; } = string.Empty;
    public string Onoma { get; set; } = string.Empty;
    public string Eponymo { get; set; } = string.Empty;
    public string AMA { get; set; } = string.Empty;
    public string Epistasia { get; set; } = string.Empty;
    public string? PhoneNumber { get; set; } = string.Empty;
    
    public bool IsActive { get; set; }

    public int OrgUnitId { get; set; }
    public OrganizationalUnit OrgUnit { get; set; } = null!;

    public ICollection<Submission> CreatedSubmissions { get; set; } = [];
    public ICollection<Submission> UpdatedSubmissions { get; set; } = [];
    public ICollection<UserRole> UserRoles { get; set; } = [];
    public ICollection<AccessGrant> ReceivedAccessGrants { get; set; } = [];
    public ICollection<AccessGrant> InsertedAccessGrants { get; set; } = [];

    [NotMapped]
    public string FullName => $"{Vathmos} ({Eidikotita}) {Onoma} {Eponymo} ({AMA})";
}