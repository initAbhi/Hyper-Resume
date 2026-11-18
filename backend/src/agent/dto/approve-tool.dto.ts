import {
  IsArray,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  MaxLength,
} from 'class-validator';

export class ApproveToolDto {
  @IsNotEmpty()
  @IsUUID()
  executionId!: string;

  @IsNotEmpty()
  @IsString()
  @Length(64, 64, { message: 'proposalHash must be a 64-character SHA-256 hexadecimal string' })
  proposalHash!: string;

  @IsNotEmpty()
  @IsIn(['approve', 'reject'], { message: "decision must be either 'approve' or 'reject'" })
  decision!: 'approve' | 'reject';

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  acceptedFieldPaths?: string[];

  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;
}

