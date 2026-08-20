using KOP.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace KOP.Infrastructure.Persistence.Configurations;

public class TyposPtitikouMesouOrgUnitConfiguration
    : IEntityTypeConfiguration<TyposPtitikouMesouOrgUnit>
{
    public void Configure(EntityTypeBuilder<TyposPtitikouMesouOrgUnit> builder)
    {
        builder.ToTable("REF_TYPOI_PTITIKON_MESON_ORG_UNITS");

        builder.HasKey(x => new
        {
            x.TyposPtitikouMesouId,
            x.OrgUnitId
        });

        builder.Property(x => x.TyposPtitikouMesouId)
            .HasColumnName("TYPOS_PTITIKOU_MESOU_ID")
            .IsRequired();

        builder.Property(x => x.OrgUnitId)
            .HasColumnName("ORG_UNIT_ID")
            .IsRequired();

        builder.HasOne(x => x.TyposPtitikouMesou)
            .WithMany(x => x.TypoiPtitikonMesonOrgUnits)
            .HasForeignKey(x => x.TyposPtitikouMesouId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.OrgUnit)
            .WithMany(x => x.TypoiPtitikonMesonOrgUnits)
            .HasForeignKey(x => x.OrgUnitId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(x => x.OrgUnitId);
    }
}