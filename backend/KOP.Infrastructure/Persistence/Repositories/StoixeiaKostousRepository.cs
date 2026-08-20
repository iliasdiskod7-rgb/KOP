using KOP.Application.Interfaces.Repositories;
using Microsoft.EntityFrameworkCore;

namespace KOP.Infrastructure.Persistence.Repositories;

public sealed class StoixeiaKostousRepository(KOPDbContext _db) : IStoixeiaKostousRepository
{
    public async Task<bool> AreStoixeiaKostousValidAsync(int ypodeigmaId, IReadOnlyCollection<int> stoixeiaKostousIds, CancellationToken cancellationToken)
    {
        var requestedIds = stoixeiaKostousIds
            .Distinct()
            .ToList();

        if (requestedIds.Count == 0)
            return false;

        var validCount = await (
            from stoixeio in _db.StoixeiaKostous
            join ypodeigma in _db.Ypodeigmata
                on stoixeio.KyrioStoixeioId
                equals ypodeigma.KyrioStoixeioId
            where
                ypodeigma.Id == ypodeigmaId &&
                requestedIds.Contains(stoixeio.Id) &&
                stoixeio.EinaiXamiloteroEpipedo
            select stoixeio.Id
        )
        .Distinct()
        .CountAsync(cancellationToken);

        return validCount == requestedIds.Count;
    }
}