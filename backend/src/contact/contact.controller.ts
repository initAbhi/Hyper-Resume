import { Body, Controller, HttpCode, HttpStatus, Post, Req } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { createPublicRateLimiter } from '../common/utils/public-rate-limit.util.js';
import { ContactService } from './contact.service.js';
import { CreateContactDto } from './dto/create-contact.dto.js';

@ApiTags('contact')
@Controller('contact')
export class ContactController {
  private readonly enforceRateLimit = createPublicRateLimiter(
    8,
    15 * 60 * 1000,
    'Too many support messages from this network. Please wait a few minutes and try again.',
  );

  constructor(private readonly contactService: ContactService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Submit a public contact / support request' })
  async submit(@Body() dto: CreateContactDto, @Req() req: Request) {
    this.enforceRateLimit(req);

    const result = await this.contactService.createSubmission(dto, {
      ip: req.ip || req.socket?.remoteAddress,
      userAgent: req.headers['user-agent'],
    });

    return {
      id: result.id === 'discarded' ? undefined : result.id,
      message:
        'Thanks — your message is with our support team. We typically reply within a few hours to the email you provided.',
    };
  }
}
