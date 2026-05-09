import { Body, Controller, Get, Post, Query, Res } from '@nestjs/common';
import { GatewayService } from './gateway.service';
import { CreateOrderDto } from '../../../common/dto/create-order.dto';
import type { Response } from 'express';
import { VerifyPaymentDto } from 'common/dto/verify-payment.dto';

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
  async verifyPayment(@Body() paymentData: VerifyPaymentDto) {
    return this.gatewayService.verifyPayment(paymentData.orderId, paymentData.pidx);
  }

  @Get('payment/verify')
  async verifyPaymentCallback(
    @Query('pidx') pidx: string,
    @Query('transaction_id') transactionId: string,
    @Query('tidx') tidx: string,
    @Query('status') status: string,
    @Query('purchase_order_id') purchaseOrderId: string,
    @Res() res: Response,
  ) {
    const result = await this.gatewayService.verifyPaymentCallback({
      pidx,
      transactionId,
      tidx,
      status,
      purchaseOrderId,
    });

    return res.redirect(result.redirectUrl);
  }
}

