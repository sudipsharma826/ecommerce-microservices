import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { OrderDocument, OrderStatus } from './common/schema/order.schema';
import { ProductDocument } from './common/schema/product.schema';
import { CreateOrderDto } from 'common/dto/create-order.dto';
import { PaymentStatus } from 'apps/payment-service/src/common/schema/payment.schema';


@Injectable()
export class OrderServiceService {
  constructor(
    @InjectModel('Order') private readonly orderModel: Model<OrderDocument>,
    @InjectModel('Product') private readonly productModel: Model<ProductDocument>,
  ) {}
  getHello(): string {
    return 'Hello World!';
  }

  getPorduct() {
    // get data from database
    const products = this.productModel.find().exec();
    return products;
    
  }

  async createOrder(createOrderDto: CreateOrderDto) {
    const product = await this.productModel.findById(createOrderDto.productId).exec();

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (product.stock < createOrderDto.quantity) {
      throw new BadRequestException('Insufficient stock');
    }

    const totalPrice = product.price * createOrderDto.quantity;

    const order = await this.orderModel.create({
      userId: createOrderDto.userId,
      emailAddress: createOrderDto.emailAddress,
      productId: product._id,
      quantity: createOrderDto.quantity,
      totalPrice,
    });

    product.stock -= createOrderDto.quantity;
    await product.save();

    return order;
  }

  async getOrderDetailsWithProduct(orderId: string) {
    const order = await this.orderModel
      .findById(orderId)
      .populate('productId', 'name description price image brand category stock')
      .exec();

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Format response to match email service expectations
    return {
      _id: order._id,
      userId: order.userId,
      emailAddress: order.emailAddress,
      quantity: order.quantity,
      totalPrice: order.totalPrice,
      transactionId: order.transactionId,
      paymentStatus: order.paymentStatus,
      product: order.productId,
    };
  }

  async updateOrderStatus(orderId: string, transactionId: string) {
    await this.orderModel.findByIdAndUpdate({
      _id: orderId,
      transactionId,
    }, {
      paymentStatus: OrderStatus.CONFIRMED,
    }).exec();
  }
  async updatePaymentStatus(pidx: string, orderId: string) {
    //Update the order with the payment status using the transaction ID (pidx) and order ID
    await this.orderModel.findByIdAndUpdate(orderId, { paymentStatus: PaymentStatus.INITIALIZED, transactionId: pidx }).exec();
  }
  async getOrderById(orderId: string) {
    const order = await this.orderModel.findById(orderId).exec();
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    return order;
  }
}
