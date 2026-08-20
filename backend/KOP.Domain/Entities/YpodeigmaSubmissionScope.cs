namespace KOP.Domain.Entities;

public class YpodeigmaSubmissionScope
{
    public int YpodeigmaId { get; set; }
    public Ypodeigma Ypodeigma { get; set; } = null!;

    // Ποιο OrgUnit έχει την ευθύνη υποβολής.
    public int ResponsibleOrgUnitId { get; set; }
    public OrganizationalUnit ResponsibleOrgUnit { get; set; } = null!;

    // Ποιο OrgUnit αφορούν τα data.
    public int SubjectOrgUnitId { get; set; }
    public OrganizationalUnit SubjectOrgUnit { get; set; } = null!;
}