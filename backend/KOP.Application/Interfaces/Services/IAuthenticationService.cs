using KOP.Domain.Entities;

namespace KOP.Application.Interfaces.Services;

public interface IAuthenticationService
{
    Task<AuthResult> LoginAsync(
        LoginCommand request,
        CancellationToken cancellationToken);
}