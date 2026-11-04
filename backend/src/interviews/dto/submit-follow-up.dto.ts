import {
  IsNotEmpty,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';

export class SubmitFollowUpDto {
  @IsUUID()
  @IsNotEmpty()
  questionId!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(15, { message: 'Follow-up answer must contain at least 15 characters.' })
  @MaxLength(1500, { message: 'Follow-up answer cannot exceed 1,500 characters.' })
  followUpAnswer!: string;
}

