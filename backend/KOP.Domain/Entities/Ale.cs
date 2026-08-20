using KOP.Domain.Enums;

namespace KOP.Domain.Entities;

public sealed class Ale
{
    public int Id { get; set; }

    public string Kodikos { get; set; } = string.Empty;

    public string Perigrafi { get; set; } = string.Empty;

    public AleCategory Katigoria { get; set; }
}