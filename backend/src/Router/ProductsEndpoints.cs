using Microsoft.AspNetCore.Builder;
using Microsoft.EntityFrameworkCore;
using ProductsDotnetApi.Data;
using ProductsDotnetApi.Models;
using RabbitMQ.Client;
using System.Text.Json;
using Microsoft.AspNetCore.Mvc;
using ProductsDotnetApi.Repositories;

public class ProductLog { }

public class ProductResponse
{
    public Guid Id { get; set; }
    public string? Code { get; set; }
    public string? Description { get; set; }
    public int DepartmentId { get; set; }
    public decimal Price { get; set; }
}

namespace ProductsDotnetApi.Router
{
    public class ProductResponse
    {
        public Guid Id { get; set; }
        public string? Code { get; set; }
        public string? Description { get; set; }
        public int DepartmentId { get; set; }
        public string? DepartmentTitle { get; set; }
        public decimal Price { get; set; }
    }

    public static class ProductsEndpoints
    {
        /// <summary>
        /// Valida os campos obrigatórios de um produto.
        /// </summary>
        /// <param name="product">Produto a ser validado</param>
        /// <returns>IResult com erro ou null se válido</returns>
        public static IResult ValidateProduct(Product product)
        {
            if (product == null)
                return Results.BadRequest("Produto não informado.");
            if (string.IsNullOrWhiteSpace(product.Code))
                return Results.BadRequest("Código do produto é obrigatório.");
            if (string.IsNullOrWhiteSpace(product.Description))
                return Results.BadRequest("Descrição do produto é obrigatória.");
            if (product.DepartmentId <= 0)
                return Results.BadRequest("Departamento é obrigatório.");
            if (product.Price <= 0)
                return Results.BadRequest("Preço deve ser maior que zero.");

            return Results.BadRequest("Produto inválido.");
        }
        /// <summary>
        /// Mapeia os endpoints REST para produtos: listar, total, buscar, criar, atualizar e deletar.
        /// </summary>
        /// <param name="app">Instância do WebApplication</param>
        /// <returns>RouteGroupBuilder configurado</returns>
        public static RouteGroupBuilder MapProductsEndpoints(this WebApplication app)
        {
            var router = app.MapGroup("/produtos").RequireAuthorization();

            // GET /produtos
            router.MapGet("/", async ([FromServices] ProductRepository repository, [FromServices] AppDbContext dbContext) =>
            {
                var products = await repository.GetAllAsync();
                var logger = app.Services.GetRequiredService<ILogger<ProductLog>>();
                var departamentos = dbContext.Departments.ToDictionary(d => d.Id, d => d.Name);
                var ativos = products.Where(p => p.Status)
                    .Select(p => new ProductResponse
                    {
                        Id = p.Id,
                        Code = p.Code,
                        Description = p.Description,
                        DepartmentId = p.DepartmentId,
                        DepartmentTitle = departamentos.TryGetValue(p.DepartmentId, out string? value) ? value : null,
                        Price = p.Price
                    }).ToList();
                logger.LogInformation("[SUCESSO] [{Time}] [GET /produtos] - {Count} produtos ativos retornados", DateTime.UtcNow, ativos.Count);
                return Results.Json(ativos);
            });

            // GET /produtos/total
            router.MapGet("/total", async ([FromServices] ProductRepository repository) =>
            {
                var logger = app.Services.GetRequiredService<ILogger<ProductLog>>();
                var total = await repository.TotalAsync();
                logger.LogInformation("[SUCESSO] [{Time}] [GET /produtos/total] - Total de produtos ativos: {Total}", DateTime.UtcNow, total);
                return Results.Json(new { total });
            });

            // GET /produtos/{id}
            router.MapGet("/{id}", async ([FromServices] ProductRepository repository, [FromServices] AppDbContext dbContext, string id) =>
            {
                if (!Guid.TryParse(id, out var guid))
                    return Results.Json(new { error = "Id inválido. Deve ser um GUID." });

                var product = await repository.GetByIdAsync(guid);
                if (product is null || !product.Status) return Results.NotFound();

                var logger = app.Services.GetRequiredService<ILogger<ProductLog>>();
                var departamento = await dbContext.Departments.FindAsync(product.DepartmentId);
                var response = new ProductResponse
                {
                    Id = product.Id,
                    Code = product.Code,
                    Description = product.Description,
                    DepartmentId = product.DepartmentId,
                    DepartmentTitle = departamento?.Name,
                    Price = product.Price
                };
                logger.LogInformation("[SUCESSO] [{Time}] [GET /produtos/{{Id}}] - Produto retornado com sucesso: {ProductId}", DateTime.UtcNow, product.Id);
                return Results.Json(response);
            });

            // POST /produtos
            router.MapPost("/", async ([FromServices] ProductRepository repository, [FromBody] ProductInput input) =>
            {
                if (input == null)
                    return Results.Json(new { error = "Dados do produto não informados." }, statusCode: 400);
                if (string.IsNullOrWhiteSpace(input.Code))
                    return Results.Json(new { error = "Código do produto é obrigatório." }, statusCode: 400);
                if (string.IsNullOrWhiteSpace(input.Description))
                    return Results.Json(new { error = "Descrição do produto é obrigatória." }, statusCode: 400);
                if (input.DepartmentId <= 0)
                    return Results.Json(new { error = "Departamento é obrigatório." }, statusCode: 400);
                if (input.Price <= 0)
                    return Results.Json(new { error = "Preço deve ser maior que zero." }, statusCode: 400);

                if (await repository.ExistsByCodeOrDescriptionAsync(input.Code, input.Description))
                    return Results.Json(new { error = "Já existe um produto com o mesmo código ou nome cadastrado." }, statusCode: 409);

                input.Status = true; // Definindo status como ativo por padrão

                await repository.AddAsync(input.Code, input.Description, input.DepartmentId, input.Price, input.Status);

                // Buscar produto criado para retornar
                var products = await repository.GetAllAsync();
                var product = products.LastOrDefault(p => p.Code == input.Code);
                if (product == null)
                    return Results.Json(new { error = "Erro ao buscar produto criado." }, statusCode: 500);
                var logger = app.Services.GetRequiredService<ILogger<ProductLog>>();
                var response = new ProductResponse
                {
                    Id = product.Id,
                    Code = product.Code,
                    Description = product.Description,
                    DepartmentId = product.DepartmentId,
                    Price = product.Price
                };
                logger.LogInformation("[SUCESSO] [{Time}] [POST /produtos] [Code: {Code}] - Produto criado com sucesso: {Id}", DateTime.UtcNow, product.Code, product.Id);
                return Results.Json(response, statusCode: 201);
            });

            // PUT /produtos/{id}
            router.MapPut("/{id}", async ([FromServices] ProductRepository repository, string id, ProductUpdateInput input) =>
            {
                if (!Guid.TryParse(id, out var guid))
                    return Results.Json(new { error = "Id inválido. Deve ser um GUID." }, statusCode: 400);

                var product = await repository.GetByIdAsync(guid);
                if (product is null) return Results.NotFound();

                // Validação manual dos campos
                if (string.IsNullOrWhiteSpace(input.Description))
                    return Results.Json(new { error = "Descrição do produto é obrigatória." }, statusCode: 400);
                if (input.DepartmentId <= 0)
                    return Results.Json(new { error = "Departamento é obrigatório." }, statusCode: 400);
                if (input.Price <= 0)
                    return Results.Json(new { error = "Preço deve ser maior que zero." }, statusCode: 400);

                product.Description = input.Description;
                product.DepartmentId = input.DepartmentId;
                product.Price = input.Price;

                await repository.UpdateAsync(product);
                var logger = app.Services.GetRequiredService<ILogger<ProductLog>>();
                var response = new ProductResponse
                {
                    Id = product.Id,
                    Code = product.Code,
                    Description = product.Description,
                    DepartmentId = product.DepartmentId,
                    Price = product.Price
                };
                logger.LogInformation("[SUCESSO] [{Time}] [PUT /produtos/{{Id}}] - Produto atualizado com sucesso: {ProductId}", DateTime.UtcNow, product.Id);
                return Results.Json(response);
            });

            // DELETE /produtos/{id} (exclusão lógica)
            router.MapDelete("/{id}", async ([FromServices] ProductRepository repository, string id) =>
            {
                if (!Guid.TryParse(id, out var guid))
                    return Results.BadRequest("Id inválido. Deve ser um GUID.");

                var product = await repository.GetByIdAsync(guid);
                if (product is null || !product.Status) return Results.NotFound();

                await repository.SoftDeleteAsync(guid);
                var logger = app.Services.GetRequiredService<ILogger<ProductLog>>();
                logger.LogInformation("[SUCESSO] [{Time}] [DELETE /produtos/{{Id}}] - Produto deletado (soft delete) com sucesso: {ProductId}", DateTime.UtcNow, product.Id);
                return Results.NoContent();
            });

            return router;
        }

        // Classe auxiliar para input
        public class ProductInput
        {
            public string? Code { get; set; }
            public string? Description { get; set; }
            public int DepartmentId { get; set; }
            public decimal Price { get; set; }
            public bool Status { get; set; }
        }

        // Interface para atualização (PUT)
        public class ProductUpdateInput
        {
            public string? Description { get; set; }
            public int DepartmentId { get; set; }
            public decimal Price { get; set; }
        }
    }
}
