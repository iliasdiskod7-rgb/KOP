using KOP.Application.Features.App.Dtos;
using KOP.Domain.Enums;

namespace KOP.Application.Interfaces.Repositories;

public interface IUsersRepository
{
    Task<CurrentUserDto> GetUserInfoAsync(int userId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Role>> GetUserRolesAsync(int userId, CancellationToken cancellationToken = default);
    Task<bool> IsActiveAsync (int userId, CancellationToken cancellationToken = default);
    Task<bool> CanAccessYpodeigmaAsync(int userId, int ypodeigmaId, List<int> responsibleOrgUnitsIds, CancellationToken cancellationToken);
    Task<bool> CanPerformSubmissionActionAsync(int userId, int ypodeigmaId, int responsibleOrgUnitId, SubmissionSaveAction action, CancellationToken cancellationToken);
}