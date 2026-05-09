import { BadGatewayException, Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
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
    const orderData = await firstValueFrom(this.orderClient.send({ cmd: 'get_products' }, {}));
    return orderData;
  }
  async placeOrder(createOrderDto: CreateOrderDto) {
    // Send a message to the order service to create an order
    const order = await firstValueFrom(this.orderClient.send({ cmd: 'create_order' }, createOrderDto));
    return order;
  }
  async verifyPayment(orderId: string,pidx: string) {
    try {
      // Send a message to the payment service to verify payment status
      const paymentStatus = await firstValueFrom(
        this.paymentClient.send({ cmd: 'verify_payment' }, { orderId, pidx }),
      );
      return paymentStatus;
    } catch (error: any) {
      const message =
        error?.response?.message ||
        error?.message ||
        'Failed to verify payment';
      throw new BadGatewayException(message);
    }
  }

  async verifyPaymentCallback(callbackData: {
    pidx: string;
    transactionId: string;
    tidx: string;
    status: string;
    purchaseOrderId: string;
  }) {
    try {
      // Send a message to the payment service to verify payment from Khalti callback
      const verificationResult = await firstValueFrom(
        this.paymentClient.send({ cmd: 'verify_payment_callback' }, callbackData),
      );
      return verificationResult;
    } catch (error: any) {
      const message =
        error?.response?.message ||
        error?.message ||
        'Failed to verify payment callback';
      throw new BadGatewayException(message);
    }
  }
}
