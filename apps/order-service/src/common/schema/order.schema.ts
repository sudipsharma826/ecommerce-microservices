import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type OrderDocument = HydratedDocument<Order>;

@Schema({ _id: false })
export class OrderItem {
  @Prop({ type: Types.ObjectId, required: false })
  productId?: Types.ObjectId;

  @Prop({ required: true, trim: true })
  userID!: string;

  @Prop({ required: true, min: 1 })
  quantity!: number;

  @Prop({ required: true, min: 0 })
  price!: number;
}

export const OrderItemSchema = SchemaFactory.createForClass(OrderItem);

@Schema({ _id: false })
export class PaymentInfo {
  @Prop({ required: true, trim: true })
  method!: string;

  @Prop({ required: true, trim: true, default: 'pending' })
  status!: string;

  @Prop({ trim: true })
  transactionId?: string;
}

export const PaymentInfoSchema = SchemaFactory.createForClass(PaymentInfo);

@Schema({ timestamps: true })
export class Order {
  @Prop({ type: [OrderItemSchema], default: [] })
  items!: OrderItem[];

  @Prop({ type: PaymentInfoSchema, required: true })
  payment!: PaymentInfo;

  @Prop({ required: true, trim: true, default: 'pending' })
  status!: string;

  @Prop({ required: true, min: 0 })
  totalPrice!: number;
}

export const OrderSchema = SchemaFactory.createForClass(Order);


