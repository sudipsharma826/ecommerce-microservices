import { IsMongoId, IsNotEmpty, Min } from 'class-validator';

export class ProcessPaymentDto {
  @IsNotEmpty()
  @IsMongoId()
  orderId!: string;

  @IsNotEmpty()
  userId!: string;

 @IsNotEmpty()
  amount!: number;
}