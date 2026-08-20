using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace KOP.Infrastructure.Persistence.Configurations;

public class UserRoleConfiguration : IEntityTypeConfiguration<UserRole>
{
    public void Configure(EntityTypeBuilder<UserRole> builder)
    {
        builder.ToTable("SEC_USERS_ROLES");

        builder.HasKey(x => new 
        { 
            x.UserId, 
            x.Role 
        });

        builder.Property(x => x.UserId)
            .HasColumnName("USER_ID")
            .IsRequired();

        builder.Property(x => x.Role)
            .HasColumnName("ROLE")
            .HasConversion<string>()
            .HasMaxLength(50)
            .IsRequired();

        builder.Property(x => x.InsertedByUserId)
            .HasColumnName("INSERTED_BY_USER_ID")
            .IsRequired();

        builder.Property(x => x.InsertedAt)
            .HasColumnName("INSERTED_AT")
            .HasPrecision(3)
            .IsRequired();

        builder.HasOne(x => x.User)
            .WithMany(x => x.UserRoles)
            .HasForeignKey(x => x.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(x => x.InsertedByUser)
            .WithMany()
            .HasForeignKey(x => x.InsertedByUserId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}