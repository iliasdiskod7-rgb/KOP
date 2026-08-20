using KOP.Application.Features.YpodeigmaSubmission.Dtos;
using KOP.Application.Interfaces.Repositories;
using KOP.Application.Interfaces.Services;
using KOP.Domain.Common.Exceptions;

namespace KOP.Application.Features.YpodeigmaSubmission.Services;

public sealed class YpodeigmaSubmissionService(
    IUsersRepository usersRepository,
    IYpodeigmataRepository ypodeigmataRepository,   
    IYpodeigmaSubmissionValidationService validationService,
    IYpodeigmaAuthorizationService authorizationService) : IYpodeigmaSubmissionService
{
    public async Task<IReadOnlyList<YpodeigmaSubmissionResponse>> GetYpodeigmaEntriesAsync(int userId, int ypodeigmaId, int etosAnaforas, List<int> responsibleOrgUnitIds, CancellationToken cancellationToken = default)
    {
        // Έλεγχος ότι ο χρήστης υπάρχει και είναι ενεργός.
        if (!await usersRepository.IsActiveAsync(userId, cancellationToken))
            throw new UnauthorizedException("[HAF0004] Δεν βρέθηκε ενεργός χρήστης.");

        // Έλεγχος ότι ο χρήστης έχει πρόσβαση στο συγκεκριμένο υπόδειγμα και για τα συγκεκριμένα responsibleOrgUnitsIds.
        if (!await usersRepository.CanAccessYpodeigmaAsync(userId, ypodeigmaId, responsibleOrgUnitIds, cancellationToken))
            throw new ForbiddenException("[HAF0005] Δεν έχετε δικαίωμα πρόσβασης στο συγκεκριμένο υπόδειγμα.");

        return await ypodeigmataRepository.GetYpodeigmaEntriesAsync(ypodeigmaId, etosAnaforas, responsibleOrgUnitIds, cancellationToken);
    }

    public async Task<IReadOnlyList<int>> GetKatagegrammenaEtiYpodeigmatosAsync(int userId, int ypodeigmaId, List<int> responsibleOrgUnitsIds, CancellationToken cancellationToken = default)
    {
        // Έλεγχος ότι ο χρήστης υπάρχει και είναι ενεργός.
        if (!await usersRepository.IsActiveAsync(userId, cancellationToken))
            throw new UnauthorizedException("[HAF0004] Δεν βρέθηκε ενεργός χρήστης.");

        // Έλεγχος ότι ο χρήστης έχει πρόσβαση στο συγκεκριμένο υπόδειγμα και για τα συγκεκριμένα responsibleOrgUnitsIds.
        if (!await usersRepository.CanAccessYpodeigmaAsync(userId, ypodeigmaId, responsibleOrgUnitsIds, cancellationToken))
            throw new ForbiddenException("[HAF0005] Δεν έχετε δικαίωμα πρόσβασης στο συγκεκριμένο υπόδειγμα.");

        return await ypodeigmataRepository.GetKatagegrammenaEtiYpodeigmatosAsync(ypodeigmaId, responsibleOrgUnitsIds, cancellationToken);
    }

    public async Task<IReadOnlyList<MonadaDto>> GetSubjectOrgUnitsByYpodeigmaAndRespOrgUnitsAsync(int userId, int ypodeigmaId, List<int> responsibleOrgUnitsIds, CancellationToken cancellationToken = default)
    {
        // Έλεγχος ότι ο χρήστης υπάρχει και είναι ενεργός.
        if (!await usersRepository.IsActiveAsync(userId, cancellationToken))
            throw new UnauthorizedException("[HAF0004] Δεν βρέθηκε ενεργός χρήστης.");

        // Έλεγχος ότι ο χρήστης έχει πρόσβαση στο συγκεκριμένο υπόδειγμα και για τα συγκεκριμένα responsibleOrgUnitsIds.
        if (!await usersRepository.CanAccessYpodeigmaAsync(userId, ypodeigmaId, responsibleOrgUnitsIds, cancellationToken))
            throw new ForbiddenException("[HAF0005] Δεν έχετε δικαίωμα πρόσβασης στο συγκεκριμένο υπόδειγμα.");

        return await ypodeigmataRepository.GetSubjectOrgUnitsByYpodeigmaAndRespOrgUnitsAsync(ypodeigmaId, responsibleOrgUnitsIds, cancellationToken);
    }

    public async Task<YpodeigmaSubmissionRequestResult> ValidateAndSaveSubmissionAndYpodeigmaEntriesAsync(int userId, YpodeigmaSubmissionRequest request, CancellationToken cancellationToken = default)
    {
        await authorizationService.EnsureUserIsActiveAsync(userId, cancellationToken);

        await validationService.ValidateForSaveAsync(request, cancellationToken);

        await authorizationService.AuthorizeSubmissionActionAsync( userId, request.YpodeigmaId, request.ResponsibleOrgUnitId, request.Action, cancellationToken);

        // Save
        return await ypodeigmataRepository.SaveAsync(userId, request, cancellationToken);
    }
}