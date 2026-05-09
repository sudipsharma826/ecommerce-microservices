import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Payment, PaymentDocument, PaymentStatus } from './common/schema/payment.schema';
import { ProcessPaymentDto } from 'common/dto/process-payment.dto';
import { ConfigService } from '@nestjs/config';


@Injectable()
export class PaymentServiceService {
  constructor(
    private readonly configService: ConfigService,
    @InjectModel(Payment.name) private paymentModel: Model<PaymentDocument>,
  ) {}

  getHello(): string {
    return 'Hello World!';
  }

  async processPayment(paymentData: ProcessPaymentDto) {
    const pidx = `p_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
    const created = await this.paymentModel.create({
      orderId: new Types.ObjectId(paymentData.orderId),
      amount: paymentData.amount,
      pidx,
      status: PaymentStatus.PENDING,
    });
    const KHALTI_URL = this.configService.get<string>('KHALTI_PAYMENT_URL') || 'https://khalti.com/payment';
    const paymentUrl = `https://${KHALTI_URL}?pidx=${pidx}`;

    // Update status to reflect that a payment URL was generated
    created.status = PaymentStatus.INITIALIZED;
    await created.save();

    return {
      orderId: paymentData.orderId,
      pidx,
      paymentUrl,
      status: PaymentStatus.INITIALIZED,
    };
  }

  async verifyPayment(paymentData: { orderId: string; pidx: string }) {
    // Placeholder verification flow; extend with real gateway verification
    return {
   "transactionId": paymentData.pidx,
   "status": "Completed",
    };
  }
}
