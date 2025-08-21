namespace Backend.Factories
{
    using ProductsDotnetApi.Models;
    using Backend.Interfaces;
    public class UserFactory : IUserFactory
    {
        public User Create(string name, string email, string passwordHash)
        {
            return new User
            {
                Name = name,
                Email = email,
                PasswordHash = passwordHash
            };
        }
    }
}
