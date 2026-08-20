using KOP.Application.Interfaces.Repositories;
using KOP.Application.Interfaces.Services;
using KOP.Domain.Common.Exceptions;
using KOP.Domain.Enums;

namespace KOP.Application.Features.YpodeigmaSubmission.Services;

public sealed class YpodeigmaAuthorizationService(IUsersRepository usersRepository) : IYpodeigmaAuthorizationService
{
    public async Task EnsureUserIsActiveAsync(int userId, CancellationToken cancellationToken = default)
    {
        var isActive = await usersRepository.IsActiveAsync(userId, cancellationToken);

        if (!isActive)
        {
            throw new UnauthorizedException("[HAF0004] Δεν βρέθηκε ενεργός χρήστης.");
        }
    }

    public async Task AuthorizeSubmissionActionAsync(int userId, int ypodeigmaId, int responsibleOrgUnitId, SubmissionSaveAction action, CancellationToken cancellationToken = default)
    {
        var isAuthorized = await usersRepository.CanPerformSubmissionActionAsync(userId, ypodeigmaId, responsibleOrgUnitId, action, cancellationToken);

        if (!isAuthorized)
        {
            throw new ForbiddenException("[HAF0035] Δεν έχετε το απαιτούμενο δικαίωμα για τη συγκεκριμένη ενέργεια.");
        }
    }
}