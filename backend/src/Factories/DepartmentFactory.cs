namespace Backend.Factories
{
    using ProductsDotnetApi.Models;
    using Backend.Interfaces;
    /// <summary>
    /// Factory para instanciar objetos Department.
    /// </summary>
    public class DepartmentFactory : IDepartmentFactory
    {
        public Department Create(string name)
        {
            return new Department
            {
                Name = name,
                Status = true
            };
        }
    }
}
