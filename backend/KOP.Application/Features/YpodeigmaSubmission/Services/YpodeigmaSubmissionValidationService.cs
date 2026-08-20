using KOP.Application.Features.YpodeigmaSubmission.Dtos;
using KOP.Application.Interfaces.Repositories;
using KOP.Application.Interfaces.Services;
using KOP.Domain.Common.Exceptions;
using KOP.Domain.Enums;

namespace KOP.Application.Features.YpodeigmaSubmission.Services;

public sealed class YpodeigmaSubmissionValidationService(
    IYpodeigmataRepository ypodeigmataRepository,
    ISubmissionsRepository submissionsRepository,
    IOrganizationalUnitsRepository orgUnitsRepository,
    IStoixeiaKostousRepository stoixeiaKostousRepository) : IYpodeigmaSubmissionValidationService
{
    public async Task ValidateForSaveAsync(YpodeigmaSubmissionRequest request, CancellationToken cancellationToken = default)
    {
        ValidateRequestInMemory(request);

        await ValidateYpodeigmaAsync(request, cancellationToken);

        await ValidateResponsibleOrgUnitAsync(request, cancellationToken);

        await ValidateSubmissionAsync(request, cancellationToken);

        await ValidateOrgUnitsAsync(request, cancellationToken);

        await ValidateStoixeiaKostousAsync(request, cancellationToken);
    }

    private static void ValidateRequestInMemory(YpodeigmaSubmissionRequest request)
    {
        ValidateAction(request);

        ValidateIds(request);

        ValidateEntriesExist(request);

        ValidateEntryIds(request);

        ValidateEtosAnaforas(request);

        ValidateValues(request);

        ValidateDuplicateEntries(request);

        ValidateComments(request);
    }

    private static void ValidateAction(YpodeigmaSubmissionRequest request)
    {
        if (!Enum.IsDefined(request.Action) ||
            request.Action == SubmissionSaveAction.None)
        {
            throw new ArgumentException("[HAF0017] Δεν είναι έγκυρο το SubmissionSaveAction.");
        }
    }

    private static void ValidateIds(YpodeigmaSubmissionRequest request)
    {
        if (request.YpodeigmaId <= 0 ||
            request.ResponsibleOrgUnitId <= 0 ||
            request.SubmissionId is <= 0)
        {
            throw new ArgumentException("[HAF0018] Ένα ή περισσότερα IDs δεν είναι έγκυρα.");
        }
    }

    private static void ValidateEntriesExist(YpodeigmaSubmissionRequest request)
    {
        if (request.Entries.Count == 0)
        {
            throw new ArgumentException("[HAF0019] Πρέπει να υπάρχει τουλάχιστον μία καταχώρηση.");
        }
    }

    private static void ValidateEntryIds(YpodeigmaSubmissionRequest request)
    {
        var hasInvalidId = request.Entries.Any(x =>
            x.MonadaOrgUnitId <= 0 ||
            x.StoixeioKostousId <= 0 ||
            x.MoiraOrgUnitId is <= 0);

        if (hasInvalidId)
        {
            throw new ArgumentException("[HAF0020] Ένα ή περισσότερα IDs καταχωρήσεων δεν είναι έγκυρα.");
        }
    }

    private static void ValidateEtosAnaforas(YpodeigmaSubmissionRequest request)
    {
        if (request.EtosAnaforas < 2023 ||
            request.EtosAnaforas > DateTime.Today.Year)
        {
            throw new ArgumentException("[HAF0021] Δεν είναι έγκυρο το Έτος Αναφοράς.");
        }
    }

    private static void ValidateValues(YpodeigmaSubmissionRequest request)
    {
        if (request.Entries.Any(x => x.Value <= 0))
        {
            throw new ArgumentException("[HAF0022] Οι τιμές των καταχωρήσεων δεν μπορούν να είναι μικρότερες ή ίσες του μηδενός.");
        }
    }

    private static void ValidateDuplicateEntries(YpodeigmaSubmissionRequest request)
    {
        var containsDuplicates = request.Entries
            .GroupBy(x => new
            {
                x.MonadaOrgUnitId,
                x.MoiraOrgUnitId,
                x.StoixeioKostousId
            })
            .Any(group => group.Count() > 1);

        if (containsDuplicates)
        {
            throw new ArgumentException("[HAF0023] Υπάρχουν διπλότυπες καταχωρήσεις.");
        }
    }

    private static void ValidateComments(YpodeigmaSubmissionRequest request)
    {
        if (request.SubmissionComment?.Length > 1000)
        {
            throw new ArgumentException("[HAF0024] Το σχόλιο του submission δεν μπορεί να υπερβαίνει τους 1000 χαρακτήρες.");
        }

        if (request.SubmissionEventComment?.Length > 1000)
        {
            throw new ArgumentException("[HAF0025] Το σχόλιο του submission event δεν μπορεί να υπερβαίνει τους 1000 χαρακτήρες.");
        }

        if (request.Entries.Any(x =>
                x.EntryComment?.Length > 1000))
        {
            throw new ArgumentException("[HAF0026] Τα σχόλια των καταχωρήσεων δεν μπορούν να υπερβαίνουν τους 1000 χαρακτήρες.");
        }
    }

    private async Task ValidateYpodeigmaAsync(YpodeigmaSubmissionRequest request, CancellationToken cancellationToken)
    {
        var isValid = await ypodeigmataRepository.IsYpodeigmaValidAsync(request.YpodeigmaId, cancellationToken);

        if (!isValid)
        {
            throw new ArgumentException("[HAF0027] Το Υπόδειγμα δεν υπάρχει ή δεν είναι ενεργό.");
        }
    }

    private async Task ValidateResponsibleOrgUnitAsync(YpodeigmaSubmissionRequest request, CancellationToken cancellationToken)
    {
        var isValid = await orgUnitsRepository.IsResponsibleOrgUnitValidAsync(request.ResponsibleOrgUnitId, cancellationToken);

        if (!isValid)
        {
            throw new ArgumentException("[HAF0028] Η υπεύθυνη οργανωτική μονάδα δεν είναι έγκυρη.");
        }
    }

    private async Task ValidateSubmissionAsync(YpodeigmaSubmissionRequest request, CancellationToken cancellationToken)
    {
        if (request.SubmissionId is null)
        {
            var alreadyExists = await submissionsRepository.ExistsForYpodeigmaYearAndResponsibleOrgUnitAsync(request.EtosAnaforas, request.YpodeigmaId, request.ResponsibleOrgUnitId, cancellationToken);

            if (alreadyExists)
            {
                throw new ConflictException("[HAF0029] Υπάρχουν ήδη δεδομένα για αυτό το Υπόδειγμα, έτος και οργανωτική μονάδα.");
            }

            return;
        }

        var submissionId = request.SubmissionId.Value;

        var contextIsValid =await submissionsRepository.IsSubmissionContextValidAsync(submissionId, request.EtosAnaforas, request.YpodeigmaId, request.ResponsibleOrgUnitId, cancellationToken);

        if (!contextIsValid)
        {
            throw new ArgumentException("[HAF0030] Το SubmissionId δεν αντιστοιχεί στα υπόλοιπα δεδομένα του request.");
        }

        var isEditable = await submissionsRepository.IsSubmissionEditableAsync(submissionId, cancellationToken);

        if (!isEditable)
        {
            throw new ConflictException("[HAF0031] Το submission βρίσκεται σε κατάσταση που δεν επιτρέπει επεξεργασία.");
        }
    }

    private async Task ValidateOrgUnitsAsync(YpodeigmaSubmissionRequest request, CancellationToken cancellationToken)
    {
        var monadaOrgUnitIds = request.Entries
            .Select(x => x.MonadaOrgUnitId)
            .Distinct()
            .ToArray();

        var scopeIsValid = await orgUnitsRepository.IsMonadaOrgUnitScopeValidAsync(request.YpodeigmaId, request.ResponsibleOrgUnitId, monadaOrgUnitIds, cancellationToken);

        if (!scopeIsValid)
        {
            throw new ArgumentException("[HAF0032] Μία ή περισσότερες Μονάδες δεν ανήκουν στο επιτρεπόμενο scope.");
        }

        var monadaMoiraPairs = request.Entries
            .Where(x => x.MoiraOrgUnitId.HasValue)
            .Select(x => new MonadaMoiraPair(
                x.MonadaOrgUnitId,
                x.MoiraOrgUnitId!.Value))
            .Distinct()
            .ToArray();

        var hierarchyIsValid = await orgUnitsRepository.IsMonadaMoiraHierarchyValidAsync(monadaMoiraPairs, cancellationToken);

        if (!hierarchyIsValid)
        {
            throw new ArgumentException("[HAF0033] Μία ή περισσότερες Μοίρες δεν ανήκουν στη δηλωμένη Μονάδα.");
        }
    }

    private async Task ValidateStoixeiaKostousAsync(YpodeigmaSubmissionRequest request, CancellationToken cancellationToken)
    {
        var stoixeiaKostousIds = request.Entries
            .Select(x => x.StoixeioKostousId)
            .Distinct()
            .ToArray();

        var areValid = await stoixeiaKostousRepository.AreStoixeiaKostousValidAsync(request.YpodeigmaId, stoixeiaKostousIds, cancellationToken);

        if (!areValid)
        {
            throw new ArgumentException("[HAF0034] Ένα ή περισσότερα Στοιχεία Κόστους δεν είναι έγκυρα για το Υπόδειγμα.");
        }
    }
}