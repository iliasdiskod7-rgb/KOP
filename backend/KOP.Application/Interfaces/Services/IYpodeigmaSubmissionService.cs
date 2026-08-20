using KOP.Application.Features.YpodeigmaSubmission.Dtos;

namespace KOP.Application.Interfaces.Services;

public interface IYpodeigmaSubmissionService
{
    Task<IReadOnlyList<YpodeigmaSubmissionResponse>> GetYpodeigmaEntriesAsync(
        int userId,
        int ypodeigmaId,
        int etosAnaforas,
        List<int> responsibleOrgUnitIds,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyList<int>> GetKatagegrammenaEtiYpodeigmatosAsync(
        int userId,
        int ypodeigmaId,
        List<int> responsibleOrgUnitsIds,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyList<MonadaDto>> GetSubjectOrgUnitsByYpodeigmaAndRespOrgUnitsAsync(
        int userId,
        int ypodeigmaId,
        List<int> responsibleOrgUnitsIds,
        CancellationToken cancellationToken = default);

    Task<YpodeigmaSubmissionRequestResult> ValidateAndSaveSubmissionAndYpodeigmaEntriesAsync(
        int userId,
        YpodeigmaSubmissionRequest request,
        CancellationToken cancellationToken = default);
}