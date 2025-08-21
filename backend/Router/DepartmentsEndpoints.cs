using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Builder;
using ProductsDotnetApi.Data;
using Microsoft.AspNetCore.Mvc;
using ProductsDotnetApi.Repositories;

public static class DepartmentsEndpoints
{
    public static RouteGroupBuilder MapDepartmentsEndpoints(this WebApplication app)
    {
        var router = app.MapGroup("/departamentos").RequireAuthorization();
            router.MapGet("/", async ([FromServices] DepartmentRepository repository) =>
            {
                var departments = await repository.GetAllAsync();
                return Results.Json(departments);
            });
        return router;
    }
}
