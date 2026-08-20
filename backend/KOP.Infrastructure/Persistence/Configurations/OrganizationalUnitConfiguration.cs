using KOP.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace KOP.Infrastructure.Persistence.Configurations;

public class OrganizationalUnitConfiguration : IEntityTypeConfiguration<OrganizationalUnit>
{
    public void Configure(EntityTypeBuilder<OrganizationalUnit> builder)
    {
        builder.ToTable("REF_ORGANIZATIONAL_UNITS");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Id)
            .HasColumnName("ID")
            .ValueGeneratedOnAdd();

        builder.Property(x => x.HstrId)
            .HasColumnName("HSTR_ID")
            .IsRequired();

        builder.Property(x => x.ParentId)
            .HasColumnName("PARENT_ID");

        builder.Property(x => x.Onomasia)
            .HasColumnName("ONOMASIA")
            .HasMaxLength(200)
            .IsRequired();

        builder.Property(x => x.UnitType)
            .HasColumnName("UNIT_TYPE")
            .HasConversion<string>()
            .HasMaxLength(50)
            .IsRequired();

        builder.HasOne(x => x.Parent)
            .WithMany(x => x.Children)
            .HasForeignKey(x => x.ParentId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(x => x.HstrId)
            .IsUnique();

        builder.HasIndex(x => x.ParentId);
    }
}