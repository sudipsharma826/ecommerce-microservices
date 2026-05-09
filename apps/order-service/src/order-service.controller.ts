import { Controller, Get } from '@nestjs/common';
import { OrderServiceService } from './order-service.service';
import { MessagePattern } from '@nestjs/microservices';

@Controller()
export class OrderServiceController {
  constructor(private readonly orderServiceService: OrderServiceService) {}

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
}
