import { IsEmail, IsIn, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateContactDto {
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  fullName!: string;

  @IsEmail()
  @MaxLength(255)
  email!: string;

  @IsIn(['billing', 'technical', 'account', 'product', 'partnership', 'other'])
  topic!: 'billing' | 'technical' | 'account' | 'product' | 'partnership' | 'other';

  @IsString()
  @MinLength(4)
  @MaxLength(200)
  subject!: string;

  @IsString()
  @MinLength(20)
  @MaxLength(4000)
  message!: string;

  /** Honeypot — bots fill this; humans leave empty */
  @IsOptional()
  @IsString()
  @MaxLength(100)
  website?: string;
}

export class UpdateContactStatusDto {
  @IsIn(['new', 'in_progress', 'resolved', 'spam'])
  status!: 'new' | 'in_progress' | 'resolved' | 'spam';

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  adminNotes?: string;
}
