namespace KOP.Domain.Entities;

public class ValueForAleOdoiporikon
{
    public int Id { get; set; }

    public int EntryId { get; set; }
    public YpodeigmaEntry Entry { get; set; } = null!;

    public int AleId { get; set; }
    public Ale Ale { get; set; } = null!;

    public decimal Value { get; set; }
}