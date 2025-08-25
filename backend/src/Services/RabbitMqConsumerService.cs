using ProductsDotnetApi.Factories;
using RabbitMQ.Client;
using RabbitMQ.Client.Events;
using System.Text;
using System.Collections.Generic;

namespace ProductsDotnetApi.Services
{
    public class RabbitMqConsumerService
    {
        public List<string> ReadMessages(int maxMessages = 10)
        {
            var queueName = Environment.GetEnvironmentVariable("RABBITMQ_QUEUE") ?? "test-queue";
            var messages = new List<string>();
            using var connection = Factories.RabbitMqConnectionFactory.CreateConnection();
            using var channel = connection.CreateModel();
            var result = channel.BasicGet(queueName, true);
            int count = 0;
            while (result != null && count < maxMessages)
            {
                var body = result.Body.ToArray();
                var message = Encoding.UTF8.GetString(body);
                messages.Add(message);
                count++;
                result = channel.BasicGet(queueName, true);
            }
            return messages;
        }
    }
}
