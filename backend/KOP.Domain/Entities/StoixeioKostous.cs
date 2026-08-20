namespace KOP.Domain.Entities;

public class StoixeioKostous
{
    public int Id { get; set; }
    public string Kodikos { get; set; } = string.Empty;
    public int EpipedoAnalysis { get; set; }
    public string Onomasia { get; set; } = string.Empty;
    public bool EinaiXamiloteroEpipedo { get; set; } = false;

    public int KyrioStoixeioId { get; set; }
    public KyrioStoixeio KyrioStoixeio { get; set; } = null!;

    public ICollection<TopothetisiStelexous> TopothetiseisProsopikou { get; set; } = [];
    public ICollection<MiktesApodoxesAnaEtosOrgUnitStoixeioKostous> MiktesApodoxesAnaEtosOrgUnitStoixeioKostous { get; set; } = [];
}