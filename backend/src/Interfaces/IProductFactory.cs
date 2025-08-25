namespace Backend.Interfaces
{
    using ProductsDotnetApi.Models;
    /// <summary>
    /// Interface para factory de Product.
    /// </summary>
    public interface IProductFactory
    {
        Product Create(string code, string description, int departmentId, decimal price, bool status);
    }
}
