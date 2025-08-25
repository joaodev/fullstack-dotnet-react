using Microsoft.AspNetCore.Builder;
using Microsoft.EntityFrameworkCore;
using ProductsDotnetApi.Data;
using ProductsDotnetApi.Models;
using RabbitMQ.Client;
using System.Text.Json;
using Microsoft.AspNetCore.Mvc;
using ProductsDotnetApi.Repositories;

public class UserLog { }

namespace ProductsDotnetApi.Router
{
    public class UserResponse
    {
        public Guid Id { get; set; }
        public string? Name { get; set; }
        public string? Email { get; set; }
    }

    public static partial class UsersEndpoints
    {
        /// <summary>
        /// Valida os campos obrigatórios de um usuário.
        /// </summary>
        /// <param name="user">Usuário a ser validado</param>
        /// <returns>IResult com erro ou null se válido</returns>
        public static IResult? ValidateUser(User user)
        {
            if (user == null)
                return Results.BadRequest("Usuário não informado.");
            if (string.IsNullOrWhiteSpace(user.Name))
                return Results.BadRequest("Nome do usuário é obrigatório.");
            if (string.IsNullOrWhiteSpace(user.Email))
                return Results.BadRequest("E-mail é obrigatório.");
            // Senha não é obrigatória na edição
            return null;
        }
        /// <summary>
        /// Mapeia os endpoints REST para usuários: listar, total, buscar, criar, atualizar e deletar.
        /// </summary>
        /// <param name="app">Instância do WebApplication</param>
        /// <returns>RouteGroupBuilder configurado</returns>
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
                return Results.Json(ativos);
            });

            // GET /usuarios/total
            router.MapGet("/total", async ([FromServices] UserRepository repository) =>
            {
                var logger = app.Services.GetRequiredService<ILogger<UserLog>>();
                var total = await repository.TotalAsync();
                logger.LogInformation("[SUCESSO] [{Time}] [GET /usuarios/total] - Total de usuários ativos: {Total}", DateTime.UtcNow, total);
                return Results.Json(new { total });
            });

            // GET /usuarios/{id}
            router.MapGet("/{id}", async ([FromServices] UserRepository repository, Guid id) =>
            {
                var logger = app.Services.GetRequiredService<ILogger<UserLog>>();
                var usuario = await repository.GetByIdAsync(id);
                if (usuario is null || !usuario.Status)
                {
                    logger.LogWarning("[ERRO] [{Time}] [GET /usuarios/{Id}] - Usuário não encontrado ou inativo", DateTime.UtcNow, id);
                    return Results.Json(new { error = "Usuário não encontrado ou inativo" }, statusCode: 404);
                }
                var response = new UserResponse { Id = usuario.Id, Name = usuario.Name, Email = usuario.Email };
                logger.LogInformation("[SUCESSO] [{Time}] [GET /usuarios/{Id}] - Usuário retornado com sucesso: {Email}", DateTime.UtcNow, id, usuario.Email);
                return Results.Json(response);
            });

            // POST /usuarios
            router.MapPost("/", async ([FromServices] UserRepository repository, [FromBody] UserInput input) =>
            {
                var logger = app.Services.GetRequiredService<ILogger<UserLog>>();
                if (input == null)
                {
                    logger.LogWarning("[ERRO] [{Time}] [POST /usuarios] - Dados do usuário não informados", DateTime.UtcNow);
                    return Results.Json(new { error = "Dados do usuário não informados." }, statusCode: 400);
                }
                if (string.IsNullOrWhiteSpace(input.Name))
                {
                    logger.LogWarning("[ERRO] [{Time}] [POST /usuarios] - Nome do usuário é obrigatório", DateTime.UtcNow);
                    return Results.Json(new { error = "Nome do usuário é obrigatório." }, statusCode: 400);
                }
                if (string.IsNullOrWhiteSpace(input.Email))
                {
                    logger.LogWarning("[ERRO] [{Time}] [POST /usuarios] - E-mail é obrigatório", DateTime.UtcNow);
                    return Results.Json(new { error = "E-mail é obrigatório." }, statusCode: 400);
                }
                var emailRegex = MyRegex();
                if (!emailRegex.IsMatch(input.Email))
                {
                    logger.LogWarning("[ERRO] [{Time}] [POST /usuarios] - E-mail em formato inválido: {Email}", DateTime.UtcNow, input.Email);
                    return Results.Json(new { error = "E-mail em formato inválido." }, statusCode: 400);
                }
                var senha = !string.IsNullOrWhiteSpace(input.Password) ? input.Password : input.passwordHash;
                if (string.IsNullOrWhiteSpace(senha))
                {
                    logger.LogWarning("[ERRO] [{Time}] [POST /usuarios] - Senha é obrigatória", DateTime.UtcNow);
                    return Results.Json(new { error = "Senha é obrigatória." }, statusCode: 400);
                }
                if (senha.Length < 6)
                {
                    logger.LogWarning("[ERRO] [{Time}] [POST /usuarios] - Senha menor que 6 caracteres", DateTime.UtcNow);
                    return Results.Json(new { error = "Senha deve ter pelo menos 6 caracteres." }, statusCode: 400);
                }
                var existingUser = await repository.GetByEmailAsync(input.Email);
                if (existingUser != null)
                {
                    logger.LogWarning("[ERRO] [{Time}] [POST /usuarios] - E-mail já cadastrado: {Email}", DateTime.UtcNow, input.Email);
                    return Results.Json(new { error = "Já existe um usuário com o mesmo e-mail cadastrado." }, statusCode: 409);
                }
                await repository.AddAsync(input.Name, input.Email, senha);
                var user = await repository.GetByEmailAsync(input.Email);
                if (user == null)
                {
                    logger.LogError("[ERRO] [{Time}] [POST /usuarios] - Erro ao buscar usuário criado: {Email}", DateTime.UtcNow, input.Email);
                    return Results.Json(new { error = "Erro ao buscar usuário criado." }, statusCode: 500);
                }
                var response = new UserResponse { Id = user.Id, Name = user.Name, Email = user.Email };
                logger.LogInformation("[SUCESSO] [{Time}] [POST /usuarios] [Email: {Email}] - Usuário criado com sucesso: {Id}", DateTime.UtcNow, input.Email, user.Id);
                return Results.Json(response, statusCode: 201);
            });

            // PUT /usuarios/{id}
            router.MapPut("/{id}", async ([FromServices] UserRepository repository, Guid id, User input) =>
            {
                var logger = app.Services.GetRequiredService<ILogger<UserLog>>();
                var validationResult = ValidateUser(input);
                if (validationResult != null)
                {
                    logger.LogWarning("[ERRO] [{Time}] [PUT /usuarios/{Id}] - Dados inválidos para atualização", DateTime.UtcNow, id);
                    // Sempre retorna JSON de erro
                    return Results.Json(new { error = ((validationResult as IResult)?.ToString() ?? "Dados inválidos") }, statusCode: 400);
                }
                var user = await repository.GetByIdAsync(id);
                if (user is null)
                {
                    logger.LogWarning("[ERRO] [{Time}] [PUT /usuarios/{Id}] - Usuário não encontrado", DateTime.UtcNow, id);
                    return Results.Json(new { error = "Usuário não encontrado" }, statusCode: 404);
                }
                input.Status = user.Status;
                var emailRegex = MyRegex();
                if (!emailRegex.IsMatch(input.Email))
                {
                    logger.LogWarning("[ERRO] [{Time}] [PUT /usuarios/{Id}] - E-mail em formato inválido: {Email}", DateTime.UtcNow, id, input.Email);
                    return Results.Json(new { error = "E-mail em formato inválido." }, statusCode: 400);
                }
                if (!string.IsNullOrWhiteSpace(input.PasswordHash))
                {
                    if (input.PasswordHash.Length < 6)
                    {
                        logger.LogWarning("[ERRO] [{Time}] [PUT /usuarios/{Id}] - Senha menor que 6 caracteres", DateTime.UtcNow, id);
                        return Results.Json(new { error = "Senha deve ter pelo menos 6 caracteres." }, statusCode: 400);
                    }
                    user.PasswordHash = PasswordHelper.HashPassword(input.PasswordHash);
                }
                if (user.Email != input.Email)
                {
                    var existingUser = await repository.GetByEmailAsync(input.Email);
                    if (existingUser != null && existingUser.Id != id)
                    {
                        logger.LogWarning("[ERRO] [{Time}] [PUT /usuarios/{Id}] - E-mail já cadastrado: {Email}", DateTime.UtcNow, id, input.Email);
                        return Results.Json(new { error = "Já existe um usuário com o mesmo e-mail cadastrado." }, statusCode: 409);
                    }
                }
                user.Name = input.Name;
                user.Email = input.Email;
                await repository.UpdateAsync(user);
                if (user == null)
                {
                    logger.LogError("[ERRO] [{Time}] [PUT /usuarios/{Id}] - Erro ao atualizar usuário", DateTime.UtcNow, id);
                    return Results.Json(new { error = "Erro ao atualizar usuário." }, statusCode: 500);
                }
                var response = new UserResponse { Id = user.Id, Name = user.Name, Email = user.Email };
                logger.LogInformation("[SUCESSO] [{Time}] [PUT /usuarios/{Id}] [Email: {Email}] - Usuário atualizado com sucesso", DateTime.UtcNow, id, user.Email);
                return Results.Json(response);
            });

            // DELETE /usuarios/{id}
            router.MapDelete("/{id}", async ([FromServices] UserRepository repository, Guid id) =>
            {
                var logger = app.Services.GetRequiredService<ILogger<UserLog>>();
                var user = await repository.GetByIdAsync(id);
                if (user is null || !user.Status)
                {
                    logger.LogWarning("[ERRO] [{Time}] [DELETE /usuarios/{Id}] - Usuário não encontrado ou inativo", DateTime.UtcNow, id);
                    return Results.Json(new { error = "Usuário não encontrado ou inativo" }, statusCode: 404);
                }
                await repository.SoftDeleteAsync(id);
                logger.LogInformation("[SUCESSO] [{Time}] [DELETE /usuarios/{Id}] [Email: {Email}] - Usuário deletado (soft delete) com sucesso", DateTime.UtcNow, id, user.Email);
                return Results.NoContent();
            });

            return router;
        }

        // Classe auxiliar para input
        public class UserInput
        {
            public class UserResponse
            {
                public Guid Id { get; set; }
                public string? Name { get; set; }
                public string? Email { get; set; }
            }
            public string? Name { get; set; }
            public string? Email { get; set; }
            public string? Password { get; set; }
            public string? passwordHash { get; set; }
        }

        [System.Text.RegularExpressions.GeneratedRegex(@"^[^@\s]+@[^@\s]+\.[^@\s]+$")]
        private static partial System.Text.RegularExpressions.Regex MyRegex();
    }
}
