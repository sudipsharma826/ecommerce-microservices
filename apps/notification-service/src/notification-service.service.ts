import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { EmailService, OrderDetails } from './email/email.service';

@Injectable()
export class NotificationServiceService {
  private readonly logger = new Logger(NotificationServiceService.name);

  constructor(
    @Inject('ORDER_SERVICE') private readonly orderClient: ClientProxy,
    private readonly emailService: EmailService,
  ) {}

  getHello(): string {
    return 'Hello World!';
  }

  async sendPaymentConfirmation(orderId: string, transactionId: string) {
    try {
      this.logger.log(`Processing payment confirmation for order: ${orderId}`);

      // Fetch order details from order service
      const orderData = await firstValueFrom(
        this.orderClient.send(
          { cmd: 'get_order_details' },
          { orderId, transactionId },
        ),
      );

      if (!orderData) {
        this.logger.warn(`Order not found: ${orderId}`);
        return;
      }

      this.logger.log(`Retrieved order details for ${orderId}, sending email...`);

      // Send confirmation email
      await this.emailService.sendPaymentConfirmationEmail(orderData);

      this.logger.log(
        `Payment confirmation email sent successfully for order: ${orderId}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to send payment confirmation for order ${orderId}:`,
        error,
      );
      throw error;
    }
  }
}

