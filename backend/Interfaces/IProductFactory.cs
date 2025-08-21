namespace Backend.Interfaces
{
    using ProductsDotnetApi.Models;
    public interface IProductFactory
    {
        Product Create(string code, string description, int departmentId, decimal price, bool status);
    }
}
