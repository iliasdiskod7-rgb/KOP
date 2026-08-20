using KOP.Domain.Enums;

namespace KOP.Domain.Entities;

public class Submission
{
    public int Id { get; set; }

    public int EtosAnaforas { get; set; }
    
    public int YpodeigmaId { get; set; }
    public Ypodeigma Ypodeigma { get; set; } = null!;

    public int ResponsibleOrgUnitId { get; set; }
    public OrganizationalUnit ResponsibleOrgUnit { get; set; } = null!;

    public SubmissionStatus CurrentStatus { get; set; }
    public int CurrentRevisionNo { get; set; }

    public int CreatedByUserId { get; set; }
    public User CreatedByUser { get; set; } = null!;
    public DateTime CreatedAt { get; set; }

    public int UpdatedByUserId { get; set; }
    public User UpdatedByUser { get; set; } = null!;
    public DateTime UpdatedAt { get; set; }

    public string? Comment { get; set; }
    
    public ICollection<SubmissionEvent> SubmissionEvents { get; set; } = [];
    public ICollection<SubmissionSubjectOrgUnit> SubjectOrgUnits { get; set; } = [];
    public ICollection<YpodeigmaEntry> YpodeigmaEntries { get; set; } = [];
}