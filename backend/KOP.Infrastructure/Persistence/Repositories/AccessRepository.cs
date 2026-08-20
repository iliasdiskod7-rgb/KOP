using KOP.Application.Features.App.Dtos;
using KOP.Application.Interfaces.Repositories;
using KOP.Domain.Common.Exceptions;
using KOP.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace KOP.Infrastructure.Persistence.Repositories;

public sealed class AccessRepository(KOPDbContext _db) : IAccessRepository
{
    public async Task<IReadOnlyList<AllowedYpodeigmaDto>> GetPermissionsOnYpodeigmataByUserIdAsync(int userId, CancellationToken cancellationToken)
    {
        var userOrgUnitId = await _db.Users
            .Where(u => u.Id == userId)
            .Select(u => u.OrgUnitId)
            .SingleAsync(cancellationToken);
        
        var grants = await _db.AccessGrants
            .Where(x => x.GranteeUserId == userId || x.GranteeOrgUnitId == userOrgUnitId)
            .Select(x => new
            {
                x.YpodeigmaId,
                YpodeigmaTitle = x.Ypodeigma.Title,
                x.ResponsibleOrgUnitId,
                x.Permissions
            })
            .ToListAsync(cancellationToken);

        var allowedYpodeigmata = grants
            .GroupBy(x => new
            {
                x.YpodeigmaId,
                x.YpodeigmaTitle
            })
            .Select(group => new AllowedYpodeigmaDto
            {
                YpodeigmaId = group.Key.YpodeigmaId,
                Title = group.Key.YpodeigmaTitle,

                ResponsibleOrgUnits = group
                    .GroupBy(x => x.ResponsibleOrgUnitId)
                    .Select(orgUnitGroup => new AllowedOrgUnitDto
                    {
                        OrgUnitId = orgUnitGroup.Key,

                        CanView = orgUnitGroup.Any(x =>
                            x.Permissions.HasFlag(AccessPermission.View)),

                        CanEdit = orgUnitGroup.Any(x =>
                            x.Permissions.HasFlag(AccessPermission.Edit)),

                        CanSubmit = orgUnitGroup.Any(x =>
                            x.Permissions.HasFlag(AccessPermission.Submit)),

                        CanReturn = orgUnitGroup.Any(x =>
                            x.Permissions.HasFlag(AccessPermission.Return))
                    })
                    .ToList()
            })
            .ToList();

        ///
        /// Προσωρινοί Έλεγχοι
        ///
        /// (TODO: Οι κύριοι έλεγχοι να υλοποιηθούν όταν σώζονται τα permissions από το μενού Εξουσιοδοτήσεις της Δ6.)
        /// (Να σβηστεί αυτό το κομμάτι μετά.)
        
        // Κανόνας 1:
        // Αν υπάρχει δικαίωμα Edit ή Submit του χρήστη για ένα Υπόδειγμα, το Υπόδειγμα πρέπει να έχει ακριβώς ένα ResponsibleOrgUnit.
        var invalidYpodeigmata = allowedYpodeigmata
            .Where(ypodeigma =>
                ypodeigma.ResponsibleOrgUnits.Any(orgUnit =>
                    orgUnit.CanEdit || orgUnit.CanSubmit)
                &&
                ypodeigma.ResponsibleOrgUnits.Count != 1)
            .Select(ypodeigma => new
            {
                ypodeigma.YpodeigmaId,
                ypodeigma.Title,
                OrgUnitIds = ypodeigma.ResponsibleOrgUnits
                    .Select(orgUnit => orgUnit.OrgUnitId)
                    .ToList()
            })
            .ToList();

        if (invalidYpodeigmata.Count > 0)
        {
            var details = string.Join(
                " / ",
                invalidYpodeigmata.Select(x =>
                    $"Υπόδειγμα {x.YpodeigmaId} ({x.Title}): " +
                    $"ResponsibleOrgUnits [{string.Join(", ", x.OrgUnitIds)}]"));

            throw new ApplicationLogicException($"[HAF0008] Βρέθηκαν μη έγκυρα δικαιώματα. {details}. Έχετε δικαίωμα επεξεργασίας ή υποβολής στο υπόδειγμα, αλλά βρέθηκαν πάνω από μία RespOrgUnits.");
        }

        // Κανόνας 2:
        // Για κάθε ResponsibleOrgUnit ακριβώς ένα από τα CanView / CanEdit πρέπει να είναι true.
        var invalidViewEditPermissions = allowedYpodeigmata
            .SelectMany(x => x.ResponsibleOrgUnits)
            .Where(orgUnit => orgUnit.CanView == orgUnit.CanEdit)
            .ToList();

        if (invalidViewEditPermissions.Count > 0)
            throw new ApplicationLogicException("[HAF0009] Για κάθε ResponsibleOrgUnit πρέπει να είναι true ακριβώς ένα από τα CanView και CanEdit.");

        return allowedYpodeigmata;
    }
}