namespace Backend.Interfaces
{
    using ProductsDotnetApi.Models;
    /// <summary>
    /// Interface para factory de Department.
    /// </summary>
    public interface IDepartmentFactory
    {
        Department Create(string name);
    }
}
