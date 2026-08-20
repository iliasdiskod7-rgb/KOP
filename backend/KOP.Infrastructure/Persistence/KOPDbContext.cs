using KOP.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace KOP.Infrastructure.Persistence;

public class KOPDbContext : DbContext
{
    public KOPDbContext(DbContextOptions<KOPDbContext> options) : base(options)
    {
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(KOPDbContext).Assembly);
    }
    
    // REF_ Πίνακες
    public DbSet<Ale> Ale => Set<Ale>();
    public DbSet<KatigoriaPtitikouMesou> KatigoriesPtitikonMeson => Set<KatigoriaPtitikouMesou>();
    public DbSet<KyrioStoixeio> KyriaStoixeia => Set<KyrioStoixeio>();
    public DbSet<OrganizationalUnit> OrganizationalUnits => Set<OrganizationalUnit>();
    public DbSet<StoixeioKostous> StoixeiaKostous => Set<StoixeioKostous>();
    public DbSet<TyposPtitikouMesou> TypoiPtitikonMeson => Set<TyposPtitikouMesou>();
    public DbSet<TyposPtitikouMesouOrgUnit> TypoiPtitikonMesonOrgUnits => Set<TyposPtitikouMesouOrgUnit>();
    public DbSet<YpodeigmaSubmissionScope> YpodeigmaSubmissionScopes => Set<YpodeigmaSubmissionScope>();
    public DbSet<Ypodeigma> Ypodeigmata => Set<Ypodeigma>();

    // SEC_ Πίνακες
    public DbSet<User> Users => Set<User>();
    public DbSet<UserRole> UsersRoles => Set<UserRole>();
    public DbSet<AccessGrant> AccessGrants => Set<AccessGrant>();

    // WF_ Πίνακες
    public DbSet<Submission> Submissions => Set<Submission>();
    public DbSet<SubmissionEvent> SubmissionEvents => Set<SubmissionEvent>();
    public DbSet<SubmissionSubjectOrgUnit> SubmissionSubjectOrgUnits => Set<SubmissionSubjectOrgUnit>();

    // INP_ Πίνακες
    public DbSet<TopothetisiStelexous> TopothetisiProsopikou => Set<TopothetisiStelexous>();
    public DbSet<YpodeigmaEntry> YpodeigmataEntries => Set<YpodeigmaEntry>();
    public DbSet<ValueForAleOdoiporikon> ValuesForAleOdoiporikon => Set<ValueForAleOdoiporikon>();
    
    // CALC_ Πίνακες
    public DbSet<MiktesApodoxesAnaEtosOrgUnitStoixeioKostous> MiktesApodoxesAnaEtosOrgUnitStoixeioKostous => Set<MiktesApodoxesAnaEtosOrgUnitStoixeioKostous>();

}