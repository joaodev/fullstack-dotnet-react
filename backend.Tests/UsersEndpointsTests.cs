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
    private readonly WebApplicationFactory<Program> factory;

    public UsersEndpointsTests(WebApplicationFactory<Program> factory)
    {
        this.factory = factory;
        _client = factory.CreateClient();
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
    public async Task GetUsersTotal_ReturnsSuccessAndCorrectCount()
    {
        // Limpa o banco antes do teste
        var db = GetDbContext();
        db.Users.RemoveRange(db.Users);
        db.SaveChanges();
        // Cria 2 usuários ativos
        var email1 = UniqueEmail("total1");
        var email2 = UniqueEmail("total2");
        var user1 = new { name = "Usuário 1", email = email1, password = "123456" };
        var user2 = new { name = "Usuário 2", email = email2, password = "123456" };
        await _client.PostAsJsonAsync("/usuarios", user1);
        await _client.PostAsJsonAsync("/usuarios", user2);
        var response = await _client.GetAsync("/usuarios/total");
        response.EnsureSuccessStatusCode();
        var json = await response.Content.ReadAsStringAsync();
        using var doc = System.Text.Json.JsonDocument.Parse(json);
        var total = doc.RootElement.GetProperty("total").GetInt32();
        Assert.Equal(2, total);
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
        var claims = new[] {
            new System.Security.Claims.Claim("sub", "test-user"),
            new System.Security.Claims.Claim("role", "admin")
        };
        var token = new JwtSecurityToken(
            issuer: "products-api",
            audience: "products-api",
            claims: claims,
            notBefore: DateTime.UtcNow,
            expires: DateTime.UtcNow.AddMinutes(30),
            signingCredentials: credentials
        );
        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    private ProductsDotnetApi.Data.AppDbContext GetDbContext()
    {
        var scopeFactory = factory.Services.GetService(typeof(IServiceScopeFactory)) as IServiceScopeFactory;
        var scope = scopeFactory.CreateScope();
        return scope.ServiceProvider.GetRequiredService<ProductsDotnetApi.Data.AppDbContext>();
    }

    public class UserResponse
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
        public string Email { get; set; }
    }
}
