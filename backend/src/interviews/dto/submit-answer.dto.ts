import {
  IsInt,
  IsNotEmpty,
  IsString,
  IsUUID,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class SubmitAnswerDto {
  @IsUUID()
  @IsNotEmpty()
  questionId!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(15, { message: 'Answer must contain at least 15 characters to receive an evaluation.' })
  @MaxLength(1500, { message: 'Answer cannot exceed 1,500 characters.' })
  candidateAnswer!: string;

  @IsInt()
  @Min(0)
  timeTakenSeconds!: number;
}

