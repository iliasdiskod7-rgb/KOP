using KOP.Domain.Entities;

namespace KOP.Application.Interfaces.Repositories;

public interface IProsopikoRepository
{
     Task<IReadOnlyList<Stelexos>> GetProsopikoMeTopothetiseisByMonadaKaiEtosAsync(
        int hstrIdMonadas,
        int etosAnaforas,
        CancellationToken cancellationToken = default);
}