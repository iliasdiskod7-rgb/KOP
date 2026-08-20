using KOP.Domain.Enums;

namespace KOP.Domain.Entities;

public class Ypodeigma
{
    public int Id { get; set; }

    public string Title { get; set; } = string.Empty;
    
    public string? Perigrafi { get; set; } = string.Empty;

    public YpodeigmaType YpodeigmaType { get; set; }

    public bool IsActive { get; set; }

    public int KyrioStoixeioId { get; set; }
    public KyrioStoixeio KyrioStoixeio  { get; set; } = null!;

    public ICollection<Submission> Submissions { get; set; } = [];
}