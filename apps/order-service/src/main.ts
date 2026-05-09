import { NestFactory } from '@nestjs/core';
import { OrderServiceModule } from './order-service.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const config= new ConfigService();
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    OrderServiceModule,
    {
      transport:Transport.RMQ,
      options:{
        urls:[config.get<string>('RABBITMQ_URL') ?? ''],
        queue:config.get<string>('QUEUE_NAME') ?? '',
        queueOptions:{
          durable:false,
        }
      }
    }
  )
  app.listen();
  console.log('Order Service is listening for messages...');
}
bootstrap();
