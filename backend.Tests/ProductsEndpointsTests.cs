using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using System.Linq;
using Xunit;
using Xunit.Sdk;
using System.Net.Http;
using System;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Net.Http.Json;
using System.Threading.Tasks;

namespace Backend.Tests
{
    public class ProductsEndpointsTests : IClassFixture<WebApplicationFactory<Program>>
    {
        private readonly HttpClient _client;

        public ProductsEndpointsTests(WebApplicationFactory<Program> factory)
        {
            var customFactory = factory.WithWebHostBuilder(builder =>
            {
                builder.ConfigureServices(services =>
                {
                    // Remove todos os registros de AppDbContext e DbContextOptions
                    var dbContextDescriptors = services.Where(d =>
                        d.ServiceType == typeof(DbContextOptions<ProductsDotnetApi.Data.AppDbContext>) ||
                        d.ServiceType == typeof(ProductsDotnetApi.Data.AppDbContext)).ToList();
                    foreach (var descriptor in dbContextDescriptors)
                        services.Remove(descriptor);

                    // Adiciona o contexto InMemory
                    services.AddDbContext<ProductsDotnetApi.Data.AppDbContext>(options =>
                    {
                        options.UseInMemoryDatabase("TestDb");
                    });
                });
            });
            _client = customFactory.CreateClient();
            _client.DefaultRequestHeaders.Add("Authorization", $"Bearer {GenerateJwtToken()}");
        }

        [Fact]
        public async Task GetProducts_ReturnsSuccess()
        {
            var response = await _client.GetAsync("/produtos");
            response.EnsureSuccessStatusCode();
        }

        [Fact]
        public async Task CreateProduct_ReturnsCreated()
        {
            var product = new
            {
                code = "TESTE123",
                description = "Produto de Teste",
                departmentId = 1,
                price = 10.5m
            };
            var response = await _client.PostAsJsonAsync("/produtos", product);
            Assert.Equal(System.Net.HttpStatusCode.Created, response.StatusCode);
        }

        [Fact]
        public async Task UpdateProduct_ReturnsOk()
        {
            var product = new
            {
                code = "UPDATE123",
                description = "Produto para Atualizar",
                departmentId = 1,
                price = 15.0m
            };
            var createResponse = await _client.PostAsJsonAsync("/produtos", product);
            var created = await createResponse.Content.ReadFromJsonAsync<ProductResponse>();

            var update = new
            {
                description = "Produto Atualizado",
                departmentId = 2,
                price = 20.0m
            };
            var response = await _client.PutAsJsonAsync($"/produtos/{created.Id}", update);
            Assert.Equal(System.Net.HttpStatusCode.OK, response.StatusCode);
        }

        [Fact]
        public async Task DeleteProduct_ReturnsNoContent()
        {
            var product = new
            {
                code = "DELETE123",
                description = "Produto para Deletar",
                departmentId = 1,
                price = 12.0m
            };
            var createResponse = await _client.PostAsJsonAsync("/produtos", product);
            var created = await createResponse.Content.ReadFromJsonAsync<ProductResponse>();

            var response = await _client.DeleteAsync($"/produtos/{created.Id}");
            Assert.Equal(System.Net.HttpStatusCode.NoContent, response.StatusCode);
        }

        private string GenerateJwtToken()
        {
            var securityKey = new SymmetricSecurityKey(System.Text.Encoding.UTF8.GetBytes("super_secret_jwt_key_1234567890_abcdefg"));
            var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);
            var header = new JwtHeader(credentials);
            var payload = new JwtPayload(
                issuer: "products-api",
                audience: "products-api",
                claims: null,
                notBefore: DateTime.UtcNow,
                expires: DateTime.UtcNow.AddMinutes(30)
            );
            var token = new JwtSecurityToken(header, payload);
            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        public class ProductResponse
        {
            public Guid Id { get; set; }
            public string Code { get; set; }
            public string Description { get; set; }
            public int DepartmentId { get; set; }
            public decimal Price { get; set; }
        }
    }
}
