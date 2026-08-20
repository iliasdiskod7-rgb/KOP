namespace KOP.Application.Features.Prosopiko.Dtos;

public sealed class StelexosTopothetisiDto
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
    public string ApospasiSeTitle { get; set; } = string.Empty;

    public bool ExeiApospaseisStoDiastimaTopothetisis { get; set; } = false;
}