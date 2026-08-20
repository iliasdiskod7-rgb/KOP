using KOP.Domain.Entities;
using KOP.Domain.Enums;

public class UserRole
{
    public int UserId { get; set; }
    public User User { get; set; } = null!;

    public Role Role { get; set; }

    public int InsertedByUserId { get; set; }
    public User InsertedByUser { get; set; } = null!;
    public DateTime InsertedAt { get; set; }
}