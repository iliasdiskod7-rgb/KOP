using KOP.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace KOP.Infrastructure.Persistence.Configurations;

public class KatigoriaPtitikouMesouConfiguration : IEntityTypeConfiguration<KatigoriaPtitikouMesou>
{
    public void Configure(EntityTypeBuilder<KatigoriaPtitikouMesou> builder)
    {
        builder.ToTable("REF_KATIGORIES_PTITIKON_MESON");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Id)
            .HasColumnName("ID")
            .ValueGeneratedOnAdd();

        builder.Property(x => x.Onomasia)
            .HasColumnName("ONOMASIA")
            .HasMaxLength(200)
            .IsRequired();
    }
}