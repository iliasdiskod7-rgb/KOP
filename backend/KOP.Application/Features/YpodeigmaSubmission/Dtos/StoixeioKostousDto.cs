namespace KOP.Application.Features.YpodeigmaSubmission.Dtos;

public sealed class StoixeioKostousDto
{
    public required int Id { get; set; }
    public required string Kodikos { get; set; } = string.Empty;
    public required int EpipedoAnalysis { get; set; }
    public required string Onomasia { get; set; } = string.Empty;
    public required bool EinaiXamiloteroEpipedo { get; set; }
}