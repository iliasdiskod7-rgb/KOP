using KOP.Application.Features.YpodeigmaSubmission.Dtos;
using KOP.Application.Interfaces.Repositories;
using KOP.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace KOP.Infrastructure.Persistence.Repositories;

public sealed class OrganizationalUnitsRepository(KOPDbContext _db) : IOrganizationalUnitsRepository
{
    public async Task<bool> IsMonadaOrgUnitScopeValidAsync(int ypodeigmaId, int responsibleOrgUnitId, IReadOnlyCollection<int> subjectOrgUnitIds, CancellationToken cancellationToken = default)
    {
        var requestedIds = subjectOrgUnitIds.Distinct().ToList();

        if (requestedIds.Count == 0)
            return false;

        var validCount = await (
            from scope in _db.YpodeigmaSubmissionScopes
            join orgUnit in _db.OrganizationalUnits
                on scope.SubjectOrgUnitId equals orgUnit.Id
            where
                scope.YpodeigmaId == ypodeigmaId &&
                scope.ResponsibleOrgUnitId == responsibleOrgUnitId &&
                requestedIds.Contains(scope.SubjectOrgUnitId) &&
                orgUnit.UnitType == UnitType.Monada
            select scope.SubjectOrgUnitId
        )
        .Distinct()
        .CountAsync(cancellationToken);

        return validCount == requestedIds.Count;
    }

    public async Task<bool> IsMonadaMoiraHierarchyValidAsync(IReadOnlyCollection<MonadaMoiraPair> pairs, CancellationToken cancellationToken)
    {
        if (pairs.Count == 0)
            return true;

        var moiraIds = pairs
            .Select(x => x.MoiraOrgUnitId)
            .Distinct()
            .ToList();
        
        var moiresFromDb = await _db.OrganizationalUnits
            .Where(x =>
                moiraIds.Contains(x.Id) &&
                x.UnitType == UnitType.MoiraPtitikouMesou)
            .Select(x => new
            {
                x.Id,
                x.ParentId
            })
            .ToListAsync(cancellationToken);

        var parentByMoiraId  = moiresFromDb.ToDictionary(
            x => x.Id,
            x => x.ParentId);

        return pairs.All(pair =>
            parentByMoiraId.TryGetValue(pair.MoiraOrgUnitId, out var parentId) &&
            parentId == pair.MonadaOrgUnitId);
    }

    public Task<bool> IsResponsibleOrgUnitValidAsync(int responsibleOrgUnitId, CancellationToken cancellationToken)
    {
        return _db.OrganizationalUnits.AnyAsync(x =>
            x.Id == responsibleOrgUnitId &&
            (x.UnitType == UnitType.Epiteleio ||
            x.UnitType == UnitType.Monada),
            cancellationToken);
    }
    
}