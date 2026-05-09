import { Body, Controller, Get, Inject, Post } from '@nestjs/common';
import { PaymentServiceService } from './payment-service.service';
import { ClientProxy, EventPattern, MessagePattern } from '@nestjs/microservices';
import { ProcessPaymentDto } from 'common/dto/process-payment.dto';

@Controller()
export class PaymentServiceController {
  constructor(
    @Inject('ORDER_SERVICE') private readonly orderClient: ClientProxy,
    @Inject('NOTIFICATION_SERVICE') private readonly notificationClient: ClientProxy,
    private readonly paymentServiceService: PaymentServiceService) {}

  @Get()
  getHello(): string {
    return this.paymentServiceService.getHello();
  }
  @MessagePattern({ cmd: 'process_payment' })
  async processPayment(paymentData: ProcessPaymentDto) {
    const result= await this.paymentServiceService.processPayment(paymentData);
    if(result && result.pidx){
      this.orderClient.emit('payment_initiated', { pidx: result.pidx ,orderId: paymentData.orderId});

    }
    return result.paymentUrl;
  }
  @MessagePattern({ cmd: 'verify_payment' })
  async verifyPayment(@Body() paymentData: { orderId: string; pidx: string }) {
    const result= await this.paymentServiceService.verifyPayment(paymentData);
   if(result.status === "Completed"){
    // Simulate sending a order confirmation to the orderservice and notification to the notification service
    this.orderClient.emit('order_confirmed', { orderId: paymentData.orderId,transactionId: result.transactionId });
    this.notificationClient.emit('payment_confirmed', { orderId: paymentData.orderId ,transactionId: result.transactionId });
   }
   return result;
  }

}
