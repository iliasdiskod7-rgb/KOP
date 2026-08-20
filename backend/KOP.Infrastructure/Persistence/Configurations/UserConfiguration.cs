using KOP.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace KOP.Infrastructure.Persistence.Configurations;

public class UserConfiguration : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> builder)
    {
        builder.ToTable("SEC_USERS");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Id)
            .HasColumnName("ID")
            .ValueGeneratedOnAdd();

        builder.Property(x => x.ExternalId)
            .HasColumnName("EXTERNAL_ID")
            .IsRequired();

        builder.Property(x => x.Onoma)
            .HasColumnName("ONOMA")
            .HasMaxLength(100)
            .IsRequired();

        builder.Property(x => x.Eponymo)
            .HasColumnName("EPONYMO")
            .HasMaxLength(100)
            .IsRequired();

        builder.Property(x => x.AMA)
            .HasColumnName("AMA")
            .HasMaxLength(50)
            .IsRequired();

        builder.Property(x => x.Vathmos)
            .HasColumnName("VATHMOS")
            .HasMaxLength(50)
            .IsRequired();

        builder.Property(x => x.Eidikotita)
            .HasColumnName("EIDIKOTITA")
            .HasMaxLength(50)
            .IsRequired();

        builder.Property(x => x.Epistasia)
            .HasColumnName("EPISTASIA")
            .HasMaxLength(100)
            .IsRequired();

        builder.Property(x => x.PhoneNumber)
            .HasColumnName("PHONE_NUMBER")
            .HasMaxLength(50);

        builder.Property(x => x.OrgUnitId)
            .HasColumnName("ORG_UNIT_ID")
            .IsRequired();

        builder.Property(x => x.IsActive)
            .HasColumnName("IS_ACTIVE")
            .IsRequired();

        builder.HasOne(x => x.OrgUnit)
            .WithMany(x => x.Users)
            .HasForeignKey(x => x.OrgUnitId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(x => x.ExternalId)
            .IsUnique();

        builder.HasIndex(x => x.AMA);

        builder.HasIndex(x => x.OrgUnitId);
    }
}