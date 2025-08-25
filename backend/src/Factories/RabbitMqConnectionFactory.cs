using RabbitMQ.Client;

namespace ProductsDotnetApi.Factories
{
    public static class RabbitMqConnectionFactory
    {
        public static IConnection CreateConnection()
        {
            var hostname = Environment.GetEnvironmentVariable("RABBITMQ_HOST") ?? "localhost";
            var username = Environment.GetEnvironmentVariable("RABBITMQ_DEFAULT_USER") ?? "user";
            var password = Environment.GetEnvironmentVariable("RABBITMQ_DEFAULT_PASS") ?? "password";
            var factory = new ConnectionFactory()
            {
                HostName = hostname,
                UserName = username,
                Password = password
            };
            return factory.CreateConnection();
        }
    }
}
