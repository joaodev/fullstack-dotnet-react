using RabbitMQ.Client;
using System;

namespace ProductsDotnetApi.Services
{
    public class RabbitMqTestConnection
    {
        public static void Test()
        {
            var factory = new ConnectionFactory()
            {
                HostName = Environment.GetEnvironmentVariable("RABBITMQ_HOST") ?? "localhost",
                UserName = Environment.GetEnvironmentVariable("RABBITMQ_USER") ?? "guest",
                Password = Environment.GetEnvironmentVariable("RABBITMQ_PASS") ?? "guest"
            };
            using var connection = factory.CreateConnection();
            using var channel = connection.CreateModel();
            Console.WriteLine("Conexão e canal RabbitMQ criados com sucesso!");
        }
    }
}
