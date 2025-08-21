using Microsoft.AspNetCore.Builder;
using Microsoft.EntityFrameworkCore;
using ProductsDotnetApi.Data;
using ProductsDotnetApi.Models;
using RabbitMQ.Client;
using System.Text.Json;
using Microsoft.AspNetCore.Mvc;
using ProductsDotnetApi.Repositories;

namespace ProductsDotnetApi.Router
{
    public static class ProductsEndpoints
    {
    // Função auxiliar para validar produto
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
        return null;
    }
    public static RouteGroupBuilder MapProductsEndpoints(this WebApplication app)
    {
        var router = app.MapGroup("/produtos").RequireAuthorization();

        // GET /produtos
        router.MapGet("/", async ([FromServices] ProductRepository repository) =>
            await repository.GetAllAsync()
        );

        // GET /produtos/{id}
        router.MapGet("/{id}", async ([FromServices] ProductRepository repository, Guid id) =>
        {
            var product = await repository.GetByIdAsync(id);
            if (product is null || !product.Status) return Results.NotFound();
            return Results.Ok(product);
        });

        // POST /produtos
        router.MapPost("/", async ([FromServices] ProductRepository repository, Product product) =>
        {
            var validationResult = ValidateProduct(product);
            if (validationResult != null)
                return validationResult;
            product.Status = true;
            await repository.AddAsync(product);

            var created = Results.Created($"/produtos/{product.Id}", product);

            var factory = new ConnectionFactory()
            {
                HostName = "rabbitmq",
                UserName = "user",
                Password = "password",
                Port = 5672
            };

            using var connection = factory.CreateConnection();
            using var channel = connection.CreateModel();
            channel.QueueDeclare(queue: "product-created",
                                 durable: false,
                                 exclusive: false,
                                 autoDelete: false,
                                 arguments: null);

            var newEvent = new
            {
                product.Id,
                product.Code,
                product.Description,
                product.DepartmentId,
                product.Price,
                CreatedAt = DateTime.UtcNow
            };
            var body = System.Text.Encoding.UTF8.GetBytes(JsonSerializer.Serialize(newEvent));
            channel.BasicPublish(exchange: "",
                                 routingKey: "product-created", 
                                 basicProperties: null,
                                 body: body);

            return created;
        });

        // PUT /produtos/{id}
        router.MapPut("/{id}", async ([FromServices] ProductRepository repository, Guid id, Product input) =>
        {
            var validationResult = ValidateProduct(input);
            if (validationResult != null)
                return validationResult;
            var product = await repository.GetByIdAsync(id);
            if (product is null || !product.Status) return Results.NotFound();
            product.Code = input.Code;
            product.Description = input.Description;
            product.DepartmentId = input.DepartmentId;
            product.Price = input.Price;
            await repository.UpdateAsync(product);
            return Results.Ok(product);
        });

        // DELETE /produtos/{id} (exclusão lógica)
        router.MapDelete("/{id}", async ([FromServices] ProductRepository repository, Guid id) =>
        {
            var product = await repository.GetByIdAsync(id);
            if (product is null || !product.Status) return Results.NotFound();
            product.Status = false;
            await repository.UpdateAsync(product);
            return Results.NoContent();
        });

        return router;
    }
    }
}
