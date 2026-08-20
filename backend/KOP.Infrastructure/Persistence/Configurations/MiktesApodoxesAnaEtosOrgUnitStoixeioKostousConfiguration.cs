using KOP.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace KOP.Infrastructure.Persistence.Configurations;

public class MiktesApodoxesAnaEtosOrgUnitStoixeioKostousConfiguration 
    : IEntityTypeConfiguration<MiktesApodoxesAnaEtosOrgUnitStoixeioKostous>
{
    public void Configure(EntityTypeBuilder<MiktesApodoxesAnaEtosOrgUnitStoixeioKostous> builder)
    {
        builder.ToTable("CALC_ST1_MIKTES_APODOXES_ANA_ETOS_ORG_UNIT_STOIXEIO_KOSTOUS");

        builder.HasKey(x => new
        {
            x.EtosAnaforas,
            x.OrgUnitId,
            x.StoixeioKostousId
        });

        builder.Property(x => x.EtosAnaforas)
            .HasColumnName("ETOS_ANAFORAS")
            .IsRequired();

        builder.Property(x => x.OrgUnitId)
            .HasColumnName("ORG_UNIT_ID")
            .IsRequired();

        builder.Property(x => x.StoixeioKostousId)
            .HasColumnName("STOIXEIO_KOSTOUS_ID")
            .IsRequired();

        builder.Property(x => x.Value)
            .HasColumnName("VALUE")
            .HasPrecision(18, 2)
            .IsRequired();

        builder.HasOne(x => x.OrgUnit)
            .WithMany(x => x.MiktesApodoxesAnaEtosOrgUnitStoixeioKostous)
            .HasForeignKey(x => x.OrgUnitId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.StoixeioKostous)
            .WithMany(x => x.MiktesApodoxesAnaEtosOrgUnitStoixeioKostous)
            .HasForeignKey(x => x.StoixeioKostousId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}