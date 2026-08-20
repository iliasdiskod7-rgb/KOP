namespace KOP.Application.Interfaces.Repositories;

public interface IStoixeiaKostousRepository
{
    Task<bool> AreStoixeiaKostousValidAsync(int ypodeigmaId, IReadOnlyCollection<int> stoixeiaKostous, CancellationToken cancellationToken);
}