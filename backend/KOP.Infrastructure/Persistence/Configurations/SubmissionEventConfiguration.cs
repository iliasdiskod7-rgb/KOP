using KOP.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace KOP.Infrastructure.Persistence.Configurations;

public class SubmissionEventConfiguration : IEntityTypeConfiguration<SubmissionEvent>
{
    public void Configure(EntityTypeBuilder<SubmissionEvent> builder)
    {
        builder.ToTable("WF_SUBMISSION_EVENTS");

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

        builder.Property(x => x.Status)
            .HasColumnName("STATUS")
            .HasConversion<string>()
            .HasMaxLength(50)
            .IsRequired();

        builder.Property(x => x.StatusChangedByUserId)
            .HasColumnName("STATUS_CHANGED_BY_USER_ID")
            .IsRequired();

        builder.Property(x => x.StatusChangedAt)
            .HasColumnName("STATUS_CHANGED_AT")
            .HasPrecision(3)
            .IsRequired();

        builder.Property(x => x.Comment)
            .HasColumnName("COMMENT")
            .HasMaxLength(1000);

        builder.HasOne(x => x.Submission)
            .WithMany(x => x.SubmissionEvents)
            .HasForeignKey(x => x.SubmissionId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.StatusChangedByUser)
            .WithMany()
            .HasForeignKey(x => x.StatusChangedByUserId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(x => new
        {
            x.SubmissionId,
            x.SubmissionRevisionNo
        });

        builder.HasIndex(x => x.Status);

        builder.HasIndex(x => x.StatusChangedByUserId);
    }
}