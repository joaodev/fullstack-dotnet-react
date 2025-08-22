namespace Backend.Factories
{
    using ProductsDotnetApi.Models;
    using Backend.Interfaces;
    public class DepartmentFactory : IDepartmentFactory
    {
        public Department Create(string name)
        {
            return new Department
            {
                Name = name
            };
        }
    }
}
