using Microsoft.AspNetCore.Builder;
using Microsoft.EntityFrameworkCore;
using ProductsDotnetApi.Data;
using ProductsDotnetApi.Models;
using RabbitMQ.Client;
using System.Text.Json;
using Microsoft.AspNetCore.Mvc;
using ProductsDotnetApi.Repositories;

public class UserLog {}

namespace ProductsDotnetApi.Router
{
    public class UserResponse {
        public Guid Id { get; set; }
        public string? Name { get; set; }
        public string? Email { get; set; }
    }

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
        // Se passou por todas as validações, retorna null (usuário válido)
        return null;
    }
    public static RouteGroupBuilder MapUsersEndpoints(this WebApplication app)
    {
    var router = app.MapGroup("/usuarios").RequireAuthorization();

        // GET /usuarios
        router.MapGet("/", async ([FromServices] UserRepository repository) =>
        {
            var logger = app.Services.GetRequiredService<ILogger<UserLog>>();
            var users = await repository.GetAllAsync();
            var ativos = users.Where(u => u.Status)
                .Select(u => new UserResponse { Id = u.Id, Name = u.Name, Email = u.Email })
                .ToList();
            logger.LogInformation("[SUCESSO] [{Time}] [GET /usuarios] - {Count} usuários ativos retornados", DateTime.UtcNow, ativos.Count);
            return Results.Ok(ativos);
        });

        // GET /usuarios/{id}
        router.MapGet("/{id}", async ([FromServices] UserRepository repository, Guid id) =>
        {
            var logger = app.Services.GetRequiredService<ILogger<UserLog>>();
            var usuario = await repository.GetByIdAsync(id);
            if (usuario is null || !usuario.Status) {
                logger.LogWarning("[ERRO] [{Time}] [GET /usuarios/{Id}] - Usuário não encontrado ou inativo", DateTime.UtcNow, id);
                return Results.NotFound();
            }
            var response = new UserResponse { Id = usuario.Id, Name = usuario.Name, Email = usuario.Email };
            logger.LogInformation("[SUCESSO] [{Time}] [GET /usuarios/{Id}] - Usuário retornado com sucesso: {Email}", DateTime.UtcNow, id, usuario.Email);
            return Results.Ok(response);
        });

        // POST /usuarios
        router.MapPost("/", async ([FromServices] UserRepository repository, [FromBody] UserInput input) =>
        {
            var logger = app.Services.GetRequiredService<ILogger<UserLog>>();
            if (input == null) {
                logger.LogWarning("[ERRO] [{Time}] [POST /usuarios] - Dados do usuário não informados", DateTime.UtcNow);
                return Results.BadRequest("Dados do usuário não informados.");
            }
            if (string.IsNullOrWhiteSpace(input.Name)) {
                logger.LogWarning("[ERRO] [{Time}] [POST /usuarios] - Nome do usuário é obrigatório", DateTime.UtcNow);
                return Results.BadRequest("Nome do usuário é obrigatório.");
            }
            if (string.IsNullOrWhiteSpace(input.Email)) {
                logger.LogWarning("[ERRO] [{Time}] [POST /usuarios] - E-mail é obrigatório", DateTime.UtcNow);
                return Results.BadRequest("E-mail é obrigatório.");
            }
            var emailRegex = new System.Text.RegularExpressions.Regex(@"^[^@\s]+@[^@\s]+\.[^@\s]+$");
            if (!emailRegex.IsMatch(input.Email)) {
                logger.LogWarning("[ERRO] [{Time}] [POST /usuarios] - E-mail em formato inválido: {Email}", DateTime.UtcNow, input.Email);
                return Results.BadRequest("E-mail em formato inválido.");
            }
            if (string.IsNullOrWhiteSpace(input.Password)) {
                logger.LogWarning("[ERRO] [{Time}] [POST /usuarios] - Senha é obrigatória", DateTime.UtcNow);
                return Results.BadRequest("Senha é obrigatória.");
            }
            if (input.Password.Length < 6) {
                logger.LogWarning("[ERRO] [{Time}] [POST /usuarios] - Senha menor que 6 caracteres", DateTime.UtcNow);
                return Results.BadRequest("Senha deve ter pelo menos 6 caracteres.");
            }
            var existingUser = await repository.GetByEmailAsync(input.Email);
            if (existingUser != null) {
                logger.LogWarning("[ERRO] [{Time}] [POST /usuarios] - E-mail já cadastrado: {Email}", DateTime.UtcNow, input.Email);
                return Results.Conflict("Já existe um usuário com o mesmo e-mail cadastrado.");
            }
            await repository.AddAsync(input.Name, input.Email, input.Password);
            var user = await repository.GetByEmailAsync(input.Email);
            if (user == null) {
                logger.LogError("[ERRO] [{Time}] [POST /usuarios] - Erro ao buscar usuário criado: {Email}", DateTime.UtcNow, input.Email);
                return Results.Problem("Erro ao buscar usuário criado.");
            }
            var response = new UserResponse { Id = user.Id, Name = user.Name, Email = user.Email };
            logger.LogInformation("[SUCESSO] [{Time}] [POST /usuarios] [Email: {Email}] - Usuário criado com sucesso: {Id}", DateTime.UtcNow, input.Email, user.Id);
            var created = Results.Created($"/usuarios/{user.Id}", response);
            return created;
        });

        // PUT /usuarios/{id}
        router.MapPut("/{id}", async ([FromServices] UserRepository repository, Guid id, User input) =>
        {
            var logger = app.Services.GetRequiredService<ILogger<UserLog>>();
            var validationResult = ValidateUser(input);
            if (validationResult != null) {
                logger.LogWarning("[ERRO] [{Time}] [PUT /usuarios/{Id}] - Dados inválidos para atualização", DateTime.UtcNow, id);
                return validationResult;
            }
            var user = await repository.GetByIdAsync(id);
            if (user is null) {
                logger.LogWarning("[ERRO] [{Time}] [PUT /usuarios/{Id}] - Usuário não encontrado", DateTime.UtcNow, id);
                return Results.NotFound();
            }
            input.Status = user.Status;
            var emailRegex = new System.Text.RegularExpressions.Regex(@"^[^@\s]+@[^@\s]+\.[^@\s]+$");
            if (!emailRegex.IsMatch(input.Email)) {
                logger.LogWarning("[ERRO] [{Time}] [PUT /usuarios/{Id}] - E-mail em formato inválido: {Email}", DateTime.UtcNow, id, input.Email);
                return Results.BadRequest("E-mail em formato inválido.");
            }
            if (string.IsNullOrWhiteSpace(input.PasswordHash) || input.PasswordHash.Length < 6) {
                logger.LogWarning("[ERRO] [{Time}] [PUT /usuarios/{Id}] - Senha menor que 6 caracteres", DateTime.UtcNow, id);
                return Results.BadRequest("Senha deve ter pelo menos 6 caracteres.");
            }
            if (user.Email != input.Email) {
                var existingUser = await repository.GetByEmailAsync(input.Email);
                if (existingUser != null && existingUser.Id != id) {
                    logger.LogWarning("[ERRO] [{Time}] [PUT /usuarios/{Id}] - E-mail já cadastrado: {Email}", DateTime.UtcNow, id, input.Email);
                    return Results.Conflict("Já existe um usuário com o mesmo e-mail cadastrado.");
                }
            }
            user.Name = input.Name;
            user.Email = input.Email;
            user.PasswordHash = PasswordHelper.HashPassword(input.PasswordHash);
            await repository.UpdateAsync(user);
            if (user == null) {
                logger.LogError("[ERRO] [{Time}] [PUT /usuarios/{Id}] - Erro ao atualizar usuário", DateTime.UtcNow, id);
                return Results.Problem("Erro ao atualizar usuário.");
            }
            var response = new UserResponse { Id = user.Id, Name = user.Name, Email = user.Email };
            logger.LogInformation("[SUCESSO] [{Time}] [PUT /usuarios/{Id}] [Email: {Email}] - Usuário atualizado com sucesso", DateTime.UtcNow, id, user.Email);
            return Results.Ok(response);
        });

        // DELETE /usuarios/{id}
        router.MapDelete("/{id}", async ([FromServices] UserRepository repository, Guid id) =>
        {
            var logger = app.Services.GetRequiredService<ILogger<UserLog>>();
            var user = await repository.GetByIdAsync(id);
            if (user is null || !user.Status) {
                logger.LogWarning("[ERRO] [{Time}] [DELETE /usuarios/{Id}] - Usuário não encontrado ou inativo", DateTime.UtcNow, id);
                return Results.NotFound();
            }
            await repository.SoftDeleteAsync(id);
            logger.LogInformation("[SUCESSO] [{Time}] [DELETE /usuarios/{Id}] [Email: {Email}] - Usuário deletado (soft delete) com sucesso", DateTime.UtcNow, id, user.Email);
            return Results.NoContent();
        });

        return router;
    }

    // Classe auxiliar para input
    public class UserInput {
    public class UserResponse {
        public Guid Id { get; set; }
        public string? Name { get; set; }
        public string? Email { get; set; }
    }
        public string? Name { get; set; }
        public string? Email { get; set; }
        public string? Password { get; set; }
    }
    }
}
