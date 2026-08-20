namespace KOP.Infrastructure.Authentication;

public sealed class KopJwtOptions
{
    public const string SectionName = "Jwt";

    public string Issuer { get; init; } = string.Empty;

    public string Audience { get; init; } = string.Empty;

    public string SigningKey { get; init; } = string.Empty;

    public int AccessTokenLifetimeMinutes { get; init; } = 1440; // 1 ημέρα. TODO: Να μειωθεί σε παραγωγή. Ήταν 30min αρχικά.
}