using KOP.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace KOP.Infrastructure.Persistence.Configurations;

public class StoixeioKostousConfiguration : IEntityTypeConfiguration<StoixeioKostous>
{
    public void Configure(EntityTypeBuilder<StoixeioKostous> builder)
    {
        builder.ToTable("REF_STOIXEIA_KOSTOUS");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Id)
            .HasColumnName("ID")
            .ValueGeneratedOnAdd();

        builder.Property(x => x.Kodikos)
            .HasColumnName("KODIKOS")
            .HasMaxLength(100)
            .IsRequired();

        builder.Property(x => x.EpipedoAnalysis)
            .HasColumnName("EPIPEDO_ANALYSIS")
            .IsRequired();

        builder.Property(x => x.Onomasia)
            .HasColumnName("ONOMASIA")
            .HasMaxLength(200)
            .IsRequired();

        builder.Property(x => x.EinaiXamiloteroEpipedo)
            .HasColumnName("EINAI_XAMILOTERO_EPIPEDO")
            .IsRequired();

        builder.Property(x => x.KyrioStoixeioId)
            .HasColumnName("KYRIO_STOIXEIO_ID")
            .IsRequired();

        builder.HasOne(x => x.KyrioStoixeio)
            .WithMany(x => x.StoixeiaKostous)
            .HasForeignKey(x => x.KyrioStoixeioId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}