using KOP.Domain.Enums;

namespace KOP.Domain.Entities;

public class OrganizationalUnit
{
    public int Id { get; set; }
    public int HstrId { get; set; }
    public string Onomasia { get; set; } = string.Empty;
    public UnitType UnitType{ get; set; }
    
    public int? ParentId { get; set; }
    public OrganizationalUnit? Parent { get; set; }
    public ICollection<OrganizationalUnit> Children { get; set; } = [];

    public ICollection<TopothetisiStelexous> TopothetiseisProsopikou { get; set; } = [];
    public ICollection<MiktesApodoxesAnaEtosOrgUnitStoixeioKostous> MiktesApodoxesAnaEtosOrgUnitStoixeioKostous { get; set; } = [];
    public ICollection<TyposPtitikouMesouOrgUnit> TypoiPtitikonMesonOrgUnits { get; set; } = [];
    public ICollection<User> Users { get; set; } = [];
    public ICollection<Submission> Submissions { get; set; } = [];
}