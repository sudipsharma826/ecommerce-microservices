import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { join } from 'path';

import { MongooseModule } from '@nestjs/mongoose';

import { PaymentServiceController } from './payment-service.controller';
import { PaymentServiceService } from './payment-service.service';
import { Payment, PaymentSchema } from './common/schema/payment.schema';
import { ClientsModule, Transport } from '@nestjs/microservices';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [
        join(process.cwd(), 'apps/payment-service/.env'),
      ],
    }),

    // MongoDB Connection
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: config.get<string>('DATABASE_URL'),
      }),
    }),

    // Register Payment Schema
    MongooseModule.forFeature([
      {
        name: Payment.name,
        schema: PaymentSchema,
      },
    ]),
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
          }
        ]),
  ],

  controllers: [PaymentServiceController],
  providers: [PaymentServiceService],
})
export class PaymentServiceModule {}