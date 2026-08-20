using KOP.Domain.Enums;

namespace KOP.Domain.Entities;

public class SubmissionEvent
{
    public int Id { get; set; }

    public int SubmissionId { get; set; }
    public Submission Submission { get; set; } = null!;

    public int SubmissionRevisionNo { get; set; }

    public SubmissionStatus Status { get; set; }

    public int StatusChangedByUserId { get; set; }
    public User StatusChangedByUser { get; set; } = null!;
    public DateTime StatusChangedAt { get; set; }

    public string? Comment { get; set; }
}