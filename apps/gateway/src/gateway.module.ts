import { Module } from '@nestjs/common';
import { GatewayController } from './gateway.controller';
import { GatewayService } from './gateway.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [
        join(process.cwd(), 'apps/gateway/.env'),
      ],
    }),
    // RabbitMQ Clients
    ClientsModule.registerAsync([
      {
        name: 'ORDER_SERVICE',
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (config: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [config.get<string>('RABBITMQ_URL') ?? ''],
            queue: config.get<string>('ORDER_SERVICE_QUEUE') ?? '',
            queueOptions: {
              durable: false,
            },
          },
        }),
      },

      {
        name: 'PAYMENT_SERVICE',
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (config: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [config.get<string>('RABBITMQ_URL') ?? ''],
            queue: config.get<string>('PAYMENT_SERVICE_QUEUE') ?? '',
            queueOptions: {
              durable: false,
            },
          },
        }),
      },

      {
        name: 'NOTIFICATION_SERVICE',
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (config: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [config.get<string>('RABBITMQ_URL') ?? ''],
            queue: config.get<string>('NOTIFICATION_SERVICE_QUEUE') ?? '',
            queueOptions: {
              durable: false,
            },
          },
        }),
      },
    ]),
  ],

  controllers: [GatewayController],
  providers: [GatewayService],
})
export class GatewayModule {}