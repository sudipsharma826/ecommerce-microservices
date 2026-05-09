import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { NotificationServiceModule } from './notification-service.module';

async function bootstrap() {
  const configEnv = new ConfigService();
  const rabbitmqUrl = configEnv.get<string>('RABBITMQ_URL') || 'amqp://localhost:5672';
  const queueName = configEnv.get<string>('QUEUE_NAME') || 'payment_queue';
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    NotificationServiceModule,
    {
      transport: Transport.RMQ, // Use RabbitMQ transport
      options: {
        urls: [rabbitmqUrl],
        queue: queueName,
        queueOptions: {
          durable: false,
        },
      },
    },
  );
  await app.listen();
  console.log('Notification Service is listening for messages...');
}
bootstrap();
