import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { OrderDocument } from './common/schema/order.schema';
import { ProductDocument } from './common/schema/product.schema';

@Injectable()
export class OrderServiceService {
  constructor(
    @InjectModel('Order') private readonly orderModel:Model<OrderDocument>,
    @InjectModel('Product') private readonly productModel:Model<ProductDocument>
  ) {}
  getHello(): string {
    return 'Hello World!';
  }

  getPorduct() {
    // get data from database
    const products = this.productModel.find().exec();
    return products;
    
  }
}
