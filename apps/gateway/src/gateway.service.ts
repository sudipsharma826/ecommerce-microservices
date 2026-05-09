import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class GatewayService {
  constructor(
    @Inject('ORDER_SERVICE') private readonly orderClient: ClientProxy,
    @Inject('PAYMENT_SERVICE') private readonly paymentClient: ClientProxy,
    @Inject('NOTIFICATION_SERVICE') private readonly notificationClient: ClientProxy,
  ) {}
  getHello(): string {
    return 'Hello World!';
  }

  async getProducts() {
    // Send a message to the order service and await the response
    const orderData = await this.orderClient.send({ cmd: 'get_products' }, {});
    return orderData;
  }
}
