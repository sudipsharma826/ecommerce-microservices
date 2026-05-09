import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ProductDocument = HydratedDocument<Product>;

@Schema({ timestamps: true })
export class Product {
  @Prop({ required: true, trim: true })
  name!: string;

  @Prop({ required: true, trim: true })
  description!: string;

  @Prop({ required: true, min: 0 })
  price!: number;

  @Prop({ min: 0 })
  discountPrice?: number;

  @Prop({ trim: true })
  image?: string;

  @Prop({ type: [String], default: [] })
  tags?: string[];

  @Prop({ trim: true })
  brand?: string;

  @Prop({ trim: true })
  slug?: string;

  @Prop({ min: 0, max: 5, default: 0 })
  rating?: number;

  @Prop({ min: 0, default: 0 })
  numReviews?: number;

  @Prop({ default: false })
  isFeatured?: boolean;

  @Prop({ required: true, trim: true })
  category!: string;

  @Prop({ required: true, min: 0 })
  stock!: number;

}

export const ProductSchema = SchemaFactory.createForClass(Product);