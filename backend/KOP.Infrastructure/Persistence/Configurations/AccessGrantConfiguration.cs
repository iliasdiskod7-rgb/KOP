using KOP.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace KOP.Infrastructure.Persistence.Configurations;

public sealed class AccessGrantConfiguration : IEntityTypeConfiguration<AccessGrant>
{
    public void Configure(EntityTypeBuilder<AccessGrant> builder)
    {
        builder.ToTable("SEC_ACCESS_GRANTS", table =>
        {
            table.HasCheckConstraint(
                "CK_ACCESS_GRANTS_EXACTLY_ONE_GRANTEE",
                """
                (
                    ("GRANTEE_USER_ID" IS NOT NULL AND "GRANTEE_ORG_UNIT_ID" IS NULL)
                    OR
                    ("GRANTEE_USER_ID" IS NULL AND "GRANTEE_ORG_UNIT_ID" IS NOT NULL)
                )
                """);
        });

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Id)
            .HasColumnName("ID")
            .ValueGeneratedOnAdd();

        builder.Property(x => x.GranteeUserId)
            .HasColumnName("GRANTEE_USER_ID");
        
        builder.Property(x => x.GranteeOrgUnitId)
            .HasColumnName("GRANTEE_ORG_UNIT_ID");
        
        builder.Property(x => x.YpodeigmaId)
            .HasColumnName("YPODEIGMA_ID")
            .IsRequired();

        builder.Property(x => x.Permissions)
            .HasColumnName("PERMISSIONS")
            .HasConversion<int>()
            .IsRequired();
        
        builder.Property(x => x.ResponsibleOrgUnitId)
            .HasColumnName("RESPONSIBLE_ORG_UNIT_ID")
            .IsRequired();

        builder.Property(x => x.InsertedByUserId)
            .HasColumnName("INSERTED_BY_USER_ID")
            .IsRequired();

        builder.Property(x => x.InsertedAt)
            .HasColumnName("INSERTED_AT")
            .HasPrecision(3)
            .IsRequired();

        builder.HasOne(x => x.GranteeUser)
            .WithMany(x => x.ReceivedAccessGrants)
            .HasForeignKey(x => x.GranteeUserId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.GranteeOrgUnit)
            .WithMany()
            .HasForeignKey(x => x.GranteeOrgUnitId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.Ypodeigma)
            .WithMany()
            .HasForeignKey(x => x.YpodeigmaId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.ResponsibleOrgUnit)
            .WithMany()
            .HasForeignKey(x => x.ResponsibleOrgUnitId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.InsertedByUser)
            .WithMany(x => x.InsertedAccessGrants)
            .HasForeignKey(x => x.InsertedByUserId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(x => new
        {
            x.YpodeigmaId,
            x.ResponsibleOrgUnitId
        });
    }
}