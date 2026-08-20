using System.ComponentModel;
using System.Reflection;
using KOP.Domain.Common.Attributes;

namespace KOP.Domain.Extensions;

public static class EnumExtensions
{
    public static string GetEnumDescriptionAttribute(this Enum genericEnum)
    {
        Type genericEnumType = genericEnum.GetType();
        MemberInfo[] memberInfo = genericEnumType.GetMember(genericEnum.ToString());
        if (memberInfo != null && memberInfo.Length > 0)
        {
            var attribs = memberInfo[0].GetCustomAttributes(typeof(DescriptionAttribute), false);
            if (attribs != null && attribs.Length > 0)
            {
                return ((DescriptionAttribute)attribs.ElementAt(0)).Description;
            }
        }
        return genericEnum.ToString();
    }

    public static string GetEnumAlternativeDescriptionAttribute(this Enum genericEnum)
    {
        Type genericEnumType = genericEnum.GetType();
        MemberInfo[] memberInfo = genericEnumType.GetMember(genericEnum.ToString());
        if (memberInfo != null && memberInfo.Length > 0)
        {
            var attribs = memberInfo[0].GetCustomAttributes(typeof(AlternativeDescriptionAttribute), false);
            if (attribs != null && attribs.Length > 0)
            {
                return ((AlternativeDescriptionAttribute)attribs.ElementAt(0)).Description;
            }
            else
            {
                attribs = memberInfo[0].GetCustomAttributes(typeof(DescriptionAttribute), false);
                if (attribs != null && attribs.Length > 0)
                {
                    return ((DescriptionAttribute)attribs.ElementAt(0)).Description;
                }
            }
        }
        return genericEnum.ToString();
    }
}