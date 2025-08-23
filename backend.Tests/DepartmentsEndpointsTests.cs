using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using System.Linq;
using Xunit;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System;
using System.Net.Http;
using System.Net.Http.Json;
using System.Threading.Tasks;

public class DepartmentsEndpointsTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly HttpClient _client;
    private readonly WebApplicationFactory<Program> factory;

    public DepartmentsEndpointsTests(WebApplicationFactory<Program> factory)
        {
            this.factory = factory;
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
    public async Task GetDepartments_ReturnsSuccess()
    {
        var response = await _client.GetAsync("/departamentos");
        response.EnsureSuccessStatusCode();
    }

        [Fact]
        public async Task GetDepartmentsTotal_ReturnsSuccessAndCorrectCount()
        {
        // Limpa o banco antes do teste
        var db = GetDbContext();
        db.Departments.RemoveRange(db.Departments);
        db.SaveChanges();
        // Cria 2 departamentos ativos
        var dep1 = new { name = "Departamento 1" };
        var dep2 = new { name = "Departamento 2" };
        await _client.PostAsJsonAsync("/departamentos", dep1);
        await _client.PostAsJsonAsync("/departamentos", dep2);
            var response = await _client.GetAsync("/departamentos/total");
            response.EnsureSuccessStatusCode();
        var json = await response.Content.ReadAsStringAsync();
        using var doc = System.Text.Json.JsonDocument.Parse(json);
        var total = doc.RootElement.GetProperty("total").GetInt32();
        Assert.Equal(2, total);
        }

    [Fact]
    public async Task CreateDepartment_ReturnsCreated()
    {
        var department = new { name = "Departamento Teste" };
        var response = await _client.PostAsJsonAsync("/departamentos", department);
        Assert.Equal(System.Net.HttpStatusCode.Created, response.StatusCode);
    }

    [Fact]
    public async Task CreateDepartment_Invalid_ReturnsBadRequest()
    {
        var department = new { name = "" };
        var response = await _client.PostAsJsonAsync("/departamentos", department);
        Assert.Equal(System.Net.HttpStatusCode.BadRequest, response.StatusCode);
    }


    // PUT não é implementado para departamentos

    [Fact]
    public async Task DeleteDepartment_ReturnsNoContentOrNotFound()
    {
        var department = new { name = "Departamento Deletar" };
        var createResponse = await _client.PostAsJsonAsync("/departamentos", department);
        var created = await createResponse.Content.ReadFromJsonAsync<DepartmentResponse>();

        var response = await _client.DeleteAsync($"/departamentos/{created.Id}");
        Assert.Contains(response.StatusCode, new[] { System.Net.HttpStatusCode.NoContent, System.Net.HttpStatusCode.NotFound });
    }

    public class DepartmentResponse
    {
    public int Id { get; set; }
        public string Name { get; set; }
        public bool Status { get; set; }
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
}
