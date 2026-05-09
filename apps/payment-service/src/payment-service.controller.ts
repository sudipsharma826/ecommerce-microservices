import { Controller, Get, Inject } from '@nestjs/common';
import { PaymentServiceService } from './payment-service.service';
import { ClientProxy, EventPattern, MessagePattern, Payload } from '@nestjs/microservices';
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

  @MessagePattern({ cmd: 'verify_payment_callback' })
  async verifyPaymentCallback(@Payload() callbackData: {
    pidx: string;
    transactionId: string;
    tidx: string;
    status: string;
    purchaseOrderId: string;
  }) {
    const verificationResult = await this.paymentServiceService.verifyPaymentFromCallback(callbackData);

    if (verificationResult.status === 'Completed') {
      // Emit events to other services
      this.orderClient.emit('order_confirmed', {
        orderId: verificationResult.orderId,
        transactionId: verificationResult.transactionId,
      });
      this.notificationClient.emit('payment_confirmed', {
        orderId: verificationResult.orderId,
        transactionId: verificationResult.transactionId,
      });
    }

    return verificationResult;
  }
  @MessagePattern({ cmd: 'process_payment' })
  async processPayment(paymentData: ProcessPaymentDto) {
    const result= await this.paymentServiceService.processPayment(paymentData);
    if(result && result.pidx){
      this.orderClient.emit('payment_initiated', { pidx: result.pidx ,orderId: paymentData.orderId});

    }
    return {
      paymentUrl: result.paymentUrl,
      pidx: result.pidx,
    };
  }

  @MessagePattern({ cmd: 'verify_payment' })
  async verifyPayment(@Payload() paymentData: { orderId: string; pidx: string }) {
    const result= await this.paymentServiceService.verifyPayment(paymentData);
   if(result.status === "Completed"){
    // Simulate sending a order confirmation to the orderservice and notification to the notification service
    this.orderClient.emit('order_confirmed', { orderId: paymentData.orderId,transactionId: result.transactionId });
    this.notificationClient.emit('payment_confirmed', { orderId: paymentData.orderId ,transactionId: result.transactionId });
   }
   return result;
  }

}
