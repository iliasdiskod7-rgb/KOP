using KOP.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace KOP.Infrastructure.Persistence.Configurations;

public sealed class SubmissionSubjectOrgUnitConfiguration 
    : IEntityTypeConfiguration<SubmissionSubjectOrgUnit>
{
    public void Configure(EntityTypeBuilder<SubmissionSubjectOrgUnit> builder)
    {
        builder.ToTable("WF_SUBMISSION_SUBJECT_ORG_UNITS");

        builder.HasKey(x => new
        {
            x.SubmissionId,
            x.SubjectOrgUnitId
        });

        builder.Property(x => x.SubmissionId)
            .HasColumnName("SUBMISSION_ID")
            .IsRequired();

        builder.Property(x => x.SubjectOrgUnitId)
            .HasColumnName("SUBJECT_ORG_UNIT_ID")
            .IsRequired();

        builder.HasOne(x => x.Submission)
            .WithMany(x => x.SubjectOrgUnits)
            .HasForeignKey(x => x.SubmissionId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(x => x.SubjectOrgUnit)
            .WithMany()
            .HasForeignKey(x => x.SubjectOrgUnitId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(x => x.SubmissionId)
            .HasDatabaseName("IX_SubmissionSubjectOrgUnits_SUBMISSION_ID");

        builder.HasIndex(x => x.SubjectOrgUnitId)
            .HasDatabaseName("IX_SubmissionSubjectOrgUnits_SUBJECT_ORG_UNIT_ID");
    }
}