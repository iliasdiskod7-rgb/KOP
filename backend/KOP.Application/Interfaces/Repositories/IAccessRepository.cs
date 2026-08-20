using KOP.Application.Features.App.Dtos;

namespace KOP.Application.Interfaces.Repositories;

public interface IAccessRepository
{
    Task<IReadOnlyList<AllowedYpodeigmaDto>> GetPermissionsOnYpodeigmataByUserIdAsync(int userId, CancellationToken cancellationToken);
}