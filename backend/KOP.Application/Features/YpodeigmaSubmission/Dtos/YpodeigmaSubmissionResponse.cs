using KOP.Domain.Enums;

namespace KOP.Application.Features.YpodeigmaSubmission.Dtos;

public sealed class YpodeigmaSubmissionResponse
{
    public required int SubmissionId { get; init; }
    public required int YpodeigmaId { get; init; }
    public required int EtosAnaforas { get; init; }
    public required int ResponsibleOrgUnitId { get; init; }
    public required string ResponsibleOrgUnitOnomasia { get; init; } = string.Empty;
    public required SubmissionStatus CurrentStatus { get; init; }
    public required int CurrentRevisionNo { get; init; }
    public required string UpdatedBy { get; init; } = string.Empty;
    public required DateTime UpdatedAt { get; init; }
    public string? Comment { get; init; }
    public required List<YpodeigmaEntryDto> YpodeigmaEntries { get; init; } = [];
}

public sealed class YpodeigmaEntryDto
{
    public required int Id { get; init; }
    public required int MonadaId { get; init; }
    public required string MonadaOnomasia { get; init; } = string.Empty;
    public int? MoiraId { get; init; }
    public string? MoiraOnomasia { get; init; } = string.Empty;
    public required int StoixeioKostousId { get; init; }
    public required string StoixeioKostousOnomasia { get; init; } = string.Empty;
    public decimal Value { get; init; }
    public string? EntryComment { get; init; }
}