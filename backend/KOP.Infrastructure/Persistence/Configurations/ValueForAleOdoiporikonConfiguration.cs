using KOP.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace KOP.Infrastructure.Persistence.Configurations;

public class ValueForAleOdoiporikonConfiguration
    : IEntityTypeConfiguration<ValueForAleOdoiporikon>
{
    public void Configure(EntityTypeBuilder<ValueForAleOdoiporikon> builder)
    {
        builder.ToTable("INP_VALUES_FOR_ALE_ODOIPORIKON");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Id)
            .HasColumnName("ID")
            .ValueGeneratedOnAdd();

        builder.Property(x => x.EntryId)
            .HasColumnName("ENTRY_ID")
            .IsRequired();

        builder.Property(x => x.AleId)
            .HasColumnName("ALE_ID")
            .IsRequired();

        builder.Property(x => x.Value)
            .HasColumnName("VALUE")
            .HasPrecision(18, 2)
            .IsRequired();

        builder.HasOne(x => x.Entry)
            .WithMany()
            .HasForeignKey(x => x.EntryId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.Ale)
            .WithMany()
            .HasForeignKey(x => x.AleId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(x => new
        {
            x.EntryId,
            x.AleId
        })
        .IsUnique();
    }
}