using KOP.Domain.Enums;

namespace KOP.Application.Features.App.Dtos;

public sealed class AppInitResponseDto
{
    public required CurrentUserDto UserInfo { get; init; }
    public required IReadOnlyList<Role> UserRoles { get; init; }
    public required int SubmissionsProsYpovoliCount {get; init;}
    public required int SubmissionsApoEpistrofiCount {get; init;}
    public required IReadOnlyList<AllowedYpodeigmaDto> AllowedYpodeigmata { get; init; }
}

public sealed class CurrentUserDto
{
    public required int UserId { get; init; }
    public required string FullName { get; init; }
    public required string Epistasia { get; init; } 
    public required int OrgUnitId { get; init; }
    public required string OrgUnitTitle { get; init; }
}

public sealed class AllowedYpodeigmaDto
{
    public required int YpodeigmaId { get; init; }
    public required string Title { get; init; }
    public List<AllowedOrgUnitDto> ResponsibleOrgUnits { get; set; } = [];
    
    /*
     * Εδώ η λίστα ResponsibleOrgUnits πρέπει να έχει μέσα της 
     * ένα μόνο AllowedOrgUnitDto με CanEdit = true ή CanSubmit = true.
     */
}

public sealed class AllowedOrgUnitDto
{
    public int OrgUnitId { get; set; }
    public bool CanView { get; set; }
    public bool CanEdit { get; set; }
    public bool CanSubmit { get; set; }
    public bool CanReturn { get; set; }
}