namespace KOP.Domain.Entities;

public class Stelexos
{
    public int PebadaId { get; set; }
    public string Rank { get; set; } = string.Empty;
    public string Eidik { get; set; } = string.Empty;
    public string Onoma { get; set; } = string.Empty;
    public string Eponymo { get; set; } = string.Empty;
    public string Ama { get; set; } = string.Empty;

    public ICollection<StelexosTopothetisi> Topothetiseis { get; set; } = [];
}