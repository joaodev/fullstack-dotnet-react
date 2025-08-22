using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Microsoft.EntityFrameworkCore;
using ProductsDotnetApi.Models;
using ProductsDotnetApi.Data;
using ProductsDotnetApi.Router;
using Microsoft.AspNetCore.HttpOverrides;

public class Program
{
    public static void Main(string[] args)
    {
        var builder = WebApplication.CreateBuilder(args);

        builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
            .AddJwtBearer(options =>
            {
                options.TokenValidationParameters = new TokenValidationParameters
                {
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

        // Swagger/OpenAPI
        builder.Services.AddEndpointsApiExplorer();
        builder.Services.AddSwaggerGen();

        // EF Core para PostgreSQL (somente se não estiver em ambiente de teste)
        var isTestEnv = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") == "Test";
        if (!isTestEnv)
        {
            builder.Services.AddDbContext<AppDbContext>(options =>
                options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));
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

        // Endpoints
        app.MapGet("/", () => "API online! 🚀");
        app.MapLoginEndpoints();
        app.MapProductsEndpoints();
        app.MapDepartmentsEndpoints();
        app.MapUsersEndpoints();

        app.UseAuthorization();

        app.Run();
    }
}
