using KOP.Api.Extensions;
using KOP.Application.Features.YpodeigmaSubmission.Dtos;
using KOP.Application.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace KOP.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/ypodeigma/{ypodeigmaId:int}")]
public sealed class YpodeigmataController (IYpodeigmaSubmissionService ypodeigmaSubmissionService): ControllerBase
{
    ///
    /// GET /api/ypodeigma/1/katagegrammenaEti?responsibleOrgUnitIds=1&responsibleOrgUnitIds=2&responsibleOrgUnitIds=3
    ///
    [HttpGet("katagegrammenaEti")]
    public async Task<ActionResult<IReadOnlyList<int>>> GetKatagegrammenaEtiYpodeigmatos([FromRoute] int ypodeigmaId, [FromQuery] List<int> responsibleOrgUnitIds, CancellationToken cancellationToken)
    {
        if (responsibleOrgUnitIds.Count == 0)
            throw new ArgumentException("[HAF0007] Οι παράμετροι δεν μπορούν να είναι NULL.");

        if (ypodeigmaId <= 0)
            throw new ArgumentException("[HAF0010] Το id του Υποδείγματος δεν έχει σωστή τιμή.");
        
        if (responsibleOrgUnitIds.Any(x => x <= 0))
            throw new ArgumentException("[HAF0011] Τα ids των Μονάδων δεν έχουν τη σωστή τιμή.");

        var userId = User.GetUserId();

        var katagegrammenaEti = await ypodeigmaSubmissionService.GetKatagegrammenaEtiYpodeigmatosAsync(
            userId,
            ypodeigmaId,
            responsibleOrgUnitIds,
            cancellationToken);

        return Ok(katagegrammenaEti);
    }


    ///
    /// GET /api/ypodeigma/1/subjectOrgUnits?responsibleOrgUnitIds=1&responsibleOrgUnitIds=2&responsibleOrgUnitIds=3
    ///
    [HttpGet("subjectOrgUnits")]
    public async Task<ActionResult<MonadaDto>> GetSubjectOrgUnitsYpodeigmatos([FromRoute] int ypodeigmaId, [FromQuery] List<int> responsibleOrgUnitIds, CancellationToken cancellationToken)
    {
        if (responsibleOrgUnitIds.Count == 0)
            throw new ArgumentException("[HAF0007] Οι παράμετροι δεν μπορούν να είναι NULL.");

        if (ypodeigmaId <= 0)
            throw new ArgumentException("[HAF0010] Το id του Υποδείγματος δεν έχει σωστή τιμή.");
        
        if (responsibleOrgUnitIds.Any(x => x <= 0))
            throw new ArgumentException("[HAF0011] Τα ids των Μονάδων δεν έχουν τη σωστή τιμή.");

        var userId = User.GetUserId();

        var subjectOrgUnits = await ypodeigmaSubmissionService.GetSubjectOrgUnitsByYpodeigmaAndRespOrgUnitsAsync(
            userId,
            ypodeigmaId,
            responsibleOrgUnitIds,
            cancellationToken);

        return Ok(subjectOrgUnits);
    }
    
    
    ///
    /// GET /api/ypodeigma/1/entries?etosAnaforas=2024&responsibleOrgUnitIds=1&responsibleOrgUnitIds=2&responsibleOrgUnitIds=3
    ///
    [HttpGet("entries")]
    public async Task<ActionResult<YpodeigmaSubmissionResponse>> GetYpodeigmaEntries([FromRoute] int ypodeigmaId, [FromQuery] int etosAnaforas, [FromQuery] List<int> responsibleOrgUnitIds, CancellationToken cancellationToken)
    {
        if (responsibleOrgUnitIds.Count == 0)
            throw new ArgumentException("[HAF0007] Οι παράμετροι δεν μπορούν να είναι NULL.");

        if (ypodeigmaId <= 0)
            throw new ArgumentException("[HAF0010] Το id του Υποδείγματος δεν έχει σωστή τιμή.");

        if (etosAnaforas < 2023)
            throw new ArgumentException("[HAF0012] Το έτος αναφοράς δεν έχει σωστή τιμή.");
        
        if (responsibleOrgUnitIds.Any(x => x <= 0))
            throw new ArgumentException("[HAF0011] Τα ids των Μονάδων δεν έχουν τη σωστή τιμή.");

        var userId = User.GetUserId();

        var ypodeigmaEntries = await ypodeigmaSubmissionService.GetYpodeigmaEntriesAsync(
            userId,
            ypodeigmaId,
            etosAnaforas,
            responsibleOrgUnitIds,
            cancellationToken
        );

        return Ok(ypodeigmaEntries);
    }


    ///
    /// POST /api/ypodeigma/<id>/save
    ///
    [HttpPost("save")]
    public async Task<ActionResult<YpodeigmaSubmissionRequestResult>> SaveSubmissionAndYpodeigmaEntries([FromBody] YpodeigmaSubmissionRequest request, CancellationToken cancellationToken)
    {
        var userId = User.GetUserId();

        var result = await ypodeigmaSubmissionService.ValidateAndSaveSubmissionAndYpodeigmaEntriesAsync(userId, request, cancellationToken);

        return Ok(result);
    }
}