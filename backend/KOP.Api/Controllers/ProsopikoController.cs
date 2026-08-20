using KOP.Application.Features.Prosopiko.Dtos;
using KOP.Application.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace KOP.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/prosopiko")]
public sealed class ProsopikoController(IProsopikoService prosopikoService) : ControllerBase
{
    ///
    /// GET /api/prosopiko?monada=212000&etosAnaforas=2025
    ///
    [HttpGet]
    public async Task<ActionResult<StelexosTopothetisiDto>> GetProsopikoMonadasGiaEtosAnaforas(
        [FromQuery] int monada,
        [FromQuery] int etosAnaforas,
        CancellationToken cancellationToken)
    {
        var result = await prosopikoService.GetProcessedProsopikoMonadasGiaEtosAnaforasAsync(
            monada,
            etosAnaforas,
            cancellationToken);

        return Ok(result);
    }
}