namespace KOP.Domain.Entities;

public class KatigoriaPtitikouMesou
{
    public int Id { get; set; }

    public string Onomasia { get; set; } = string.Empty;

    public ICollection<TyposPtitikouMesou> TypoiPtitikonMeson { get; set; } = [];
}