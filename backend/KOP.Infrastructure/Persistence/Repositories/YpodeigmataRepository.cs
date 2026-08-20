using KOP.Application.Features.YpodeigmaSubmission.Dtos;
using KOP.Application.Interfaces.Repositories;
using KOP.Domain.Common.Exceptions;
using KOP.Domain.Entities;
using KOP.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace KOP.Infrastructure.Persistence.Repositories;

public sealed class YpodeigmataRepository (KOPDbContext _db): IYpodeigmataRepository
{
    public async Task<IReadOnlyList<YpodeigmaSubmissionResponse>> GetYpodeigmaEntriesAsync(int ypodeigmaId, int etosAnaforas, List<int> responsibleOrgUnitIds, CancellationToken cancellationToken = default)
    {
        return await _db.Submissions
            .AsNoTracking()
            .Where(s =>
                s.YpodeigmaId == ypodeigmaId &&
                s.EtosAnaforas == etosAnaforas &&
                responsibleOrgUnitIds.Contains(s.ResponsibleOrgUnitId))
            .Select(s => new YpodeigmaSubmissionResponse
            {
                SubmissionId = s.Id,
                YpodeigmaId = s.YpodeigmaId,
                EtosAnaforas = s.EtosAnaforas,
                ResponsibleOrgUnitId = s.ResponsibleOrgUnitId,
                ResponsibleOrgUnitOnomasia = s.ResponsibleOrgUnit.Onomasia,
                CurrentStatus = s.CurrentStatus,
                CurrentRevisionNo = s.CurrentRevisionNo,
                UpdatedBy = s.UpdatedByUser.FullName,
                UpdatedAt = s.UpdatedAt,
                Comment = s.Comment,

                YpodeigmaEntries = s.YpodeigmaEntries
                    .Where(e => e.SubmissionRevisionNo == s.CurrentRevisionNo)
                    .Select(e => new YpodeigmaEntryDto
                    {
                        Id = e.Id,
                        MonadaId = e.MonadaOrgUnitId,
                        MonadaOnomasia = e.MonadaOrgUnit.Onomasia,
                        MoiraId = e.MoiraOrgUnitId,
                        MoiraOnomasia = e.MoiraOrgUnit != null ? e.MoiraOrgUnit.Onomasia : null,
                        StoixeioKostousId = e.StoixeioKostousId,
                        StoixeioKostousOnomasia = e.StoixeioKostous.Onomasia,
                        Value = e.Value,
                        EntryComment = e.Comment
                    })
                    .ToList()
            })
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<StoixeioKostousDto>> GetStoixeiaKostousByStoixeioIdAsync(int kyrioStoixeioId, CancellationToken cancellationToken = default)
    {
        return await _db.StoixeiaKostous
            .Where(x => x.KyrioStoixeioId == kyrioStoixeioId)
            .Select(x => new StoixeioKostousDto
            {
                Id = x.Id,
                Kodikos = x.Kodikos,
                EpipedoAnalysis = x.EpipedoAnalysis,
                Onomasia = x.Onomasia,
                EinaiXamiloteroEpipedo = x.EinaiXamiloteroEpipedo
            })
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<MonadaDto>> GetSubjectOrgUnitsByYpodeigmaAndRespOrgUnitsAsync(int ypodeigmaId, List<int> responsibleOrgUnitsIds, CancellationToken cancellationToken = default)
    {
        return await _db.YpodeigmaSubmissionScopes
            .Where(x => 
                x.YpodeigmaId == ypodeigmaId &&
                responsibleOrgUnitsIds.Contains(x.ResponsibleOrgUnitId))
            .Select(x => new MonadaDto
            {
                OrgUnitId = x.SubjectOrgUnitId,
                Onomasia = x.SubjectOrgUnit.Onomasia,
                Moires = x.SubjectOrgUnit.Children
                    .Where(child => child.UnitType == UnitType.MoiraPtitikouMesou)
                    .Select(child => new MonadaDto
                    {
                        OrgUnitId = child.Id,
                        Onomasia = child.Onomasia,
                        Moires = new List<MonadaDto>()
                    })
                    .ToList()
            })
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<int>> GetKatagegrammenaEtiYpodeigmatosAsync(int ypodeigmaId, List<int> responsibleOrgUnitsIds, CancellationToken cancellationToken = default)
    {
        return await _db.Submissions
            .Where(x =>
                x.YpodeigmaId == ypodeigmaId &&
                responsibleOrgUnitsIds.Contains(x.ResponsibleOrgUnitId))
            .Select(x => x.EtosAnaforas)
            .Distinct()
            .ToListAsync(cancellationToken);
    }

    public async Task<YpodeigmaSubmissionRequestResult> SaveAsync(int userId, YpodeigmaSubmissionRequest request, CancellationToken cancellationToken = default)
    {
        var now = DateTime.Now;
        
        await using var transaction = await _db.Database.BeginTransactionAsync(cancellationToken);

        ///
        /// ΝΕΟ SUBMISSION
        /// 
        Submission submission;
        if (request.SubmissionId is null)
        {
            var newStatus = request.Action switch
            {
                SubmissionSaveAction.SaveDraft => SubmissionStatus.Draft,
                SubmissionSaveAction.Submit => SubmissionStatus.Submitted,

                _ => throw new ArgumentOutOfRangeException(
                    nameof(request.Action),
                    request.Action,
                    "[HAF0016] Τιμή στο SubmissionSaveAction enum που δεν αναγνωρίζεται.")
            };
            submission = new Submission
            {
                YpodeigmaId = request.YpodeigmaId,
                EtosAnaforas = request.EtosAnaforas,
                ResponsibleOrgUnitId = request.ResponsibleOrgUnitId,
                CurrentStatus = newStatus,
                CurrentRevisionNo = 1,
                CreatedByUserId = userId,
                CreatedAt = now,
                UpdatedByUserId = userId,
                UpdatedAt = now,
                Comment = request.SubmissionComment
            };

            _db.Submissions.Add(submission);

            // Χρειάζεται ώστε να πάρουμε το identity Submission.Id
            // πριν δημιουργήσουμε τα entries.
            await _db.SaveChangesAsync(cancellationToken);
        }
        ///
        /// ΤΡΟΠΟΠΟΙΗΣΗ ΥΠΑΡΧΟΝΤΟΣ SUBMISSION
        /// 
        else
        {
            submission = await _db.Submissions
                .SingleAsync(
                    x => x.Id == request.SubmissionId.Value,
                    cancellationToken);

            var (newStatus, newRevisionNo) = GetNewStatusAndRevisionNo(submission.CurrentStatus, submission.CurrentRevisionNo, request.Action);

            submission.YpodeigmaId = request.YpodeigmaId;
            submission.EtosAnaforas = request.EtosAnaforas;
            submission.ResponsibleOrgUnitId = request.ResponsibleOrgUnitId;
            submission.CurrentStatus = newStatus;
            submission.CurrentRevisionNo = newRevisionNo;
            submission.UpdatedByUserId = userId;
            submission.UpdatedAt = now;
            submission.Comment = request.SubmissionComment;

            var existingEntries = await _db.YpodeigmataEntries
                .Where(x =>
                    x.SubmissionId == submission.Id &&
                    x.SubmissionRevisionNo == submission.CurrentRevisionNo)
                .ToListAsync(cancellationToken);

            _db.YpodeigmataEntries.RemoveRange(existingEntries);
        }

        ///
        /// Δημιουργία Entries
        /// 
        var entries = request.Entries
            .Select(entryRequest => new YpodeigmaEntry
            {
                SubmissionId = submission.Id,
                SubmissionRevisionNo = submission.CurrentRevisionNo,
                MonadaOrgUnitId = entryRequest.MonadaOrgUnitId,
                MoiraOrgUnitId = entryRequest.MoiraOrgUnitId,
                StoixeioKostousId = entryRequest.StoixeioKostousId,
                Value = entryRequest.Value,
                Comment = entryRequest.EntryComment
            })
            .ToList();

        _db.YpodeigmataEntries.AddRange(entries);

        ///
        /// Δημιουργία Submission Event
        /// 
        var submissionEvent = new SubmissionEvent
        {
            SubmissionId = submission.Id,
            Status = submission.CurrentStatus,
            SubmissionRevisionNo = submission.CurrentRevisionNo,
            StatusChangedByUserId = userId,
            StatusChangedAt = now,
            Comment = request.SubmissionEventComment
        };
        _db.SubmissionEvents.Add(submissionEvent);

        ///
        /// Δημιουργία Submission Subject Org Unit
        /// 
        var submissionSubjectOrgUnit = new SubmissionSubjectOrgUnit
        {
            SubmissionId = submission.Id,
            SubjectOrgUnitId = submission.ResponsibleOrgUnitId
        };
        _db.SubmissionSubjectOrgUnits.Add(submissionSubjectOrgUnit);

        await _db.SaveChangesAsync(cancellationToken);

        ///
        /// Commit
        /// 
        await transaction.CommitAsync(cancellationToken);

        return new YpodeigmaSubmissionRequestResult
        {
            SubmissionId = submission.Id,
            Status = submission.CurrentStatus,
            SubmissionRevisionNo = submission.CurrentRevisionNo
        };
    }

    public Task<bool> IsYpodeigmaValidAsync(int ypodeigmaId, CancellationToken cancellationToken)
    {
        return _db.Ypodeigmata.AnyAsync(x =>
            x.Id == ypodeigmaId &&
            x.IsActive,
            cancellationToken);
    }

    private (SubmissionStatus, int) GetNewStatusAndRevisionNo(SubmissionStatus currentStatus, int currentRevisionNo, SubmissionSaveAction submissionAction)
    {
        if (currentStatus == SubmissionStatus.Draft && currentRevisionNo == 1 && submissionAction == SubmissionSaveAction.SaveDraft)
            return (SubmissionStatus.Draft, currentRevisionNo);

        else if (currentStatus == SubmissionStatus.Draft && currentRevisionNo == 1 && submissionAction == SubmissionSaveAction.Submit)
            return (SubmissionStatus.Submitted, currentRevisionNo);
        
        else if (currentStatus == SubmissionStatus.Draft && currentRevisionNo > 1 && submissionAction == SubmissionSaveAction.SaveDraft)
            return (SubmissionStatus.Draft, currentRevisionNo);

        else if (currentStatus == SubmissionStatus.Draft && currentRevisionNo > 1 && submissionAction == SubmissionSaveAction.Submit)
            return (SubmissionStatus.Resubmitted, currentRevisionNo);

        else if (currentStatus == SubmissionStatus.ReturnedForCorrection && submissionAction == SubmissionSaveAction.SaveDraft)
            return (SubmissionStatus.Draft, currentRevisionNo + 1);

        else if (currentStatus == SubmissionStatus.ReturnedForCorrection && submissionAction == SubmissionSaveAction.Submit)
            return (SubmissionStatus.Resubmitted, currentRevisionNo + 1);

        else
            throw new ApplicationLogicException("[HAF0015] Λάθος στα statuses.");
    }
}