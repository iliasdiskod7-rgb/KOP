using KOP.Application.Features.YpodeigmaSubmission.Dtos;

namespace KOP.Application.Interfaces.Repositories;

public interface IOrganizationalUnitsRepository
{
    Task<bool> IsMonadaOrgUnitScopeValidAsync(
        int ypodeigmaId,
        int responsibleOrgUnitId,
        IReadOnlyCollection<int> subjectOrgUnitIds,
        CancellationToken cancellationToken = default);

    Task<bool> IsMonadaMoiraHierarchyValidAsync(
        IReadOnlyCollection<MonadaMoiraPair> pairs,
        CancellationToken cancellationToken);

    Task<bool> IsResponsibleOrgUnitValidAsync(
        int responsibleOrgUnitId,
        CancellationToken cancellationToken);
}