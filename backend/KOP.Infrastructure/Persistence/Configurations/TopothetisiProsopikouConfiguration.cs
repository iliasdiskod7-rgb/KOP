using KOP.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace KOP.Infrastructure.Persistence.Configurations;

public class TopothetisiStelexousConfiguration : IEntityTypeConfiguration<TopothetisiStelexous>
{
    public void Configure(EntityTypeBuilder<TopothetisiStelexous> builder)
    {
        builder.ToTable("INP_ST1_TOPOTHETISEIS_PROSOPIKOU");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Id)
            .HasColumnName("ID")
            .ValueGeneratedOnAdd();

        builder.Property(x => x.PebadaId)
            .HasColumnName("PEBADA_ID")
            .IsRequired();

        builder.Property(x => x.Rank)
            .HasColumnName("RANK")
            .HasMaxLength(50)
            .IsRequired();

        builder.Property(x => x.Eidik)
            .HasColumnName("EIDIK")
            .HasMaxLength(50)
            .IsRequired();

        builder.Property(x => x.Onoma)
            .HasColumnName("ONOMA")
            .HasMaxLength(100)
            .IsRequired();

        builder.Property(x => x.Eponymo)
            .HasColumnName("EPONYMO")
            .HasMaxLength(100)
            .IsRequired();

        builder.Property(x => x.Ama)
            .HasColumnName("AMA")
            .HasMaxLength(50)
            .IsRequired();

        builder.Property(x => x.HstrId)
            .HasColumnName("HSTR_ID")
            .IsRequired();

        builder.Property(x => x.HstrTitle)
            .HasColumnName("HSTR_TITLE")
            .HasMaxLength(200)
            .IsRequired();

        builder.Property(x => x.HstrIdMonadas)
            .HasColumnName("HSTR_ID_MONADAS")
            .IsRequired();

        builder.Property(x => x.HstrTitleMonadas)
            .HasColumnName("HSTR_TITLE_MONADAS")
            .HasMaxLength(200)
            .IsRequired();

        builder.Property(x => x.DateParousiasisEtous)
            .HasColumnName("DATE_PAROUSIASIS_ETOUS")
            .HasColumnType("DATE")
            .IsRequired();

        builder.Property(x => x.DateDiagrafisEtous)
            .HasColumnName("DATE_DIAGRAFIS_ETOUS")
            .HasColumnType("DATE")
            .IsRequired();

        builder.Property(x => x.Imeres)
            .HasColumnName("IMERES")
            .IsRequired();

        builder.Property(x => x.EinaiApospasi)
            .HasColumnName("EINAI_APOSPASI")
            .IsRequired();

        builder.Property(x => x.ApospasiSe)
            .HasColumnName("APOSPASI_SE_HSTR_ID");

        builder.Property(x => x.ApospasiSeTitle)
            .HasColumnName("APOSPASI_SE_HSTR_TITLE")
            .HasMaxLength(200);

        builder.Property(x => x.ExeiApospaseisStoDiastimaTopothetisis)
            .HasColumnName("EXEI_APOSPASEIS_STO_DIASTIMA_TOPOTHETISIS")
            .IsRequired();

        builder.Property(x => x.EtosAnaforas)
            .HasColumnName("ETOS_ANAFORAS")
            .IsRequired();

        builder.Property(x => x.OrgUnitId)
            .HasColumnName("ORG_UNIT_ID")
            .IsRequired();

        builder.Property(x => x.StoixeioKostousId)
            .HasColumnName("STOIXEIO_KOSTOUS_ID")
            .IsRequired();

        builder.Property(x => x.SynoloMiktonApodoxonStelexousStisImeres)
            .HasColumnName("SYNOLO_MIKTON_APODOXON_STELEXOUS_STIS_IMERES")
            .HasPrecision(18, 2)
            .IsRequired();

        builder.HasIndex(x => x.PebadaId);

        builder.HasIndex(x => x.HstrIdMonadas);

        builder.HasIndex(x => new
        {
            x.EtosAnaforas,
            x.OrgUnitId
        });

        builder.HasIndex(x => new
        {
            x.EtosAnaforas,
            x.PebadaId
        });

        builder.HasOne(x => x.OrganizationalUnit)
            .WithMany(x => x.TopothetiseisProsopikou)
            .HasForeignKey(x => x.OrgUnitId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.StoixeioKostous)
            .WithMany(x => x.TopothetiseisProsopikou)
            .HasForeignKey(x => x.StoixeioKostousId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}