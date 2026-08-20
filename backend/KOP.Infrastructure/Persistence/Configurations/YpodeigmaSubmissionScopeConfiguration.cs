using KOP.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace KOP.Infrastructure.Persistence.Configurations;

public sealed class YpodeigmaSubmissionScopeConfiguration 
    : IEntityTypeConfiguration<YpodeigmaSubmissionScope>
{
    public void Configure(EntityTypeBuilder<YpodeigmaSubmissionScope> builder)
    {
        builder.ToTable("REF_YPODEIGMA_SUBMISSION_SCOPES");

        builder.HasKey(x => new
        {
            x.YpodeigmaId,
            x.ResponsibleOrgUnitId,
            x.SubjectOrgUnitId
        });

        builder.Property(x => x.YpodeigmaId)
            .HasColumnName("YPODEIGMA_ID")
            .IsRequired();

        builder.Property(x => x.ResponsibleOrgUnitId)
            .HasColumnName("RESPONSIBLE_ORG_UNIT_ID")
            .IsRequired();

        builder.Property(x => x.SubjectOrgUnitId)
            .HasColumnName("SUBJECT_ORG_UNIT_ID")
            .IsRequired();

        builder.HasOne(x => x.Ypodeigma)
            .WithMany()
            .HasForeignKey(x => x.YpodeigmaId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.ResponsibleOrgUnit)
            .WithMany()
            .HasForeignKey(x => x.ResponsibleOrgUnitId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.SubjectOrgUnit)
            .WithMany()
            .HasForeignKey(x => x.SubjectOrgUnitId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(x => x.YpodeigmaId)
            .HasDatabaseName("IX_YpodeigmaSubmissionScopes_YPODEIGMA_ID");

        builder.HasIndex(x => x.ResponsibleOrgUnitId)
            .HasDatabaseName("IX_YpodeigmaSubmissionScopes_RESPONSIBLE_ORG_UNIT_ID");

        builder.HasIndex(x => x.SubjectOrgUnitId)
            .HasDatabaseName("IX_YpodeigmaSubmissionScopes_SUBJECT_ORG_UNIT_ID");

        builder.HasIndex(x => new
        {
            x.YpodeigmaId,
            x.ResponsibleOrgUnitId
        })
        .HasDatabaseName("IX_YpodeigmaSubmissionScopes_YPODEIGMA_ID_RESPONSIBLE_ORG_UNIT_ID");
    }
}