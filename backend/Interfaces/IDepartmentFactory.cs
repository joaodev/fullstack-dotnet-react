namespace Backend.Interfaces
{
    using ProductsDotnetApi.Models;
    public interface IDepartmentFactory
    {
        Department Create(string name);
    }
}
