using KOP.Application.Interfaces.Services;
using KOP.Domain.Common.Exceptions;
using KOP.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace KOP.Api.Controllers;

[ApiController]
[Route("api/auth")]
[Authorize]
public sealed class AuthController(IAuthenticationService authService) : ControllerBase
{
    ///
    /// POST /api/auth/login
    ///
    [HttpPost("login")]
    [AllowAnonymous]
    public async Task<ActionResult<LoginResponse>> Login(LoginRequest request, CancellationToken cancellationToken)
    {
        var result = await authService.LoginAsync(
            new LoginCommand(
                request.Username,
                request.Password),
            cancellationToken);

        if (!result.Succeeded)
            throw new UnauthorizedException("Λάθος διαπιστευτήρια.");

        return Ok(new LoginResponse(
            AccessToken: result.AccessToken!,
            TokenType: "Bearer",
            ExpiresAt: result.ExpiresAt!.Value));
    }
}