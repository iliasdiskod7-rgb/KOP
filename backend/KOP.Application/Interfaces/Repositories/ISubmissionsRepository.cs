using KOP.Domain.Enums;

namespace KOP.Application.Interfaces.Repositories;

public interface ISubmissionsRepository
{
    Task<int> GetSubmissionsCountByOrgUnitsAndStatusAsync(
        IReadOnlyCollection<int> responsibleOrgUnitIds,
        SubmissionStatus status,
        CancellationToken cancellationToken = default);

    Task<bool> ExistsForYpodeigmaYearAndResponsibleOrgUnitAsync(
        int etosAnaforas,
        int ypodeigmaId,
        int responsibleOrgUnitId,
        CancellationToken cancellationToken = default);

    Task<bool> IsSubmissionContextValidAsync(
        int submissionId,
        int etosAnaforas,
        int ypodeigmaId,
        int responsibleOrgUnitId,
        CancellationToken cancellationToken = default);

    Task<bool> IsSubmissionEditableAsync(
        int submissionId,
        CancellationToken cancellationToken = default);
}