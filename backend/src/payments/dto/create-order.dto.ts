import { IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateOrderDto {
  @IsString()
  @IsNotEmpty()
  planId!: string;

  @IsString()
  @IsOptional()
  @IsIn(['INR', 'USD'])
  currency?: 'INR' | 'USD' = 'INR';

  @IsString()
  @IsOptional()
  @IsIn(['dodo', 'razorpay', 'stripe', 'mock', 'sandbox'])
  provider?: 'dodo' | 'razorpay' | 'stripe' | 'mock' | 'sandbox';
}
