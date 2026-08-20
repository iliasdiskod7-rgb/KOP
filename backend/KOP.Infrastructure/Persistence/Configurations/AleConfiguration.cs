using KOP.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace KOP.Infrastructure.Persistence.Configurations;

public class RefAleConfiguration : IEntityTypeConfiguration<Ale>
{
    public void Configure(EntityTypeBuilder<Ale> builder)
    {
        builder.ToTable("REF_ALE");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Id)
            .HasColumnName("ID")
            .ValueGeneratedOnAdd();

        builder.Property(x => x.Kodikos)
            .HasColumnName("KODIKOS")
            .HasMaxLength(10)
            .IsRequired();

        builder.Property(x => x.Perigrafi)
            .HasColumnName("PERIGRAFI")
            .HasMaxLength(200)
            .IsRequired();

        builder.Property(x => x.Katigoria)
            .HasColumnName("KATIGORIA")
            .HasConversion<string>()
            .HasMaxLength(50)
            .IsRequired();

        builder.HasIndex(x => x.Kodikos)
            .IsUnique();
    }
}