import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { CreateOrderDto } from '../../../common/dto/create-order.dto';

@Injectable()
export class GatewayService {
  constructor(
    @Inject('ORDER_SERVICE') private readonly orderClient: ClientProxy,
    @Inject('PAYMENT_SERVICE') private readonly paymentClient: ClientProxy,
  ) {}
  getHello(): string {
    return 'Hello World!';
  }

  async getProducts() {
    // Send a message to the order service and await the response
    const orderData = await this.orderClient.send({ cmd: 'get_products' }, {});
    return orderData;
  }
  async placeOrder(createOrderDto: CreateOrderDto) {
    // Send a message to the order service to create an order
    const order = await this.orderClient.send({ cmd: 'create_order' }, createOrderDto);
    return order;
  }
  async verifyPayment(orderId: string,pidx: string) {
    // Send a message to the order service to verify payment status
    const paymentStatus = await this.paymentClient.send({ cmd: 'verify_payment' }, { orderId, pidx });
    return paymentStatus;
  }
}
