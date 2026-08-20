using KOP.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace KOP.Infrastructure.Persistence.Configurations;

public class TyposPtitikouMesouConfiguration : IEntityTypeConfiguration<TyposPtitikouMesou>
{
    public void Configure(EntityTypeBuilder<TyposPtitikouMesou> builder)
    {
        builder.ToTable("REF_TYPOI_PTITIKON_MESON");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Id)
            .HasColumnName("ID")
            .ValueGeneratedOnAdd();

        builder.Property(x => x.Onomasia)
            .HasColumnName("ONOMASIA")
            .HasMaxLength(200)
            .IsRequired();

        builder.Property(x => x.KatigoriaPtitikouMesouId)
            .HasColumnName("KATIGORIA_PTITIKOU_MESOU_ID")
            .IsRequired();

        builder.HasOne(x => x.KatigoriaPtitikouMesou)
            .WithMany(x => x.TypoiPtitikonMeson)
            .HasForeignKey(x => x.KatigoriaPtitikouMesouId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}