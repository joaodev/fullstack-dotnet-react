namespace Backend.Interfaces
{
    using ProductsDotnetApi.Models;
    public interface IUserFactory
    {
        User Create(string name, string email, string passwordHash);
    }
}
