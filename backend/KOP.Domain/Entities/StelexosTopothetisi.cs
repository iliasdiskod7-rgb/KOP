namespace KOP.Domain.Entities;

public class StelexosTopothetisi
{
    public int Id { get; set; }

    public int StelexosPebadaId { get; set; }
    public Stelexos Stelexos { get; set; } = null!;

    public DateTime DateParousiasis { get; set; }
    public DateTime? DateDiagrafis { get; set; }

    public int HstrId { get; set; }
    public string HstrTitle { get; set; } = string.Empty;

    public int HstrIdMonadas { get; set; }
    public string HstrTitleMonadas { get; set; } = string.Empty;

    public bool EinaiApospasi { get; set; } = false;
    public int? ApospasiSe { get; set; }
    public string ApospasiSeTitle { get; set; } = string.Empty;
}