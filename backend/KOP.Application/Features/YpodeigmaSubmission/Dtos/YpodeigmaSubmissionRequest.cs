using KOP.Domain.Enums;

namespace KOP.Application.Features.YpodeigmaSubmission.Dtos;

public sealed class YpodeigmaSubmissionRequest
{
    // Null όταν δημιουργείται καινούριο submission.
    // Έχει τιμή όταν αποθηκεύεται ή υποβάλλεται υπάρχον submission.
    public int? SubmissionId { get; init; }

    public int YpodeigmaId { get; init; }

    public int EtosAnaforas { get; init; }

    public int ResponsibleOrgUnitId { get; init; }

    public SubmissionSaveAction Action { get; init; }

    public string? SubmissionComment { get; init; }

    public string? SubmissionEventComment { get; init; }

    public List<YpodeigmaEntryRequest> Entries { get; init; } = [];
}


public sealed class YpodeigmaEntryRequest
{
    public int MonadaOrgUnitId { get; init; }

    public int? MoiraOrgUnitId { get; init; }

    public int StoixeioKostousId { get; init; }

    public decimal Value { get; init; }

    public string? EntryComment { get; init; }
}