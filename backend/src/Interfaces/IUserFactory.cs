namespace Backend.Interfaces
{
    using ProductsDotnetApi.Models;
    /// <summary>
    /// Interface para factory de User.
    /// </summary>
    public interface IUserFactory
    {
        User Create(string name, string email, string passwordHash);
    }
}
