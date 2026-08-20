namespace KOP.Application.Features.YpodeigmaSubmission.Dtos;

public class SubmissionListItemDto
{
    public int Id { get; set; }

    public int EtosAnaforas { get; set; }

    public int YpodeigmaId { get; set; }

    public string YpodeigmaTitle { get; set; } = string.Empty;

    public int SubmissionOrgUnitId { get; set; }

    public string SubmissionOrgUnitOnomasia { get; set; } = string.Empty;

    public string CurrentStatus { get; set; } = string.Empty;

    public int CurrentRevisionNo { get; set; }

    public string CreatedBy {get;set;} = string.Empty;
    
    public DateTime CreatedAt { get; set; }

    public string UpdatedBy {get;set;} = string.Empty;
    
    public DateTime UpdatedAt { get; set; }

    public string Comment { get; set; } = string.Empty;
}