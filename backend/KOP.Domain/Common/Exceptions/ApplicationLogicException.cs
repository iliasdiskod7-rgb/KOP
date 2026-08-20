namespace KOP.Domain.Common.Exceptions;

public sealed class ApplicationLogicException : Exception
{
    public ApplicationLogicException(string message) : base(message)
    {
    }
}