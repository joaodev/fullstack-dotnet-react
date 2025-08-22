using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Mvc;
using ProductsDotnetApi.Repositories;

namespace ProductsDotnetApi.Router
{
    public class DepartmentLog {}

    public class DepartmentResponse {
        public int Id { get; set; }
        public string? Name { get; set; }
    }

    public static class DepartmentsEndpoints
    {
        public static RouteGroupBuilder MapDepartmentsEndpoints(this WebApplication app)
        {
            var router = app.MapGroup("/departamentos").RequireAuthorization();
            router.MapGet("/", async ([FromServices] DepartmentRepository repository) =>
            {
                var departments = await repository.GetAllAsync();
                var logger = app.Services.GetRequiredService<ILogger<DepartmentLog>>();
                var ativos = departments.Where(d => d.Status)
                    .Select(d => new DepartmentResponse {
                        Id = d.Id,
                        Name = d.Name
                    }).ToList();
                logger.LogInformation("[SUCESSO] [{Time}] [GET /departamentos] - {Count} departamentos ativos retornados", DateTime.UtcNow, ativos.Count);
                return Results.Json(ativos);
            });
            router.MapPut("/{id}", async ([FromServices] DepartmentRepository repository, int id, [FromBody] DepartmentInput input) =>
            {
                var logger = app.Services.GetRequiredService<ILogger<DepartmentLog>>();
                if (input == null || string.IsNullOrWhiteSpace(input.Name))
                {
                    logger.LogWarning("[ERRO] [{Time}] [PUT /departamentos/{Id}] - Dados inválidos para atualização", DateTime.UtcNow, id);
                    return Results.Json(new { error = "Nome do departamento é obrigatório." }, statusCode: 400);
                }

                var department = await repository.GetByIdAsync(id);
                if (department is null || !department.Status)
                {
                    logger.LogWarning("[ERRO] [{Time}] [PUT /departamentos/{Id}] - Departamento não encontrado ou inativo: {DepartmentId}", DateTime.UtcNow, id, id);
                    return Results.Json(new { error = "Departamento não encontrado ou inativo" }, statusCode: 404);
                }

                // Use the correct update method, assuming UpdateNameAsync exists
                await repository.UpdateNameAsync(id, input.Name);

                var updatedDepartment = await repository.GetByIdAsync(id);
                if (updatedDepartment == null)
                {
                    logger.LogWarning("[ERRO] [{Time}] [PUT /departamentos/{Id}] - Erro ao buscar departamento atualizado: {DepartmentId}", DateTime.UtcNow, id, id);
                    return Results.Json(new { error = "Erro ao buscar departamento atualizado." }, statusCode: 500);
                }
                var response = new DepartmentResponse
                {
                    Id = updatedDepartment.Id,
                    Name = updatedDepartment.Name
                };

                logger.LogInformation("[SUCESSO] [{Time}] [PUT /departamentos/{Id}] - Departamento atualizado com sucesso: {DepartmentId}", DateTime.UtcNow, id, id);
                return Results.Json(response);
            });
            router.MapPost("/", async ([FromServices] DepartmentRepository repository, [FromBody] DepartmentInput input) =>
            {
                if (input == null)
                    return Results.Json(new { error = "Dados do departamento não informados." }, statusCode: 400);
                if (string.IsNullOrWhiteSpace(input.Name))
                    return Results.Json(new { error = "Nome do departamento é obrigatório." }, statusCode: 400);
                await repository.AddAsync(input.Name);
                // Buscar departamento criado para retornar
                var departments = await repository.GetAllAsync();
                var department = departments.LastOrDefault(d => d.Name == input.Name);
                // Removido: var created = Results.Created($"/departamentos/{department?.Id}", department);
                if (department == null)
                    return Results.Json(new { error = "Erro ao buscar departamento criado." }, statusCode: 500);
                var response = new DepartmentResponse {
                    Id = department.Id,
                    Name = department.Name
                };
                var logger = app.Services.GetRequiredService<ILogger<DepartmentLog>>();
                logger.LogInformation("[SUCESSO] [{Time}] [POST /departamentos] [Name: {Name}] - Departamento criado com sucesso: {DepartmentId}", DateTime.UtcNow, department.Name, department.Id);
                return Results.Json(response, statusCode: 201);
            });
            router.MapDelete("/{id}", async ([FromServices] DepartmentRepository repository, int id) =>
            {
                var department = await repository.GetByIdAsync(id);
                var logger = app.Services.GetRequiredService<ILogger<DepartmentLog>>();
                if (department is null || !department.Status) {
                    logger.LogWarning("[ERRO] [{Time}] [DELETE /departamentos/{Id}] - Departamento não encontrado ou inativo: {DepartmentId}", DateTime.UtcNow, id, id);
                    return Results.Json(new { error = "Departamento não encontrado ou inativo" }, statusCode: 404);
                }
                await repository.SoftDeleteAsync(id);
                logger.LogInformation("[SUCESSO] [{Time}] [DELETE /departamentos/{Id}] - Departamento deletado (soft delete) com sucesso: {DepartmentId}", DateTime.UtcNow, department.Id, department.Id);
                return Results.NoContent();
            });
            return router;
        }
    }

    // Classe auxiliar para input
    public class DepartmentInput {
        public string? Name { get; set; }
    }
}
