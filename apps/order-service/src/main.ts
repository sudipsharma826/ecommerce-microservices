import { NestFactory } from '@nestjs/core';
import { OrderServiceModule } from './order-service.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';




async function bootstrap() {
  const configEnv = new ConfigService();
  const rabbitmqUrl = configEnv.get<string>('RABBITMQ_URL') || 'amqp://localhost:5672';
  const queueName = configEnv.get<string>('QUEUE_NAME') || 'order_queue';

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    OrderServiceModule,
    {
      transport: Transport.RMQ,
      options: {
        urls: [rabbitmqUrl],
        queue: queueName,
        queueOptions: {
          durable: false,
        },
      },
    }
  );

  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
  const config = app.get(ConfigService);
  console.log(`Order service using queue ${config.get<string>('QUEUE_NAME')}`);
  await app.listen();
  console.log('Order Service is listening for messages...');
}
bootstrap();
