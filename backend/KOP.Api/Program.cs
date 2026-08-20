using System.IdentityModel.Tokens.Jwt;
using System.Text;
using System.Text.Json.Serialization;
using KOP.Api.Middleware;
using KOP.Application.Features.App.Services;
using KOP.Application.Features.Auth;
using KOP.Application.Features.Prosopiko.Services;
using KOP.Application.Features.YpodeigmaSubmission.Services;
using KOP.Application.Interfaces;
using KOP.Application.Interfaces.Repositories;
using KOP.Application.Interfaces.Services;
using KOP.Infrastructure.Authentication;
using KOP.Infrastructure.Persistence;
using KOP.Infrastructure.Persistence.Repositories;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using Microsoft.IdentityModel.Tokens;
using Serilog;


//////////////////////////////////
/// Add services to the container
//////////////////////////////////

// Create builder
var builder = WebApplication.CreateBuilder(args);

// Configure Serilog
Log.Logger = new LoggerConfiguration()
   .ReadFrom.Configuration(new ConfigurationBuilder().AddJsonFile("appsettings.json").Build())
   .CreateLogger();
builder.Host.UseSerilog();

// Add Controllers and Http Accessor
builder.Services
    .AddControllers()
    .AddJsonOptions(options => options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter()));
builder.Services.AddHttpContextAccessor();

// Ανάκτηση τιμών για JWT.
var jwtOptions = builder.Configuration
    .GetSection(KopJwtOptions.SectionName)
    .Get<KopJwtOptions>()
    ?? throw new InvalidOperationException("[HAF0003] Missing Jwt configuration.");

// Add Authentication
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
                .AddJwtBearer(options =>
                {
                    // Για να παραμείνει το claim "sub" ως "sub"
                    // και να μη γίνει map σε legacy claim type.
                    options.MapInboundClaims = false;
                    options.RequireHttpsMetadata = true;
                    options.TokenValidationParameters = new TokenValidationParameters()
                    {
                        ValidateIssuer = true,
                        ValidIssuer = jwtOptions.Issuer,
                        
                        ValidateAudience = true,
                        ValidAudience = jwtOptions.Audience,
                        
                        ValidateLifetime = true,
                        
                        ValidateIssuerSigningKey = true,
                        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtOptions.SigningKey)),
                        
                        ClockSkew = TimeSpan.FromMinutes(1),
                        NameClaimType = JwtRegisteredClaimNames.Sub
                    };

                    // Εδώ ρυθμίζουμε τις απαντήσεις στο UI όταν το HTTP status 
                    // είναι 401 ή 403, το οποίο προκαλείται από το [Authorize]  
                    // στους controllers και όχι από το ExceptionMiddleware.
                    options.Events = new JwtBearerEvents
                    {
                        OnChallenge = async context =>
                        {
                            // Αποτρέπει την προεπιλεγμένη κενή απάντηση.
                            context.HandleResponse();

                            if (context.Response.HasStarted)
                            {
                                return;
                            }

                            context.Response.StatusCode =
                                StatusCodes.Status401Unauthorized;

                            context.Response.ContentType =
                                "application/problem+json";

                            // Το 401 πρέπει να περιλαμβάνει authentication challenge.
                            context.Response.Headers.WWWAuthenticate = "Bearer";

                            var response = new
                            {
                                status = StatusCodes.Status401Unauthorized,
                                title = "Unauthorized",
                                detail = "[HAF0013] Δεν έχετε πιστοποιηθεί ή το token δεν είναι έγκυρο."
                            };

                            await context.Response.WriteAsJsonAsync(response);
                        },

                        OnForbidden = async context =>
                        {
                            if (context.Response.HasStarted)
                            {
                                return;
                            }

                            context.Response.StatusCode =
                                StatusCodes.Status403Forbidden;

                            context.Response.ContentType =
                                "application/problem+json";

                            var response = new
                            {
                                status = StatusCodes.Status403Forbidden,
                                title = "Forbidden",
                                detail = "[HAF0014] Δεν έχετε δικαίωμα πρόσβασης στον συγκεκριμένο πόρο."
                            };

                            await context.Response.WriteAsJsonAsync(response);
                        }
                    };
                });

// Add Authorization
builder.Services.AddAuthorization();

// Add OpenApi
builder.Services.AddOpenApi();

// Add Oracle Connection
builder.Services.AddDbContext<KOPDbContext>(options =>
{
    options.UseOracle(
        builder.Configuration.GetConnectionString("OracleConnection"),
        oracleOptions => oracleOptions.UseOracleSQLCompatibility(OracleSQLCompatibility.DatabaseVersion19)
    );
});

// Add App Health Checks
builder.Services
    .AddHealthChecks()
    .AddDbContextCheck<KOPDbContext>(
        name: "database",
        failureStatus: HealthStatus.Unhealthy,
        tags: ["ready"]);

// Link classes with interfaces
// Misc
builder.Services.Configure<KopJwtOptions>(builder.Configuration.GetSection(KopJwtOptions.SectionName));
builder.Services.AddSingleton(TimeProvider.System);
builder.Services.AddScoped<IJwtTokenBuilder, JwtTokenBuilder>();
builder.Services.AddScoped<IUserCredentialValidator, DbUserCredentialValidator>();

// Services
builder.Services.AddScoped<IAppService, AppService>();
builder.Services.AddScoped<IProsopikoService, ProsopikoService>();
builder.Services.AddScoped<IAuthenticationService, AuthenticationService>();
builder.Services.AddScoped<IYpodeigmaSubmissionService, YpodeigmaSubmissionService>();
builder.Services.AddScoped<IYpodeigmaSubmissionValidationService, YpodeigmaSubmissionValidationService>();
builder.Services.AddScoped<IYpodeigmaAuthorizationService, YpodeigmaAuthorizationService>();

// Repositories
builder.Services.AddScoped<IAccessRepository, AccessRepository>();
builder.Services.AddScoped<IUsersRepository, UsersRepository>();
builder.Services.AddScoped<IProsopikoRepository, MockProsopikoRepository>();
builder.Services.AddScoped<ISubmissionsRepository, SubmissionsRepository>();
builder.Services.AddScoped<IYpodeigmataRepository, YpodeigmataRepository>();
builder.Services.AddScoped<IOrganizationalUnitsRepository, OrganizationalUnitsRepository>();
builder.Services.AddScoped<IStoixeiaKostousRepository, StoixeiaKostousRepository>();

// Build app
var app = builder.Build();



/////////////////////////////////////////
/// Configure the HTTP request pipeline.
/////////////////////////////////////////
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

// Serilog
app.UseSerilogRequestLogging();

// Global Error Handling
app.UseMiddleware<ExceptionMiddleware>();

// Security
app.UseHttpsRedirection();

// Authentication & Authorization
app.UseAuthentication();
app.UseAuthorization();

// Activate Controllers
app.MapControllers();

// App Health Endpoints
app.MapHealthChecks(
    "/api/health/live",
    new HealthCheckOptions
    {
        Predicate = _ => false
    })
    .AllowAnonymous();

app.MapHealthChecks(
    "/api/health/ready",
    new HealthCheckOptions
    {
        Predicate = healthCheck =>
            healthCheck.Tags.Contains("ready")
    })
    .AllowAnonymous();


////////////
/// Run app
////////////
app.Run();