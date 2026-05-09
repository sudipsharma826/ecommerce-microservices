import { NestFactory } from '@nestjs/core';
import { PaymentServiceModule } from './payment-service.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const configEnv = new ConfigService();
  const rabbitmqUrl = configEnv.get<string>('RABBITMQ_URL') || 'amqp://localhost:5672';
  const queueName = configEnv.get<string>('QUEUE_NAME') || 'payment_queue';
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    PaymentServiceModule,
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
  console.log('Payment Service is listening for messages...');
}
bootstrap();
