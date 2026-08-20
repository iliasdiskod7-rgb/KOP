namespace KOP.Domain.Entities;

public class TopothetisiStelexous
{
    public int Id { get; set; }
    
    public int PebadaId { get; set; }

    public string Rank { get; set; } = string.Empty;
    public string Eidik { get; set; } = string.Empty;
    public string Onoma { get; set; } = string.Empty;
    public string Eponymo { get; set; } = string.Empty;
    public string Ama { get; set; } = string.Empty;

    public int HstrId { get; set; }
    public string HstrTitle { get; set; } = string.Empty;

    public int HstrIdMonadas { get; set; }
    public string HstrTitleMonadas { get; set; } = string.Empty;

    public DateTime DateParousiasisEtous { get; set; }
    public DateTime DateDiagrafisEtous { get; set; }

    public int Imeres { get; set; }

    public bool EinaiApospasi { get; set; } = false;
    public int? ApospasiSe { get; set; }
    public string? ApospasiSeTitle { get; set; }

    public bool ExeiApospaseisStoDiastimaTopothetisis { get; set; } = false;

    public int EtosAnaforas { get; set; }
    public int OrgUnitId { get; set; }
    public OrganizationalUnit OrganizationalUnit { get; set; } = null!;
    public int? StoixeioKostousId { get; set; }
    public StoixeioKostous? StoixeioKostous { get; set; }

    public decimal SynoloMiktonApodoxonStelexousStisImeres { get; set; }
}