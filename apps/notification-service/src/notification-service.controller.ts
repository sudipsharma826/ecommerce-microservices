import { Controller, Get } from '@nestjs/common';
import { NotificationServiceService } from './notification-service.service';
import { EventPattern } from '@nestjs/microservices';

@Controller()
export class NotificationServiceController {
  constructor(private readonly notificationServiceService: NotificationServiceService) {}

  @Get()
  getHello(): string {
    return this.notificationServiceService.getHello();
  }
  @EventPattern('payment_confirmed')
  async handlePaymentConfirmed(data: { orderId: string ,transactionId: string }) {
    await this.notificationServiceService.sendPaymentConfirmation(data.orderId, data.transactionId);
  }
}
