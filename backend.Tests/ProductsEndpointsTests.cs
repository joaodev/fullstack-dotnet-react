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
        private readonly WebApplicationFactory<Program> factory;

        public ProductsEndpointsTests(WebApplicationFactory<Program> factory)
        {
            this.factory = factory;
            _client = factory.CreateClient();
            _client.DefaultRequestHeaders.Add("Authorization", $"Bearer {GenerateJwtToken()}");
        }

        [Fact]
        public async Task GetProducts_ReturnsSuccess()
        {
            var response = await _client.GetAsync("/produtos");
            response.EnsureSuccessStatusCode();
        }

        [Fact]
        public async Task GetProductsTotal_ReturnsSuccessAndCorrectCount()
        {
            // Limpa o banco antes do teste
            var db = GetDbContext();
            db.Products.RemoveRange(db.Products);
            db.Departments.RemoveRange(db.Departments);
            db.SaveChanges();
            // Cria departamento necessário
            var dep = new { name = "Departamento Teste" };
            var depResp = await _client.PostAsJsonAsync("/departamentos", dep);
            var depJson = await depResp.Content.ReadAsStringAsync();
            using var depDoc = System.Text.Json.JsonDocument.Parse(depJson);
            var depId = depDoc.RootElement.GetProperty("id").GetInt32();
            // Cria 2 produtos ativos
            var product1 = new { code = "CODE1", description = "Produto 1", departmentId = depId, price = 10.0m, status = true };
            var product2 = new { code = "CODE2", description = "Produto 2", departmentId = depId, price = 20.0m, status = true };
            await _client.PostAsJsonAsync("/produtos", product1);
            await _client.PostAsJsonAsync("/produtos", product2);
            var response = await _client.GetAsync("/produtos/total");
            response.EnsureSuccessStatusCode();
            var json = await response.Content.ReadAsStringAsync();
            using var doc = System.Text.Json.JsonDocument.Parse(json);
            var total = doc.RootElement.GetProperty("total").GetInt32();
            Assert.Equal(2, total);
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
            ProductResponse created = null;
            if (createResponse.StatusCode == System.Net.HttpStatusCode.Created)
                created = await createResponse.Content.ReadFromJsonAsync<ProductResponse>();

            var update = new
            {
                description = "Produto Atualizado",
                departmentId = 2,
                price = 20.0m
            };
            var response = await _client.PutAsJsonAsync($"/produtos/{created?.Id}", update);
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
            ProductResponse created = null;
            if (createResponse.StatusCode == System.Net.HttpStatusCode.Created)
                created = await createResponse.Content.ReadFromJsonAsync<ProductResponse>();

            var response = await _client.DeleteAsync($"/produtos/{created?.Id}");
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

        private ProductsDotnetApi.Data.AppDbContext GetDbContext()
        {
            var scopeFactory = factory.Services.GetService(typeof(IServiceScopeFactory)) as IServiceScopeFactory;
            var scope = scopeFactory.CreateScope();
            return scope.ServiceProvider.GetRequiredService<ProductsDotnetApi.Data.AppDbContext>();
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
