using KOP.Application.Features.YpodeigmaSubmission.Dtos;

namespace KOP.Application.Interfaces.Repositories;

public interface IYpodeigmataRepository
{
    Task<IReadOnlyList<YpodeigmaSubmissionResponse>> GetYpodeigmaEntriesAsync(
        int ypodeigmaId,
        int etosAnaforas,
        List<int> responsibleOrgUnitIds,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyList<StoixeioKostousDto>> GetStoixeiaKostousByStoixeioIdAsync(
        int kyrioStoixeioId,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyList<MonadaDto>> GetSubjectOrgUnitsByYpodeigmaAndRespOrgUnitsAsync(
        int ypodeigmaId,
        List<int> responsibleOrgUnitsIds,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyList<int>> GetKatagegrammenaEtiYpodeigmatosAsync(
        int ypodeigmaId,
        List<int> responsibleOrgUnitsIds,
        CancellationToken cancellationToken = default);

    Task<bool> IsYpodeigmaValidAsync(
        int ypodeigmaId,
        CancellationToken cancellationToken);
    
    Task<YpodeigmaSubmissionRequestResult> SaveAsync(
        int userId,
        YpodeigmaSubmissionRequest request,
        CancellationToken cancellationToken = default);

}