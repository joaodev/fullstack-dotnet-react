// using Microsoft.EntityFrameworkCore.InMemory; // Não é necessário, basta o Microsoft.EntityFrameworkCore
using Xunit;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System;
using System.Net.Http;
using System.Net.Http.Json;
using System.Threading.Tasks;

using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using System.Linq;

public class UsersEndpointsTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly HttpClient _client;

    public UsersEndpointsTests(WebApplicationFactory<Program> factory)
    {
        var customFactory = factory.WithWebHostBuilder(builder =>
        {
            builder.ConfigureServices(services =>
            {
                // Remove o contexto real
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

    private string UniqueEmail(string prefix = "user") => $"{prefix}_{Guid.NewGuid():N}@exemplo.com";

    [Fact]
    public async Task GetUsers_ReturnsSuccess()
    {
        var response = await _client.GetAsync("/usuarios");
        response.EnsureSuccessStatusCode();
    }

    [Fact]
    public async Task CreateUser_Valid_ReturnsCreated()
    {
        var email = UniqueEmail("valid");
        var user = new { name = "Usuário Teste", email, password = "123456" };
        var response = await _client.PostAsJsonAsync("/usuarios", user);
        Assert.Equal(System.Net.HttpStatusCode.Created, response.StatusCode);
    }

    [Fact]
    public async Task CreateUser_InvalidEmail_ReturnsBadRequest()
    {
        var email = "emailinvalido";
        var user = new { name = "Usuário Teste", email, password = "123456" };
        var response = await _client.PostAsJsonAsync("/usuarios", user);
        Assert.Equal(System.Net.HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task CreateUser_ShortPassword_ReturnsBadRequest()
    {
        var email = UniqueEmail("shortpw");
        var user = new { name = "Usuário Teste", email, password = "123" };
        var response = await _client.PostAsJsonAsync("/usuarios", user);
        Assert.Equal(System.Net.HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task CreateUser_DuplicateEmail_ReturnsConflict()
    {
        var email = UniqueEmail("dup");
        var user = new { name = "Usuário Teste", email, password = "123456" };
        await _client.PostAsJsonAsync("/usuarios", user); // Cria o primeiro
        var response = await _client.PostAsJsonAsync("/usuarios", user); // Tenta duplicar
        Assert.Equal(System.Net.HttpStatusCode.Conflict, response.StatusCode);
    }

    [Fact]
    public async Task UpdateUser_ReturnsOk()
    {
        var email = UniqueEmail("upd");
        var user = new { name = "Usuário Atualizar", email, password = "123456" };
        var createResponse = await _client.PostAsJsonAsync("/usuarios", user);
        if (createResponse.StatusCode != System.Net.HttpStatusCode.Created) Assert.True(false, "Usuário não criado para update");
        var created = await createResponse.Content.ReadFromJsonAsync<UserResponse>();

    var update = new { Name = "Usuário Atualizado", Email = UniqueEmail("upd2"), PasswordHash = "654321", Status = true };
    var response = await _client.PutAsJsonAsync($"/usuarios/{created.Id}", update);
    Assert.Equal(System.Net.HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task DeleteUser_ReturnsNoContentOrNotFound()
    {
        var email = UniqueEmail("del");
        var user = new { name = "Usuário Deletar", email, password = "123456" };
        var createResponse = await _client.PostAsJsonAsync("/usuarios", user);
        if (createResponse.StatusCode != System.Net.HttpStatusCode.Created) Assert.True(false, "Usuário não criado para delete");
        var created = await createResponse.Content.ReadFromJsonAsync<UserResponse>();

        var response = await _client.DeleteAsync($"/usuarios/{created.Id}");
        Assert.Contains(response.StatusCode, new[] { System.Net.HttpStatusCode.NoContent, System.Net.HttpStatusCode.NotFound });
    }

    [Fact]
    public async Task GetUsers_WithoutJwt_ReturnsUnauthorized()
    {
        var factory = new WebApplicationFactory<Program>();
        var client = factory.CreateClient();
        var response = await client.GetAsync("/usuarios");
        Assert.Equal(System.Net.HttpStatusCode.Unauthorized, response.StatusCode);
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

    public class UserResponse
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
        public string Email { get; set; }
    }
}
