namespace KOP.Domain.Entities;

public sealed record AccessTokenResult(
    string AccessToken,
    DateTimeOffset ExpiresAt
);