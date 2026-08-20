namespace KOP.Domain.Entities;

public class TyposPtitikouMesou
{
    public int Id { get; set; }

    public string Onomasia { get; set; } = string.Empty;

    public int KatigoriaPtitikouMesouId { get; set; }

    public KatigoriaPtitikouMesou KatigoriaPtitikouMesou { get; set; } = null!;

    public ICollection<TyposPtitikouMesouOrgUnit> TypoiPtitikonMesonOrgUnits { get; set; } = [];
}