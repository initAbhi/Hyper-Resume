import { IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateOrderDto {
  @IsString()
  @IsNotEmpty()
  planId!: string;

  @IsString()
  @IsOptional()
  @IsIn(['razorpay', 'stripe', 'mock', 'sandbox'])
  provider?: 'razorpay' | 'stripe' | 'mock' | 'sandbox' = 'sandbox';
}

