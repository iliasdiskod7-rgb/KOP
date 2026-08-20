namespace KOP.Domain.Enums;

[Flags]
public enum AccessPermission
{
    None = 0,
    View = 1,
    Edit = 2,
    Submit = 4,
    Return = 8
}