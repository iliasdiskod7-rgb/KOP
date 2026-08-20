namespace KOP.Domain.Entities;

public class SubmissionSubjectOrgUnit
{
    public int SubmissionId { get; set; }
    public Submission Submission { get; set; } = null!;

    public int SubjectOrgUnitId { get; set; }
    public OrganizationalUnit SubjectOrgUnit { get; set; } = null!;
}