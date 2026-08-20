namespace KOP.Domain.Entities;

public class TyposPtitikouMesouOrgUnit
{
    public int TyposPtitikouMesouId { get; set; }
    public TyposPtitikouMesou TyposPtitikouMesou { get; set; } = null!;
    public int OrgUnitId  { get; set; }
    public OrganizationalUnit OrgUnit { get; set; } = null!;
}