using KOP.Domain.Enums;

namespace KOP.Application.Features.YpodeigmaSubmission.Dtos;

public sealed class YpodeigmaSubmissionRequestResult
{
    public int SubmissionId { get; init; }

    public int SubmissionRevisionNo { get; init; }

    public SubmissionStatus Status { get; init; }
}