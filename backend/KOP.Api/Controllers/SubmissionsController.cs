using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace KOP.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/submissions")]
public sealed class SubmissionsController() : ControllerBase
{
    // TODO 
}