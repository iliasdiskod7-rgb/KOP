using KOP.Application.Features.App.Dtos;
using KOP.Application.Interfaces.Repositories;
using KOP.Application.Interfaces.Services;
using KOP.Domain.Common.Exceptions;
using KOP.Domain.Enums;

namespace KOP.Application.Features.App.Services;

public sealed class AppService(IUsersRepository usersRepository,
                               IAccessRepository accessRepository,
                               ISubmissionsRepository submissionsRepository) : IAppService
{
    public async Task<AppInitResponseDto> GetInitialAppDataAsync(int userId, CancellationToken cancellationToken = default)
    {
        // Έλεγχος ότι ο χρήστης υπάρχει και είναι ενεργός.
        if (!await usersRepository.IsActiveAsync(userId, cancellationToken))
            throw new UnauthorizedException("[HAF0004] Δεν βρέθηκε ενεργός χρήστης.");
        
        CurrentUserDto userInfo = await usersRepository.GetUserInfoAsync(userId, cancellationToken);
        IReadOnlyList<Role> userRoles = await usersRepository.GetUserRolesAsync(userId, cancellationToken);
        
        if (userRoles.Count == 0)
            throw new ForbiddenException("[HAF0006] Δεν σας έχει ανατεθεί κάποιος ρόλος.");
        
        IReadOnlyList<AllowedYpodeigmaDto> allowedYpodeigmata = await accessRepository.GetPermissionsOnYpodeigmataByUserIdAsync(userId, cancellationToken);

        List<int> responsibleOrgUnitIds = allowedYpodeigmata
            .SelectMany(x => x.ResponsibleOrgUnits
                .Where(o => o.CanEdit || o.CanSubmit))
            .Select(i => i.OrgUnitId)
            .Distinct()
            .ToList();

        int submissionsProsYpovoliCount = await submissionsRepository.GetSubmissionsCountByOrgUnitsAndStatusAsync(responsibleOrgUnitIds, SubmissionStatus.Draft, cancellationToken);
        int submissionsApoEpistrofiCount = await submissionsRepository.GetSubmissionsCountByOrgUnitsAndStatusAsync(responsibleOrgUnitIds, SubmissionStatus.ReturnedForCorrection, cancellationToken);
        
        return new AppInitResponseDto
        {
            UserInfo = userInfo,
            UserRoles = userRoles,
            SubmissionsProsYpovoliCount = submissionsProsYpovoliCount,
            SubmissionsApoEpistrofiCount = submissionsApoEpistrofiCount,
            AllowedYpodeigmata = allowedYpodeigmata
        };
    }
}