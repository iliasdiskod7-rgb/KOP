using KOP.Application.Features.App.Dtos;
using KOP.Application.Interfaces.Repositories;
using KOP.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace KOP.Infrastructure.Persistence.Repositories;

public sealed class UsersRepository(KOPDbContext _db) : IUsersRepository
{
    public Task<CurrentUserDto> GetUserInfoAsync(int userId, CancellationToken cancellationToken = default)
    {
        return _db.Users
            .Where(x => x.Id == userId)
            .Select(x => new CurrentUserDto
            {
                UserId = x.Id,
                FullName = x.FullName,
                Epistasia = x.Epistasia,
                OrgUnitId = x.OrgUnitId,
                OrgUnitTitle = x.OrgUnit.Onomasia
            })
            .SingleAsync(cancellationToken);
    }


    public async Task<IReadOnlyList<Role>> GetUserRolesAsync(int userId, CancellationToken cancellationToken = default)
    {
        return await _db.UsersRoles
            .Where(x => x.UserId == userId)
            .Select(x => x.Role)
            .ToListAsync(cancellationToken);
    }


    public Task<bool> IsActiveAsync(int userId, CancellationToken cancellationToken = default)
    {
        return _db.Users.AnyAsync(x => 
            x.Id == userId &&
            x.IsActive,
            cancellationToken);
    }


    public async Task<bool> CanAccessYpodeigmaAsync(int userId, int ypodeigmaId, List<int> responsibleOrgUnitIds, CancellationToken cancellationToken)
    {
        var requestedOrgUnitIds = responsibleOrgUnitIds
            .Distinct()
            .ToList();

        var userOrgUnitId = await _db.Users
            .Where(u => u.Id == userId)
            .Select(u => u.OrgUnitId)
            .SingleAsync(cancellationToken);

        var allowedCount = await _db.AccessGrants
            .Where(x =>
                (x.GranteeUserId == userId || x.GranteeOrgUnitId == userOrgUnitId) &&
                x.YpodeigmaId == ypodeigmaId &&
                requestedOrgUnitIds.Contains(x.ResponsibleOrgUnitId))
            .Select(x => x.ResponsibleOrgUnitId)
            .Distinct()
            .CountAsync(cancellationToken);

        return allowedCount == requestedOrgUnitIds.Count;
    }


    public async Task<bool> CanPerformSubmissionActionAsync(int userId, int ypodeigmaId, int responsibleOrgUnitId, SubmissionSaveAction action, CancellationToken cancellationToken)
    {
        var requiredPermission = action switch
        {
            SubmissionSaveAction.SaveDraft => AccessPermission.Edit,
            SubmissionSaveAction.Submit => AccessPermission.Submit,
            _ => AccessPermission.None
        };

        if (requiredPermission == AccessPermission.None)
            return false;

        var userOrgUnitId = await _db.Users
            .Where(u => u.Id == userId)
            .Select(u => u.OrgUnitId)
            .SingleAsync(cancellationToken);
        
        return await _db.AccessGrants
            .AnyAsync(x =>
                (x.GranteeUserId == userId || x.GranteeOrgUnitId == userOrgUnitId) &&
                x.YpodeigmaId == ypodeigmaId &&
                x.ResponsibleOrgUnitId == responsibleOrgUnitId &&
                (x.Permissions & requiredPermission) == requiredPermission,
                cancellationToken);
    }

}