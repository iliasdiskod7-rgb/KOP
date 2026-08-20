using System.Globalization;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

namespace KOP.Api.Extensions;

public static class ClaimsPrincipalExtensions
{
    public static int GetUserId(this ClaimsPrincipal user)
    {
        var userIdValue =
            user.FindFirstValue(JwtRegisteredClaimNames.Sub)
            ?? user.FindFirstValue(ClaimTypes.NameIdentifier);

        if (string.IsNullOrWhiteSpace(userIdValue))
        {
            throw new UnauthorizedAccessException("Το token δεν περιέχει user id.");
        }

        if (!int.TryParse(
                userIdValue,
                NumberStyles.Integer,
                CultureInfo.InvariantCulture,
                out var userId))
        {
            throw new UnauthorizedAccessException("Το user id του token δεν είναι έγκυρο.");
        }

        if (userId <= 0)
        {
            throw new UnauthorizedAccessException("Το user id δεν είναι έγκυρο.");
        }

        return userId;
    }
}