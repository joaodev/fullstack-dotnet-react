using System.Net.Http;
using System.Net;
using System.Net.Http.Json;
using Xunit;
using Microsoft.AspNetCore.Mvc.Testing;
using System.Collections.Generic;

namespace Backend.Tests
{
    public class RabbitMqEndpointsTests : IClassFixture<WebApplicationFactory<Program>>
    {
        private readonly HttpClient _client;

        public RabbitMqEndpointsTests(WebApplicationFactory<Program> factory)
        {
            _client = factory.CreateClient();
        }

        [Fact]
        public async void GetRabbitMqMessages_ReturnsOkAndList()
        {
            // Publica uma mensagem na fila antes de consumir
            var factory = new RabbitMQ.Client.ConnectionFactory()
            {
                HostName = "localhost",
                UserName = "rabbitmq",
                Password = "rabbitmq"
            };
            using (var connection = factory.CreateConnection())
            using (var channel = connection.CreateModel())
            {
                var body = System.Text.Encoding.UTF8.GetBytes("mensagem de teste");
                channel.QueueDeclare(queue: "test-queue", durable: false, exclusive: false, autoDelete: false, arguments: null);
                channel.BasicPublish(exchange: "", routingKey: "test-queue", mandatory: false, basicProperties: null, body: body);
            }

            var response = await _client.GetAsync("/mensagens/rabbitmq");
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
            var result = await response.Content.ReadFromJsonAsync<RabbitMqResponse>();
            Assert.NotNull(result);
            Assert.NotNull(result.messages);
            Assert.True(result.messages is List<string>);

        }
    }

    public class RabbitMqResponse
    {
        public bool success { get; set; }
        public int count { get; set; }
        public List<string> messages { get; set; }
    }
}
