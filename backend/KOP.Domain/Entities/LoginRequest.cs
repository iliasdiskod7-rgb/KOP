namespace KOP.Domain.Entities;

public sealed record LoginRequest(
    string Username,
    string Password
);