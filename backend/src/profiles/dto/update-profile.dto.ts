import {
  IsArray,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import type {
  ProfileCertification,
  ProfileEducation,
  ProfileExperience,
  ProfileProject,
  ProfileSkill,
} from '../entities/candidate-profile.entity.js';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  headline?: string;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  summary?: string;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  location?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  phone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  linkedinUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  githubUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  websiteUrl?: string;

  @IsOptional()
  @IsArray()
  skills?: ProfileSkill[];

  @IsOptional()
  @IsArray()
  experience?: ProfileExperience[];

  @IsOptional()
  @IsArray()
  education?: ProfileEducation[];

  @IsOptional()
  @IsArray()
  projects?: ProfileProject[];

  @IsOptional()
  @IsArray()
  certifications?: ProfileCertification[];
}
