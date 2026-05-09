import { Type } from 'class-transformer';
import { IsInt, IsMongoId, IsNotEmpty, Min } from 'class-validator';

export class VerifyPaymentDto {
  @IsNotEmpty()
  orderId!: string;

  @IsNotEmpty()
  pidx!: string;

}