using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Builder;
using ProductsDotnetApi.Data;
using Microsoft.AspNetCore.Mvc;
using ProductsDotnetApi.Repositories;

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
            router.MapPost("/", async ([FromServices] DepartmentRepository repository, [FromBody] DepartmentInput input) =>
            {
                if (input == null)
                    return Results.BadRequest("Dados do departamento não informados.");
                if (string.IsNullOrWhiteSpace(input.Name))
                    return Results.BadRequest("Nome do departamento é obrigatório.");
                await repository.AddAsync(input.Name);
                // Buscar departamento criado para retornar
                var departments = await repository.GetAllAsync();
                var department = departments.LastOrDefault(d => d.Name == input.Name);
                var created = Results.Created($"/departamentos/{department?.Id}", department);
                if (department == null)
                    return Results.Problem("Erro ao buscar departamento criado.");
                var response = new DepartmentResponse {
                    Id = department.Id,
                    Name = department.Name
                };
                var logger = app.Services.GetRequiredService<ILogger<DepartmentLog>>();
                logger.LogInformation("[SUCESSO] [{Time}] [POST /departamentos] [Name: {Name}] - Departamento criado com sucesso: {DepartmentId}", DateTime.UtcNow, department.Name, department.Id);
                var result = Results.Created($"/departamentos/{department.Id}", response);
                return result;
            });
            router.MapDelete("/{id}", async ([FromServices] DepartmentRepository repository, int id) =>
            {
                var department = await repository.GetByIdAsync(id);
                var logger = app.Services.GetRequiredService<ILogger<DepartmentLog>>();
                if (department is null || !department.Status) {
                    logger.LogWarning("[ERRO] [{Time}] [DELETE /departamentos/{{Id}}] - Departamento não encontrado ou inativo: {DepartmentId}", DateTime.UtcNow, id);
                    return Results.NotFound();
                }
                await repository.SoftDeleteAsync(id);
                logger.LogInformation("[SUCESSO] [{Time}] [DELETE /departamentos/{{Id}}] - Departamento deletado (soft delete) com sucesso: {DepartmentId}", DateTime.UtcNow, department.Id);
                return Results.NoContent();
            });
        return router;
    }
}

// Classe auxiliar para input
public class DepartmentInput {
    public string? Name { get; set; }
}
