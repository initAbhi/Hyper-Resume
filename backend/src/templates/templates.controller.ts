import { Controller, Get } from '@nestjs/common';
import { TemplatesService } from './templates.service.js';

@Controller('templates')
export class TemplatesController {
  constructor(private readonly templatesService: TemplatesService) {}

  @Get()
  async listTemplates() {
    return this.templatesService.listTemplates();
  }
}
