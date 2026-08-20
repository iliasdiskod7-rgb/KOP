using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;

namespace KOP.Infrastructure.Persistence;

/// <summary>
/// Αυτή η κλάση χρησιμοποιείται για να δημιουργηθεί το DbContext σε design time,
/// ώστε να εκτελεστούν τα migrations του EF.
/// </summary>
public class KOPDbContextFactory : IDesignTimeDbContextFactory<KOPDbContext>
{
    public KOPDbContext CreateDbContext(string[] args)
    {
        IConfiguration config = new ConfigurationBuilder()
            .SetBasePath(Directory.GetCurrentDirectory())
            .AddJsonFile("appsettings.Development.json", optional: false)
            .Build();
            
        var optionsBuilder = new DbContextOptionsBuilder<KOPDbContext>();

        optionsBuilder.UseOracle(
            config.GetConnectionString("OracleConnection"),
            oracleOptions => oracleOptions.UseOracleSQLCompatibility(OracleSQLCompatibility.DatabaseVersion19)
        );

        return new KOPDbContext(optionsBuilder.Options);
    }
}