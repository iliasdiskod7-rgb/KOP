using KOP.Api.Extensions;
using KOP.Application.Features.App.Dtos;
using KOP.Application.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace KOP.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/app")]
public sealed class AppController(IAppService appService) : ControllerBase
{
    ///
    /// GET /api/app/init
    ///
    [HttpGet("init")]
    public async Task<ActionResult<AppInitResponseDto>> Get(CancellationToken cancellationToken)
    {
        var userId = User.GetUserId();
        
        var appInitResponseDto = await appService.GetInitialAppDataAsync(userId, cancellationToken);
        
        return Ok(appInitResponseDto);
    }
}