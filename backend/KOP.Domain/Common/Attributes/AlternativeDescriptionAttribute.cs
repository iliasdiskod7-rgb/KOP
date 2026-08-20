using System.ComponentModel;

namespace KOP.Domain.Common.Attributes;

[AttributeUsage(AttributeTargets.Field, AllowMultiple = false)]
public sealed class AlternativeDescriptionAttribute : DescriptionAttribute
{
    public AlternativeDescriptionAttribute(string description)
        : base(description)
    {
    }
}