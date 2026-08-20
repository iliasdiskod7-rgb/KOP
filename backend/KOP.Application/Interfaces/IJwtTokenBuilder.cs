using KOP.Domain.Entities;

namespace KOP.Application.Interfaces;

public interface IJwtTokenBuilder
{
    AccessTokenResult BuildToken(int userId);
}