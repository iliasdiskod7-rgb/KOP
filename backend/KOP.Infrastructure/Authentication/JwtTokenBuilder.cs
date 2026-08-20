using System.Globalization;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using KOP.Application.Interfaces;
using KOP.Domain.Entities;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

namespace KOP.Infrastructure.Authentication;

public sealed class JwtTokenBuilder(
    IOptions<KopJwtOptions> options,
    TimeProvider timeProvider) : IJwtTokenBuilder
{
    private readonly KopJwtOptions _options = options.Value;

    public AccessTokenResult BuildToken(int userId)
    {
        var now = timeProvider.GetUtcNow();

        var expiresAt = now.AddMinutes(
            _options.AccessTokenLifetimeMinutes);

        var signingKey = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(_options.SigningKey));

        var signingCredentials = new SigningCredentials(
            signingKey,
            SecurityAlgorithms.HmacSha256);

        var claims = new List<Claim>
        {
            // Μοναδικό ID χρήστη.
            new(JwtRegisteredClaimNames.Sub, userId.ToString("D")),

            // Μοναδικό ID token.
            new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString("N")),

            // Χρόνος έκδοσης του token.
            new(JwtRegisteredClaimNames.Iat,                                       
                now.ToUnixTimeSeconds().ToString(CultureInfo.InvariantCulture),
                ClaimValueTypes.Integer64)
        };

        var jwt = new JwtSecurityToken(
            issuer: _options.Issuer,
            audience: _options.Audience,
            claims: claims,
            notBefore: now.UtcDateTime,
            expires: expiresAt.UtcDateTime,
            signingCredentials: signingCredentials);

        var accessToken = new JwtSecurityTokenHandler()
            .WriteToken(jwt);

        return new AccessTokenResult(
            AccessToken: accessToken,
            ExpiresAt: expiresAt);
    }
}