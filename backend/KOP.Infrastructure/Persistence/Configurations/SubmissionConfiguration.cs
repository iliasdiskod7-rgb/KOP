using KOP.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace KOP.Infrastructure.Persistence.Configurations;

public class SubmissionConfiguration : IEntityTypeConfiguration<Submission>
{
    public void Configure(EntityTypeBuilder<Submission> builder)
    {
        builder.ToTable("WF_SUBMISSIONS");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Id)
            .HasColumnName("ID")
            .ValueGeneratedOnAdd();

        builder.Property(x => x.EtosAnaforas)
            .HasColumnName("ETOS_ANAFORAS")
            .IsRequired();

        builder.Property(x => x.YpodeigmaId)
            .HasColumnName("YPODEIGMA_ID")
            .IsRequired();

        builder.Property(x => x.ResponsibleOrgUnitId)
            .HasColumnName("RESPONSIBLE_ORG_UNIT_ID")
            .IsRequired();

        builder.Property(x => x.CurrentStatus)
            .HasColumnName("CURRENT_STATUS")
            .HasConversion<string>()
            .HasMaxLength(50)
            .IsRequired();

        builder.Property(x => x.CurrentRevisionNo)
            .HasColumnName("CURRENT_REVISION_NO")
            .IsRequired();

        builder.Property(x => x.CreatedByUserId)
            .HasColumnName("CREATED_BY_USER_ID")
            .IsRequired();

        builder.Property(x => x.CreatedAt)
            .HasColumnName("CREATED_AT")
            .HasPrecision(3)
            .IsRequired();

        builder.Property(x => x.UpdatedByUserId)
            .HasColumnName("UPDATED_BY_USER_ID")
            .IsRequired();

        builder.Property(x => x.UpdatedAt)
            .HasColumnName("UPDATED_AT")
            .HasPrecision(3)
            .IsRequired();

        builder.Property(x => x.Comment)
            .HasColumnName("COMMENT")
            .HasMaxLength(1000);

        builder.HasOne(x => x.Ypodeigma)
            .WithMany(x => x.Submissions)
            .HasForeignKey(x => x.YpodeigmaId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.ResponsibleOrgUnit)
            .WithMany(x => x.Submissions)
            .HasForeignKey(x => x.ResponsibleOrgUnitId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.CreatedByUser)
            .WithMany(x => x.CreatedSubmissions)
            .HasForeignKey(x => x.CreatedByUserId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.UpdatedByUser)
            .WithMany(x => x.UpdatedSubmissions)
            .HasForeignKey(x => x.UpdatedByUserId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(x => new
        {
            x.YpodeigmaId,
            x.EtosAnaforas,
            x.ResponsibleOrgUnitId
        })
        .IsUnique();
    }
}