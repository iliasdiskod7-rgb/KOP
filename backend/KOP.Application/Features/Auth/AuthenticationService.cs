using KOP.Application.Interfaces;
using KOP.Application.Interfaces.Services;
using KOP.Domain.Entities;

namespace KOP.Application.Features.Auth;

public sealed class AuthenticationService(
    IUserCredentialValidator userCredentialValidator,
    IJwtTokenBuilder jwtTokenBuilder) : IAuthenticationService
{
    public async Task<AuthResult> LoginAsync(
        LoginCommand command,
        CancellationToken cancellationToken)
    {
        var user = await userCredentialValidator.ValidateAsync(
            command.Username,
            command.Password,
            cancellationToken);

        if (user is null)
            return AuthResult.Failure();

        var token = jwtTokenBuilder.BuildToken(user.UserId);

        return AuthResult.Success(
            token.AccessToken,
            token.ExpiresAt);
    }
}