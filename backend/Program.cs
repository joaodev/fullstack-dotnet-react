using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text.Json;
using RabbitMQ.Client;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.EntityFrameworkCore;
using ProductsDotnetApi.Models;
using ProductsDotnetApi.Data;
using ProductsDotnetApi.Router;
using System.Text.Json.Serialization;

// Adiciona autenticação e autorização
var builder = WebApplication.CreateBuilder(args);
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options => {
        options.TokenValidationParameters = new TokenValidationParameters {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = "products-api",
            ValidAudience = "products-api",
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes("super_secret_jwt_key_1234567890_abcdefg"))
        };
    });
builder.Services.AddAuthorization();

// Adiciona serviços ao container
// Swagger/OpenAPI
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Configuração do EF Core para PostgreSQL
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));
builder.Services.AddScoped<ProductsDotnetApi.Repositories.ProductRepository>();
builder.Services.AddScoped<ProductsDotnetApi.Repositories.UserRepository>();
    builder.Services.AddScoped<ProductsDotnetApi.Repositories.DepartmentRepository>();

var app = builder.Build();
app.UseAuthentication();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseForwardedHeaders(new ForwardedHeadersOptions
{
    ForwardedHeaders = Microsoft.AspNetCore.HttpOverrides.ForwardedHeaders.XForwardedFor | Microsoft.AspNetCore.HttpOverrides.ForwardedHeaders.XForwardedProto
});

// Endpoints
app.MapGet("/", () => "API online! 🚀");
app.MapLoginEndpoints();
app.MapProductsEndpoints();
app.MapDepartmentsEndpoints();
app.MapUsersEndpoints();

// AuthorizationMiddleware
app.UseAuthorization();

app.Run();
