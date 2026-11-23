import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { createHash } from 'node:crypto';
import { Repository } from 'typeorm';
import { EmailService } from '../email/email.service.js';
import { ContactSubmission, type ContactStatus } from './entities/contact-submission.entity.js';
import type { CreateContactDto } from './dto/create-contact.dto.js';

@Injectable()
export class ContactService {
  private readonly logger = new Logger(ContactService.name);

  constructor(
    @InjectRepository(ContactSubmission)
    private readonly submissionRepo: Repository<ContactSubmission>,
    private readonly emailService: EmailService,
  ) {}

  private hashIp(ip?: string | null): string | null {
    if (!ip) return null;
    return createHash('sha256').update(ip).digest('hex').slice(0, 32);
  }

  async createSubmission(
    dto: CreateContactDto,
    meta?: { userId?: string; ip?: string; userAgent?: string },
  ): Promise<{ id: string; status: ContactStatus }> {
    // Silent honeypot discard — pretend success so bots don't retry
    if (dto.website && dto.website.trim().length > 0) {
      this.logger.warn('Contact honeypot triggered — discarding submission');
      return { id: 'discarded', status: 'spam' };
    }

    const submission = this.submissionRepo.create({
      fullName: dto.fullName.trim(),
      email: dto.email.trim().toLowerCase(),
      topic: dto.topic,
      subject: dto.subject.trim(),
      message: dto.message.trim(),
      status: 'new',
      userId: meta?.userId || null,
      ipHash: this.hashIp(meta?.ip),
      userAgent: meta?.userAgent?.slice(0, 255) || null,
    });

    const saved = await this.submissionRepo.save(submission);

    // Fire-and-forget notification to support inbox + confirmation to submitter
    void this.notifySupport(saved);
    void this.confirmToSubmitter(saved);

    return { id: saved.id, status: saved.status };
  }

  private async notifySupport(submission: ContactSubmission): Promise<void> {
    try {
      await this.emailService.sendEmail({
        to: 'support@hype-resume.com',
        subject: `[Support] ${submission.topic.toUpperCase()} — ${submission.subject}`,
        text: [
          `New support request from ${submission.fullName} <${submission.email}>`,
          `Topic: ${submission.topic}`,
          `Subject: ${submission.subject}`,
          '',
          submission.message,
          '',
          `Submission ID: ${submission.id}`,
        ].join('\n'),
        html: `
          <div style="font-family:ui-sans-serif,system-ui,sans-serif;max-width:560px;margin:0 auto;color:#0f172a">
            <h2 style="margin:0 0 8px;font-size:18px">New support request</h2>
            <p style="margin:0 0 16px;color:#64748b;font-size:13px">
              From <strong>${submission.fullName}</strong>
              &lt;<a href="mailto:${submission.email}">${submission.email}</a>&gt;
            </p>
            <p style="margin:0 0 4px;font-size:13px"><strong>Topic:</strong> ${submission.topic}</p>
            <p style="margin:0 0 16px;font-size:13px"><strong>Subject:</strong> ${submission.subject}</p>
            <div style="padding:14px 16px;border-radius:12px;background:#f8fafc;border:1px solid #e2e8f0;white-space:pre-wrap;font-size:14px;line-height:1.55">
${submission.message.replace(/</g, '&lt;')}
            </div>
            <p style="margin:16px 0 0;font-size:11px;color:#94a3b8">ID: ${submission.id}</p>
          </div>
        `,
      });
    } catch (err) {
      this.logger.warn(
        `Support notification email failed: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  }

  private async confirmToSubmitter(submission: ContactSubmission): Promise<void> {
    try {
      await this.emailService.sendEmail({
        to: submission.email,
        subject: 'We received your message — HypeResume Support',
        text: `Hi ${submission.fullName},\n\nThanks for contacting HypeResume. Our team monitors support@hype-resume.com around the clock and typically replies within a few hours.\n\nYour subject: ${submission.subject}\nReference: ${submission.id}\n\n— HypeResume Support`,
        html: `
          <div style="font-family:ui-sans-serif,system-ui,sans-serif;max-width:560px;margin:0 auto;color:#0f172a">
            <h2 style="margin:0 0 8px;font-size:18px">We got your message</h2>
            <p style="margin:0 0 12px;font-size:14px;line-height:1.55;color:#334155">
              Hi ${submission.fullName}, thanks for reaching out. Our support team monitors
              <a href="mailto:support@hype-resume.com">support@hype-resume.com</a> continuously
              and typically replies within a few hours.
            </p>
            <p style="margin:0 0 4px;font-size:13px;color:#64748b"><strong>Subject:</strong> ${submission.subject}</p>
            <p style="margin:0;font-size:12px;color:#94a3b8">Reference: ${submission.id}</p>
          </div>
        `,
      });
    } catch (err) {
      this.logger.warn(
        `Submitter confirmation email failed: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  }

  async listSubmissions(options?: {
    status?: string;
    search?: string;
    limit?: number;
  }): Promise<ContactSubmission[]> {
    const qb = this.submissionRepo
      .createQueryBuilder('c')
      .orderBy('c.created_at', 'DESC')
      .take(Math.min(Math.max(options?.limit || 50, 1), 200));

    if (options?.status && options.status !== 'all') {
      qb.andWhere('c.status = :status', { status: options.status });
    }

    if (options?.search?.trim()) {
      const q = `%${options.search.trim().toLowerCase()}%`;
      qb.andWhere(
        '(LOWER(c.email) LIKE :q OR LOWER(c.full_name) LIKE :q OR LOWER(c.subject) LIKE :q OR LOWER(c.message) LIKE :q)',
        { q },
      );
    }

    return qb.getMany();
  }

  async updateStatus(
    id: string,
    status: ContactStatus,
    adminNotes?: string,
  ): Promise<ContactSubmission> {
    const row = await this.submissionRepo.findOne({ where: { id } });
    if (!row) throw new NotFoundException('Contact submission not found');
    row.status = status;
    if (adminNotes !== undefined) {
      row.adminNotes = adminNotes.trim() || null;
    }
    return this.submissionRepo.save(row);
  }

  async getUnreadCount(): Promise<number> {
    return this.submissionRepo.count({ where: { status: 'new' } });
  }
}
