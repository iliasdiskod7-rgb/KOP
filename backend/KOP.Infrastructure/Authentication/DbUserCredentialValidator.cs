using KOP.Application.Interfaces;
using KOP.Domain.Entities;
using KOP.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace KOP.Infrastructure.Authentication;

public sealed class DbUserCredentialValidator(KOPDbContext _db) : IUserCredentialValidator
{
    public async Task<AuthenticatedUser?> ValidateAsync(
        string username,
        string password,
        CancellationToken cancellationToken)
    {
        int pebadaId = 0;
        
        if (username == "rammos" && password == "123!")
            pebadaId = 99002;
        else if (username == "mpoukouvalas" && password == "123!")
            pebadaId = 99003;
        else if (username == "grigoriadis" && password == "123!")
            pebadaId = 99001;
        else if (username == "georgakopoulos" && password == "123!")
            pebadaId = 99010;
        else if (username == "mavros_gea" && password == "123!")
            pebadaId = 99011;
        else if (username == "georgiou_ata" && password == "123!")
            pebadaId = 99004;
        else if (username == "dimitriou_day" && password == "123!")
            pebadaId = 99005;
        else if (username == "garmpilis_110" && password == "123!")
            pebadaId = 99006;
        else if (username == "papadopoulos_115" && password == "123!")
            pebadaId = 99007;
        else if (username == "kiouloglou_116" && password == "123!")
            pebadaId = 99008;
        else if (username == "andreadakis_112" && password == "123!")
            pebadaId = 99009;
        else if (username == "dionysiou_113" && password == "123!")
            pebadaId = 99012;
        
        var user = await _db.Users.SingleOrDefaultAsync(x => x.ExternalId == pebadaId, cancellationToken);

        if (user is null)
            return null;

        if (!user.IsActive)
            return null;

        return new AuthenticatedUser(user.Id);
    }
}