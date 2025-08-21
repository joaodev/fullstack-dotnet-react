using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.EntityFrameworkCore;
using ProductsDotnetApi.Data;
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Mvc;
using ProductsDotnetApi.Repositories;
public static class LoginEndpoints
{
    public static void MapLoginEndpoints(this WebApplication app)
    {
        app.MapPost("/login", async ([FromServices] UserRepository userRepository, LoginRequest login) =>
        {
            var user = await userRepository.GetByEmailAsync(login.Email);
            if (user == null || !ProductsDotnetApi.Repositories.PasswordHelper.VerifyPassword(login.Password, user.PasswordHash))
                return Results.Unauthorized();

            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Name, user.Name),
                new Claim(ClaimTypes.Email, user.Email)
            };

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes("super_secret_jwt_key_1234567890_abcdefg"));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
            var token = new JwtSecurityToken(
                issuer: "products-api",
                audience: "products-api",
                claims: claims,
                expires: DateTime.Now.AddHours(2),
                signingCredentials: creds
            );

            var tokenString = new JwtSecurityTokenHandler().WriteToken(token);
            return Results.Ok(new { token = tokenString });
        });
    }
}

public record LoginRequest(
    [property: JsonPropertyName("email")] string Email,
    [property: JsonPropertyName("password")] string Password
);
