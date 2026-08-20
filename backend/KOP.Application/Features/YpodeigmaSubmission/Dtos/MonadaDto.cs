namespace KOP.Application.Features.YpodeigmaSubmission.Dtos;

public sealed class MonadaDto
{
    public int OrgUnitId { get; set; }
    public string Onomasia { get; set; } = string.Empty;
    public List<MonadaDto> Moires { get; set; } = null!;
}