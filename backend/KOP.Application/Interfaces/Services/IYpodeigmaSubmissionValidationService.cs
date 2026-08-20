using KOP.Application.Features.YpodeigmaSubmission.Dtos;

namespace KOP.Application.Interfaces.Services;

public interface IYpodeigmaSubmissionValidationService
{
    Task ValidateForSaveAsync(
        YpodeigmaSubmissionRequest request,
        CancellationToken cancellationToken = default);
}