import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import axios from 'axios';
import { Model, Types } from 'mongoose';
import {
  Payment,
  PaymentDocument,
  PaymentStatus,
} from './common/schema/payment.schema';
import { ProcessPaymentDto } from 'common/dto/process-payment.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PaymentServiceService {
  constructor(
    private readonly configService: ConfigService,
    @InjectModel(Payment.name)
    private readonly paymentModel: Model<PaymentDocument>,
  ) {}

   getHello(): string {
    return 'Hello World!';
  }

  getWebsiteUrl(): string {
    return this.configService.get<string>('WEBSITE_URL') || 'http://localhost:3000';
  }

  private getKhaltiSecretKey(): string {
    return (this.configService.get<string>('KHALTI_SECRET_KEY') || '').replace(/^['"]|['"]$/g, '');
  }

  private getKhaltiHeaders() {
    return {
      'Content-Type': 'application/json',
      Authorization: `Key ${this.getKhaltiSecretKey()}`,
    };
  }

  async processPayment(paymentData: ProcessPaymentDto) {
    // Validation
    if (!paymentData.orderId || paymentData.amount <= 0) {
      throw new BadRequestException('Invalid payment data');
    }
    const khaltiAmount = Math.round(Number(paymentData.amount) * 100);
    const khaltiUrl =
      this.configService.get<string>('KHALTI_PAYMENT_URL') ?? '';
    console.log('Khalti URL:', khaltiUrl);
    let result;
    try {
      result = await axios.post(
        khaltiUrl,
        {
          return_url:
            this.configService.get<string>('KHALTI_RETURN_URL') ||
            'http://localhost:3000/payment/verify',
          website_url:
            this.configService.get<string>('WEBSITE_URL') ||
            'http://localhost:3000',
          amount: khaltiAmount,
          purchase_order_id: paymentData.orderId,
          purchase_order_name: `Order ${paymentData.orderId}`,
        },
        {
          headers: this.getKhaltiHeaders(),
        },
      );
    } catch (error: any) {
      const detail = error?.response?.data?.detail || error?.response?.data?.message || error?.message;
      throw new UnauthorizedException(`Khalti initiate failed: ${detail}`);
    }

    const responseData = result.data;
    console.log('Khalti response:', responseData);
    const created = await this.paymentModel.create({
      orderId: new Types.ObjectId(paymentData.orderId),
      amount: paymentData.amount,
      pidx: responseData.pidx,
      status: PaymentStatus.INITIALIZED,
    });
    if(!created){
      throw new UnauthorizedException('Failed to create payment record');
    }
    console.log('Payment record created with ID:', created._id, 'and pidx:', created.pidx);
    return {
      orderId: paymentData.orderId,
      pidx: responseData.pidx,
      paymentUrl: responseData.payment_url || khaltiUrl,
      status: PaymentStatus.INITIALIZED,
    };
  }

  async verifyPayment(paymentData: { orderId: string; pidx: string }) {
    if(!paymentData.orderId || !paymentData.pidx){
      throw new BadRequestException('Invalid payment data');
    }
    // Verify the payment with Khalti
    const khaltiVerifyUrl =
      this.configService.get<string>('KHALTI_VERIFY_URL') ||
      'https://a.khalti.com/api/v2/epayment/lookup/';

    let result;
    try {
      result = await axios.post(
        khaltiVerifyUrl,
        {
          pidx: paymentData.pidx,
        },
        {
          headers: this.getKhaltiHeaders(),
        },
      );
    } catch (error: any) {
      const detail = error?.response?.data?.detail || error?.response?.data?.message || error?.message;
      throw new UnauthorizedException(`Khalti lookup failed: ${detail}`);
    }

    const responseData = result.data;
    if(responseData.status !== 'Completed'){
      throw new BadRequestException('Payment not completed');
    }

    // Update the payment status in the database
    const updatedPayment = await this.paymentModel.findOneAndUpdate(
      { orderId: new Types.ObjectId(paymentData.orderId) },
      { status: PaymentStatus.COMPLETED },
      { returnDocument: 'after' }
    );
    if (!updatedPayment) {
      throw new NotFoundException('Payment record not found');
    }

    return {
      orderId: paymentData.orderId,
      transactionId: paymentData.pidx,
      status: PaymentStatus.COMPLETED,
    };
  }

  async verifyPaymentFromCallback(callbackData: {
    pidx: string;
    transactionId: string;
    tidx: string;
    status: string;
    purchaseOrderId: string;
  }) {
    // Validate callback data
    if (!callbackData.pidx || !callbackData.purchaseOrderId) {
      throw new BadRequestException('Invalid callback data');
    }

    // Verify the payment with Khalti
    const khaltiVerifyUrl =
      this.configService.get<string>('KHALTI_VERIFY_URL') ||
      'https://a.khalti.com/api/v2/epayment/lookup/';

    let result;
    try {
      result = await axios.post(
        khaltiVerifyUrl,
        {
          pidx: callbackData.pidx,
        },
        {
          headers: this.getKhaltiHeaders(),
        },
      );
    } catch (error: any) {
      const detail = error?.response?.data?.detail || error?.response?.data?.message || error?.message;
      throw new UnauthorizedException(`Khalti lookup failed: ${detail}`);
    }

    const responseData = result.data;
    const websiteUrl = this.getWebsiteUrl();

    if (responseData.status !== 'Completed') {
      throw new BadRequestException('Payment not completed');
    }

    // Update the payment status in the database
    const updatedPayment = await this.paymentModel.findOneAndUpdate(
      { pidx: callbackData.pidx },
      { status: PaymentStatus.COMPLETED },
    );

    if (!updatedPayment) {
      throw new NotFoundException('Payment record not found');
    }

    let redirectUrl: string;

    if (responseData.status === 'Completed') {
      redirectUrl = `${websiteUrl}?payment_status=success&order_id=${updatedPayment.orderId.toString()}`;
    } else {
      redirectUrl = `${websiteUrl}?payment_status=failed&order_id=${callbackData.purchaseOrderId}`;
    }

    return {
      orderId: updatedPayment.orderId.toString(),
      transactionId: callbackData.transactionId,
      pidx: callbackData.pidx,
      status: responseData.status,
      websiteUrl,
      redirectUrl,
    };
  }
}