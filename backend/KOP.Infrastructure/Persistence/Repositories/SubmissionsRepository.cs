using KOP.Application.Interfaces.Repositories;
using KOP.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace KOP.Infrastructure.Persistence.Repositories;

public sealed class SubmissionsRepository(KOPDbContext _db) : ISubmissionsRepository
{
    public Task<int> GetSubmissionsCountByOrgUnitsAndStatusAsync(IReadOnlyCollection<int> responsibleOrgUnitIds, SubmissionStatus status, CancellationToken cancellationToken = default)
    {
        return _db.Submissions
            .CountAsync(x => 
                responsibleOrgUnitIds.Contains(x.ResponsibleOrgUnitId) &&
                x.CurrentStatus == status, 
                cancellationToken);
    }

    public Task<bool> ExistsForYpodeigmaYearAndResponsibleOrgUnitAsync(int etosAnaforas, int ypodeigmaId, int responsibleOrgUnitId, CancellationToken cancellationToken = default)
    {
        return _db.Submissions
            .AnyAsync(s => 
                s.YpodeigmaId == ypodeigmaId &&
                s.EtosAnaforas == etosAnaforas &&
                s.ResponsibleOrgUnitId == responsibleOrgUnitId,
                cancellationToken);
    }
    
    public Task<bool> IsSubmissionContextValidAsync(int submissionId, int etosAnaforas, int ypodeigmaId, int responsibleOrgUnitId, CancellationToken cancellationToken = default)
    {
        return _db.Submissions
            .AnyAsync(s => 
                s.Id == submissionId &&
                s.YpodeigmaId == ypodeigmaId &&
                s.EtosAnaforas == etosAnaforas &&
                s.ResponsibleOrgUnitId == responsibleOrgUnitId,
                cancellationToken);
    }

    public Task<bool> IsSubmissionEditableAsync(int submissionId, CancellationToken cancellationToken = default)
    {
        return _db.Submissions
            .AnyAsync(s => 
                s.Id == submissionId &&
                (s.CurrentStatus == SubmissionStatus.Draft || s.CurrentStatus == SubmissionStatus.ReturnedForCorrection), 
                cancellationToken);
    }

}