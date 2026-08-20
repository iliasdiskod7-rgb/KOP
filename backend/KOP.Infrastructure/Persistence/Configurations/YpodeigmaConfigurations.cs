using KOP.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace KOP.Infrastructure.Persistence.Configurations;

public class YpodeigmaConfiguration : IEntityTypeConfiguration<Ypodeigma>
{
    public void Configure(EntityTypeBuilder<Ypodeigma> builder)
    {
        builder.ToTable("REF_YPODEIGMATA");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Id)
            .HasColumnName("ID")
            .ValueGeneratedOnAdd();

        builder.Property(x => x.Title)
            .HasColumnName("TITLE")
            .HasMaxLength(200)
            .IsRequired();

        builder.Property(x => x.Perigrafi)
            .HasColumnName("PERIGRAFI")
            .HasMaxLength(1000);

        builder.Property(x => x.YpodeigmaType)
            .HasColumnName("YPODEIGMA_TYPE")
            .HasConversion<string>()
            .HasMaxLength(50)
            .IsRequired();

        builder.Property(x => x.IsActive)
            .HasColumnName("IS_ACTIVE")
            .IsRequired();

        builder.Property(x => x.KyrioStoixeioId)
            .HasColumnName("KYRIO_STOIXEIO_ID")
            .IsRequired();

        builder.HasOne(x => x.KyrioStoixeio)
            .WithMany(x => x.Ypodeigmata)
            .HasForeignKey(x => x.KyrioStoixeioId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}