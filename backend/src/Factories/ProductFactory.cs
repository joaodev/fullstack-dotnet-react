namespace Backend.Factories
{
    using ProductsDotnetApi.Models;
    using Backend.Interfaces;
    /// <summary>
    /// Factory para instanciar objetos Product.
    /// </summary>
    public class ProductFactory : IProductFactory
    {
        public Product Create(string code, string description, int departmentId, decimal price, bool status)
        {
            return new Product
            {
                Code = code,
                Description = description,
                DepartmentId = departmentId,
                Price = price,
                Status = status
            };
        }
    }
}
