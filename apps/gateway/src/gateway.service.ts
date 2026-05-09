import { Injectable } from '@nestjs/common';

@Injectable()
export class GatewayService {
  getHello(): string {
    return 'Hello World!';
  }

  async getOrderData() {
    // Simulate fetching order data from the order service
    return {
      orderId: 123,
      product: 'Laptop',
      quantity: 1,
      price: 999.99,
    };
  }
}
