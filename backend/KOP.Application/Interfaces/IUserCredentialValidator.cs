using KOP.Domain.Entities;

namespace KOP.Application.Interfaces;

public interface IUserCredentialValidator
{
    Task<AuthenticatedUser?> ValidateAsync(
        string username,
        string password,
        CancellationToken cancellationToken);
}