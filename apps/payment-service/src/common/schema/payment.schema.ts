import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type PaymentDocument = HydratedDocument<Payment>;

export enum PaymentStatus {
  COMPLETED = 'Completed',
  PENDING = 'Pending',
  USER_CANCELED = 'User canceled',
  INITIALIZED = 'Initialized',
}

@Schema({ timestamps: true })
export class Payment {
  @Prop({ type: Types.ObjectId, required: true, ref: 'Order' })
  orderId!: Types.ObjectId;

  @Prop({ required: true, min: 0 })
  amount!: number;

  @Prop({ trim: true })
  pidx!: string;

  @Prop({
    required: true,
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  status!: PaymentStatus;
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);