using KOP.Domain.Enums;

namespace KOP.Application.Interfaces.Services;

public interface IYpodeigmaAuthorizationService
{
    Task EnsureUserIsActiveAsync(
        int userId,
        CancellationToken cancellationToken = default);
    
    Task AuthorizeSubmissionActionAsync(
        int userId,
        int ypodeigmaId,
        int responsibleOrgUnitId,
        SubmissionSaveAction action,
        CancellationToken cancellationToken = default);
}