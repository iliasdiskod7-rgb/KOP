using KOP.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace KOP.Infrastructure.Persistence.Configurations;

public class YpodeigmaEntryConfiguration : IEntityTypeConfiguration<YpodeigmaEntry>
{
    public void Configure(EntityTypeBuilder<YpodeigmaEntry> builder)
    {
        builder.ToTable("INP_YPODEIGMATA_ENTRIES");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Id)
            .HasColumnName("ID")
            .ValueGeneratedOnAdd();

        builder.Property(x => x.SubmissionId)
            .HasColumnName("SUBMISSION_ID")
            .IsRequired();

        builder.Property(x => x.SubmissionRevisionNo)
            .HasColumnName("SUBMISSION_REVISION_NO")
            .IsRequired();

        builder.Property(x => x.MonadaOrgUnitId)
            .HasColumnName("MONADA_ORG_UNIT_ID")
            .IsRequired();

        builder.Property(x => x.MoiraOrgUnitId)
            .HasColumnName("MOIRA_ORG_UNIT_ID");

        builder.Property(x => x.StoixeioKostousId)
            .HasColumnName("STOIXEIO_KOSTOUS_ID")
            .IsRequired();

        builder.Property(x => x.Value)
            .HasColumnName("VALUE")
            .HasPrecision(18, 2)
            .IsRequired();

        builder.Property(x => x.Comment)
            .HasColumnName("COMMENT")
            .HasMaxLength(1000);

        builder.HasOne(x => x.Submission)
            .WithMany(x => x.YpodeigmaEntries)
            .HasForeignKey(x => x.SubmissionId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.MonadaOrgUnit)
            .WithMany()
            .HasForeignKey(x => x.MonadaOrgUnitId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.MoiraOrgUnit)
            .WithMany()
            .HasForeignKey(x => x.MoiraOrgUnitId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.StoixeioKostous)
            .WithMany()
            .HasForeignKey(x => x.StoixeioKostousId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(x => new
        {
            x.SubmissionId,
            x.SubmissionRevisionNo
        });

        builder.HasIndex(x => new
        {
            x.MonadaOrgUnitId,
        });

        builder.HasIndex(x => new
        {
            x.MoiraOrgUnitId,
        });

        builder.HasIndex(x => new
        {
            x.StoixeioKostousId,
        });
    }
}