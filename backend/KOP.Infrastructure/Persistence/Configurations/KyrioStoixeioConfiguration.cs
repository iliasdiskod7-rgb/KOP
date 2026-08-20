using KOP.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace KOP.Infrastructure.Persistence.Configurations;

public class KyrioStoixeioConfiguration : IEntityTypeConfiguration<KyrioStoixeio>
{
    public void Configure(EntityTypeBuilder<KyrioStoixeio> builder)
    {
        builder.ToTable("REF_KYRIA_STOIXEIA");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Id)
            .HasColumnName("ID")
            .ValueGeneratedOnAdd();

        builder.Property(x => x.Onomasia)
            .HasColumnName("ONOMASIA")
            .HasMaxLength(200)
            .IsRequired();

        builder.Property(x => x.Perigrafi)
            .HasColumnName("PERIGRAFI")
            .HasMaxLength(1000);
    }
}