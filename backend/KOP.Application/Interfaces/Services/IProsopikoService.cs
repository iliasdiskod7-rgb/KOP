using KOP.Application.Features.Prosopiko.Dtos;

namespace KOP.Application.Interfaces.Services;

public interface IProsopikoService
{
    Task<IReadOnlyList<StelexosTopothetisiDto>> GetProcessedProsopikoMonadasGiaEtosAnaforasAsync(
        int hstrMonadaId,
        int etos,
        CancellationToken cancellationToken);
}