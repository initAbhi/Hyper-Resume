import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class ParseAttachmentUrlDto {
  @IsString()
  @IsNotEmpty({ message: 'Please provide a job posting URL.' })
  @MaxLength(2000, { message: 'URL is too long (maximum 2000 characters).' })
  url!: string;
}

