import { Module } from '@nestjs/common';
import { GatewayController } from './gateway.controller';
import { GatewayService } from './gateway.service';
import { ConfigModule } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ClientsModule.register([ 
      {
        name:'ORDER_SERVICE', // client name  used to inject the client proxy
        transport: Transport.RMQ, // Communication protocol
        options: {
          urls: ['amqp://localhost:5672'], // RabbitMQ server URL
          queue: 'order_queue', // Queue name to listen to
          queueOptions: {
            durable: false // Whether the queue should survive broker restarts
          }
        },
      },
            {
        name:'PAYMENT_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://localhost:5672'],
          queue: 'payment_queue',
          queueOptions: {
            durable: false
          }
        },
      },
            {
        name:'NOTIFICATION_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://localhost:5672'],
          queue: 'notification_queue',
          queueOptions: {
            durable: false
          }
        },
      },

    ]),
  ],
  controllers: [GatewayController],
  providers: [GatewayService],
})
export class GatewayModule {}
