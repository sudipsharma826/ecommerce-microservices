import { Body, Controller, Get, Post } from '@nestjs/common';
import { GatewayService } from './gateway.service';
import { CreateOrderDto } from '../../../common/dto/create-order.dto';

@Controller()
export class GatewayController {
  constructor(private readonly gatewayService: GatewayService) {}

  @Get()
  getHello(): string {
    return this.gatewayService.getHello();
  }

  @Get('getProducts')
  async getProducts() {
    return this.gatewayService.getProducts();
  }

  @Post('place-order')
  async placeOrder(@Body() createOrderDto: CreateOrderDto) {
    return this.gatewayService.placeOrder(createOrderDto);
  }

  @Post('verifyPayment')
  async verifyPayment(@Body() paymentData: { orderId: string , pidx: string }) {
    return this.gatewayService.verifyPayment(paymentData.orderId, paymentData.pidx);
  }
}
