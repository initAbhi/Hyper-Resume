import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  validateSync,
} from 'class-validator';

export enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

export class EnvironmentVariables {
  @IsEnum(Environment)
  @IsOptional()
  NODE_ENV: Environment = Environment.Development;

  @IsNumber()
  @Min(1)
  @IsOptional()
  PORT: number = 3001;

  @IsString()
  @IsOptional()
  FRONTEND_URL: string = 'http://localhost:3000';

  @IsString()
  DATABASE_HOST: string = 'localhost';

  @IsNumber()
  @Min(1)
  DATABASE_PORT: number = 5432;

  @IsString()
  DATABASE_NAME: string = 'hyper_resume_db';

  @IsString()
  DATABASE_USER: string = 'postgres';

  @IsString()
  DATABASE_PASSWORD!: string;

  @IsString()
  @IsOptional()
  JWT_SECRET: string = 'dev-hyper-resume-secret-key-min-32-chars-long';

  @IsString()
  @IsOptional()
  JWT_EXPIRATION: string = '7d';

  @IsString()
  @IsOptional()
  PAYMENT_PROVIDER?: string = 'sandbox';

  @IsString()
  @IsOptional()
  RAZORPAY_KEY_ID?: string;

  @IsString()
  @IsOptional()
  RAZORPAY_KEY_SECRET?: string;

  @IsString()
  @IsOptional()
  RAZORPAY_WEBHOOK_SECRET?: string;

  @IsString()
  @IsOptional()
  AI_PROVIDER?: string = 'mock';

  @IsString()
  @IsOptional()
  AI_API_KEY?: string;

  @IsString()
  @IsOptional()
  EMAIL_PROVIDER?: string = 'mock';
}


export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    const messages = errors
      .map((err) => Object.values(err.constraints || {}).join(', '))
      .join('; ');
    throw new Error(`Configuration validation failed: ${messages}`);
  }

  return validatedConfig;
}
