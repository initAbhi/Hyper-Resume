import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Template } from './entities/template.entity.js';

@Injectable()
export class TemplatesService implements OnModuleInit {
  constructor(
    @InjectRepository(Template)
    private readonly templateRepository: Repository<Template>,
  ) {}

  async onModuleInit() {
    await this.seedDefaultTemplates();
  }

  async listTemplates(): Promise<Template[]> {
    return this.templateRepository.find({
      where: { isActive: true },
      order: { createdAt: 'ASC' },
    });
  }

  private async seedDefaultTemplates(): Promise<void> {
    const defaults = [
      {
        templateKey: 'clean-modern',
        name: 'Clean Modern',
        description: 'Standard single-column layout engineered for high ATS parsing accuracy and tech roles.',
        isFree: true,
        layoutOptions: { font: 'Inter', headerStyle: 'centered', columns: 1 },
      },
      {
        templateKey: 'technical-ats',
        name: 'Technical ATS',
        description: 'Minimalist hierarchy optimized for engineering, DevOps, and backend roles.',
        isFree: true,
        layoutOptions: { font: 'Roboto', headerStyle: 'left-aligned', columns: 1 },
      },
      {
        templateKey: 'executive',
        name: 'Executive & Staff',
        description: 'Balanced typographic hierarchy for senior IC and engineering management roles.',
        isFree: true,
        layoutOptions: { font: 'Merriweather', headerStyle: 'split', columns: 1 },
      },
      {
        templateKey: 'minimalist-pro',
        name: 'Minimalist Pro',
        description: 'Ultra-compact single page template with subtle accent borders for competitive SaaS applications.',
        isFree: false,
        layoutOptions: { font: 'Geist', headerStyle: 'clean', columns: 1 },
      },
    ];

    await this.templateRepository
      .createQueryBuilder()
      .insert()
      .into(Template)
      .values(defaults.map((def) => ({ ...def, isActive: true })))
      .orIgnore()
      .execute();
  }
}
