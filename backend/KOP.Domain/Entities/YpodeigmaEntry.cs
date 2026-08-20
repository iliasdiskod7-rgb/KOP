namespace KOP.Domain.Entities;

public class YpodeigmaEntry
{
    public int Id { get; set; }

    public int SubmissionId { get; set; }
    public Submission Submission { get; set; } = null!;

    public int SubmissionRevisionNo { get; set; }

    public int MonadaOrgUnitId { get; set; }
    public OrganizationalUnit MonadaOrgUnit { get; set; } = null!;

    public int? MoiraOrgUnitId { get; set; }
    public OrganizationalUnit? MoiraOrgUnit { get; set; } = null!;

    public int StoixeioKostousId { get; set; }
    public StoixeioKostous StoixeioKostous { get; set; } = null!;

    public decimal Value { get; set; }

    public string? Comment { get; set; }
}