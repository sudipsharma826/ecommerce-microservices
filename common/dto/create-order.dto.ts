import { Type } from 'class-transformer';
import { IsInt, IsMongoId, IsNotEmpty, Min } from 'class-validator';

export class CreateOrderDto {
  @IsNotEmpty()
  userId!: string;

  @IsNotEmpty()
  emailAddress!: string;

  @IsNotEmpty()
  @IsMongoId()
  productId!: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  quantity!: number;
}