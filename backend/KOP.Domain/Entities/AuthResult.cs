namespace KOP.Domain.Entities;

public sealed record AuthResult(bool Succeeded, string? AccessToken, DateTimeOffset? ExpiresAt)
{
    public static AuthResult Success(string accessToken, DateTimeOffset expiresAt)
    {
        return new AuthResult(
            Succeeded: true,
            AccessToken: accessToken,
            ExpiresAt: expiresAt);
    }

    public static AuthResult Failure()
    {
        return new AuthResult(
            Succeeded: false,
            AccessToken: null,
            ExpiresAt: null);
    }
}