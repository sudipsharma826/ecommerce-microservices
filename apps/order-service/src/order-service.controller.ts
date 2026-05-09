import { Controller, Get, Inject } from '@nestjs/common';
import { OrderServiceService } from './order-service.service';
import { ClientProxy, EventPattern, MessagePattern, Payload } from '@nestjs/microservices';
import { CreateOrderDto } from 'common/dto/create-order.dto';
import { firstValueFrom } from 'rxjs';


@Controller()
export class OrderServiceController {
  constructor(
    @Inject('PAYMENT_SERVICE') private readonly paymentClient: ClientProxy,
    private readonly orderServiceService: OrderServiceService) {}

  @Get()
  getHello(): string {
    return this.orderServiceService.getHello();
  }

  //Event handler for incoming messages from RabbitMQ
  @MessagePattern({ cmd: 'get_products' })
  async getProducts() {
    const products = await this.orderServiceService.getPorduct();
    return products;
  }

  @MessagePattern({ cmd: 'create_order' })
  async createOrder(@Payload() createOrderDto: CreateOrderDto) {
    const order=  await this.orderServiceService.createOrder(createOrderDto);
    // Send a message to the payment service to process payment
    const paymentResult = await firstValueFrom(
      this.paymentClient.send({ cmd: 'process_payment' }, {
        orderId: order._id,
        amount: order.totalPrice,
        userId: order.userId,
      })
    );
    return { order, paymentResult };
  }
  @EventPattern('payment_initiated')
  async handlePaymentInitiated(@Payload() data: { pidx: string ,orderId: string }) {
    await this.orderServiceService.updatePaymentStatus(data.pidx, data.orderId);
  }
  @EventPattern('order_confirmed')
  async handleOrderConfirmed(@Payload() data: { orderId: string,transactionId: string }) {
    await this.orderServiceService.updateOrderStatus(data.orderId, data.transactionId);
  }
}
