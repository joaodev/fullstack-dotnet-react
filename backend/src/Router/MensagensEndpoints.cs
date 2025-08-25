using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using ProductsDotnetApi.Services;

namespace ProductsDotnetApi.Router
{
    public static class MensagensEndpoints
    {
        /// <summary>
        /// Mapeia o endpoint para leitura de mensagens do RabbitMQ.
        /// </summary>
        /// <param name="app">Instância do WebApplication</param>
        public static void MapMensagensEndpoints(this WebApplication app)
        {
            app.MapGet("/mensagens/rabbitmq", async (HttpContext context) =>
            {
                try
                {
                    var consumer = new RabbitMqConsumerService();
                    var messages = await Task.Run(() => consumer.ReadMessages(10));
                    return Results.Ok(new
                    {
                        success = true,
                        count = messages.Count,
                        messages
                    });
                }
                catch (RabbitMQ.Client.Exceptions.BrokerUnreachableException ex)
                {
                    return Results.Problem($"Não foi possível conectar ao RabbitMQ: {ex.Message}", statusCode: 503);
                }
                catch (RabbitMQ.Client.Exceptions.OperationInterruptedException ex)
                {
                    return Results.Problem($"Erro ao acessar a fila RabbitMQ: {ex.Message}", statusCode: 500);
                }
                catch (Exception ex)
                {
                    return Results.Problem($"Erro inesperado: {ex.Message}", statusCode: 500);
                }
            });
        }
    }
}
