using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Microsoft.EntityFrameworkCore;
using ProductsDotnetApi.Models;
using ProductsDotnetApi.Data;
using ProductsDotnetApi.Router;
using Microsoft.AspNetCore.HttpOverrides;
using RabbitMQ.Client;

public class Program
{
    public static void Main(string[] args)
    {
    // Carrega variáveis do .env sempre, inclusive em ambiente de teste
    DotNetEnv.Env.Load();

        var builder = WebApplication.CreateBuilder(args);

        builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
            .AddJwtBearer(options =>
            {
                var jwtSecret = Environment.GetEnvironmentVariable("JWT_SECRET") ?? "default_jwt_secret";
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidateLifetime = true,
                    ValidateIssuerSigningKey = true,
                    ValidIssuer = "products-api",
                    ValidAudience = "products-api",
                    IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret))
                };
            });
        builder.Services.AddAuthorization();

        // CORS
        builder.Services.AddCors(options =>
        {
            var allowedOrigins = (Environment.GetEnvironmentVariable("CORS_ALLOWED_ORIGINS") ?? "")
                .Split(',');
            options.AddPolicy("AllowFrontend",
                policy => policy
                    .WithOrigins(allowedOrigins)
                    .AllowAnyHeader()
                    .AllowAnyMethod()
                    .AllowCredentials());
        });

        // Swagger/OpenAPI
        builder.Services.AddEndpointsApiExplorer();
        builder.Services.AddSwaggerGen();

        // EF Core para PostgreSQL (somente se não estiver em ambiente de teste)
        var isTestEnv = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") == "Test";
        if (isTestEnv)
        {
            builder.Services.AddDbContext<AppDbContext>(options =>
                options.UseInMemoryDatabase("TestDb"));
        }
        else
        {
            var connStr = Environment.GetEnvironmentVariable("DB_CONNECTION_STRING") ?? builder.Configuration.GetConnectionString("DefaultConnection");
            builder.Services.AddDbContext<AppDbContext>(options =>
                options.UseNpgsql(connStr));
        }
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
            ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto
        });

        app.UseCors("AllowFrontend");

        // Endpoints
        app.MapGet("/", () => "API online! 🚀");
        app.MapLoginEndpoints();
        app.MapProductsEndpoints();
        app.MapDepartmentsEndpoints();
        app.MapUsersEndpoints();
        app.MapMensagensEndpoints();

        app.UseAuthorization();

        app.Run();
    }
}
