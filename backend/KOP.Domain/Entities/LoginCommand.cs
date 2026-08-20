namespace KOP.Domain.Entities;

public sealed record LoginCommand(
    string Username,
    string Password
);