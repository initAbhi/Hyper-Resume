import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CandidateProfile } from './entities/candidate-profile.entity.js';
import { UpdateProfileDto } from './dto/update-profile.dto.js';

@Injectable()
export class ProfilesService {
  constructor(
    @InjectRepository(CandidateProfile)
    private readonly profileRepository: Repository<CandidateProfile>,
  ) {}

  async getProfileByUserId(userId: string): Promise<CandidateProfile> {
    let profile = await this.profileRepository.findOne({
      where: { userId },
    });

    if (!profile) {
      // Auto-initialize if absent
      profile = this.profileRepository.create({
        userId,
        headline: '',
        summary: '',
        location: '',
        skills: [],
        experience: [],
        education: [],
        projects: [],
        certifications: [],
      });
      profile = await this.profileRepository.save(profile);
    }

    return profile;
  }

  async updateProfileByUserId(
    userId: string,
    dto: UpdateProfileDto,
  ): Promise<CandidateProfile> {
    const profile = await this.getProfileByUserId(userId);

    if (dto.headline !== undefined) profile.headline = dto.headline.trim();
    if (dto.summary !== undefined) profile.summary = dto.summary.trim();
    if (dto.location !== undefined) profile.location = dto.location.trim();
    if (dto.phone !== undefined) profile.phone = dto.phone?.trim();
    if (dto.linkedinUrl !== undefined) profile.linkedinUrl = dto.linkedinUrl?.trim();
    if (dto.githubUrl !== undefined) profile.githubUrl = dto.githubUrl?.trim();
    if (dto.websiteUrl !== undefined) profile.websiteUrl = dto.websiteUrl?.trim();

    if (dto.skills !== undefined) profile.skills = dto.skills;
    if (dto.experience !== undefined) profile.experience = dto.experience;
    if (dto.education !== undefined) profile.education = dto.education;
    if (dto.projects !== undefined) profile.projects = dto.projects;
    if (dto.certifications !== undefined) profile.certifications = dto.certifications;

    return this.profileRepository.save(profile);
  }
}
