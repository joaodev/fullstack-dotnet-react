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
    public static class UsersEndpoints
    {
    // Função auxiliar para validar usuário
    public static IResult ValidateUser(User user)
    {
        if (user == null)
            return Results.BadRequest("Usuário não informado.");
        if (string.IsNullOrWhiteSpace(user.Name))
            return Results.BadRequest("Nome do usuário é obrigatório.");
        if (string.IsNullOrWhiteSpace(user.Email))
            return Results.BadRequest("E-mail é obrigatório.");
        if (string.IsNullOrWhiteSpace(user.PasswordHash))
            return Results.BadRequest("Senha é obrigatória.");
        // Pode adicionar validação de formato de e-mail, tamanho mínimo de senha, etc.
        return null;
    }
    public static RouteGroupBuilder MapUsersEndpoints(this WebApplication app)
    {
        var router = app.MapGroup("/usuarios").RequireAuthorization();

        // GET /usuarios
        router.MapGet("/", async ([FromServices] UserRepository repository) =>
            await repository.GetAllAsync()
        );

        // GET /usuarios/{id}
        router.MapGet("/{id}", async ([FromServices] UserRepository repository, Guid id) =>
        {
            var usuario = await repository.GetByIdAsync(id);
            if (usuario is null) return Results.NotFound();
            return Results.Ok(usuario);
        });

        // POST /usuarios
        router.MapPost("/", async ([FromServices] UserRepository repository, User user) =>
        {
            var validationResult = ValidateUser(user);
            if (validationResult != null)
                return validationResult;
            await repository.AddAsync(user);
            var created = Results.Created($"/usuarios/{user.Id}", user);
            return created;
        });

        // PUT /usuarios/{id}
        router.MapPut("/{id}", async ([FromServices] UserRepository repository, Guid id, User input) =>
        {
            var validationResult = ValidateUser(input);
            if (validationResult != null)
                return validationResult;
            var user = await repository.GetByIdAsync(id);
            if (user is null) return Results.NotFound();
            user.Name = input.Name;
            user.Email = input.Email;
            user.PasswordHash = PasswordHelper.HashPassword(input.PasswordHash);
            await repository.UpdateAsync(user);
            return Results.Ok(user);
        });

        // DELETE /usuarios/{id} (exclusão lógica)
        router.MapDelete("/{id}", async ([FromServices] UserRepository repository, Guid id) =>
        {
            var user = await repository.GetByIdAsync(id);
            if (user is null) return Results.NotFound();
            await repository.UpdateAsync(user);
            return Results.NoContent();
        });

        return router;
    }
    }
}
