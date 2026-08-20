namespace KOP.Domain.Entities;

public class KyrioStoixeio
{
    public int Id { get; set; }
    public string Onomasia { get; set; } = string.Empty;
    public string? Perigrafi { get; set; } = string.Empty;

    public ICollection<StoixeioKostous> StoixeiaKostous { get; set; } = [];
    public ICollection<Ypodeigma> Ypodeigmata { get; set; } = [];
}