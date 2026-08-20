using KOP.Application.Features.App.Dtos;

namespace KOP.Application.Interfaces.Services;

public interface IAppService
{
    Task<AppInitResponseDto> GetInitialAppDataAsync(
        int userId,
        CancellationToken cancellationToken = default);
}