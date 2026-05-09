import { Module } from '@nestjs/common';
import { NotificationServiceController } from './notification-service.controller';
import { NotificationServiceService } from './notification-service.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { EmailService } from './email/email.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [
        join(process.cwd(), 'apps/notification-service/.env'),
      ],
      
    }),
    ClientsModule.registerAsync([
      {
        name: 'ORDER_SERVICE',
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [configService.get<string>('RABBITMQ_URL') || 'amqp://localhost:5672'],
            queue: configService.get<string>('RABBITMQ_ORDER_QUEUE') || 'order_queue',
            queueOptions: { durable: false },
          },
        }),
      },
    ]),
  ],
  controllers: [NotificationServiceController],
  providers: [NotificationServiceService, EmailService],
})
export class NotificationServiceModule {}
