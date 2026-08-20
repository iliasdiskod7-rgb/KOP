using KOP.Domain.Enums;

namespace KOP.Domain.Entities;

public class AccessGrant
{
    public int Id { get; set; }
    
    // Άμεσο grant σε συγκεκριμένο χρήστη.
    public int? GranteeUserId { get; set; }
    public User? GranteeUser { get; set; } = null!;

    // Grant σε όλους τους χρήστες που ανήκουν σε αυτό το OrgUnit.
    public int? GranteeOrgUnitId { get; set; }
    public OrganizationalUnit? GranteeOrgUnit { get; set; }
    
    public int YpodeigmaId { get; set; }
    public Ypodeigma Ypodeigma { get; set; } = null!;
    
    public int ResponsibleOrgUnitId { get; set; }
    public OrganizationalUnit ResponsibleOrgUnit { get; set; } = null!;
    
    public AccessPermission Permissions { get; set; }
    
    public DateTime InsertedAt { get; set; }
    public int InsertedByUserId { get; set; }
    public User InsertedByUser { get; set; } = null!;
}