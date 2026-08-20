namespace KOP.Domain.Entities;

public class MiktesApodoxesAnaEtosOrgUnitStoixeioKostous
{
    public int EtosAnaforas { get; set; }
    public int OrgUnitId { get; set; }
    public OrganizationalUnit OrgUnit { get; set; } = null!;
    public int StoixeioKostousId { get; set; }
    public StoixeioKostous StoixeioKostous { get; set; } = null!;
    public decimal Value { get; set; }
}