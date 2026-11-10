import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  GoneException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { createHash, randomBytes } from 'node:crypto';
import { MoreThan, Repository } from 'typeorm';
import { Resume } from './entities/resume.entity.js';
import type { ResumeContent } from './entities/resume.types.js';
import { ResumeShare } from './entities/resume-share.entity.js';
import {
  ResumeShareEvent,
  type ResumeShareEventType,
} from './entities/resume-share-event.entity.js';
import type { UpdateResumeShareDto } from './dto/update-resume-share.dto.js';
import { DocxExportService } from './docx-export.service.js';
import { PdfExportService } from './pdf-export.service.js';
import type { ExportPdfDto } from './dto/export-pdf.dto.js';

const RESERVED_SLUGS = new Set([
  'admin',
  'api',
  'app',
  'examples',
  'login',
  'pricing',
  'privacy',
  'public',
  'register',
  'resumes',
  'security',
  'share',
  'terms',
  'tools',
]);

export interface ViewerTelemetryContext {
  ip?: string;
  userAgent?: string;
  referer?: string;
}

export interface ShareAnalyticsReport {
  totalViews: number;
  uniqueVisitors: number;
  pdfDownloads: number;
  docxDownloads: number;
  totalDownloads: number;
  printActions: number;
  contactClicks: number;
  lastViewedAt: string | null;
  dailyTrend: Array<{
    date: string;
    label: string;
    views: number;
    downloads: number;
  }>;
  deviceBreakdown: Array<{ device: string; count: number }>;
  referrerBreakdown: Array<{ referrer: string; count: number }>;
  recentEvents: Array<{
    id: string;
    eventType: ResumeShareEventType;
    referrer: string;
    deviceType: string;
    browser: string;
    os: string;
    createdAt: string;
  }>;
}

export interface ShareWithAnalyticsResponse {
  share: ResumeShare | null;
  analytics: ShareAnalyticsReport;
}

export interface PublicSharedResumePayload {
  slug: string;
  resumeId: string;
  resumeTitle: string;
  templateKey: string;
  content: ResumeContent;
  recruiterNote: string | null;
  allowPdfDownload: boolean;
  allowDocxDownload: boolean;
  hideContactDetails: boolean;
  updatedAt: string;
}

@Injectable()
export class ResumeSharesService {
  private readonly logger = new Logger(ResumeSharesService.name);

  constructor(
    @InjectRepository(Resume)
    private readonly resumeRepository: Repository<Resume>,
    @InjectRepository(ResumeShare)
    private readonly shareRepository: Repository<ResumeShare>,
    @InjectRepository(ResumeShareEvent)
    private readonly eventRepository: Repository<ResumeShareEvent>,
    private readonly docxExportService: DocxExportService,
    private readonly pdfExportService: PdfExportService,
  ) {}

  async listUserShareSummaries(
    userId: string,
  ): Promise<
    Array<{
      resumeId: string;
      slug: string;
      isActive: boolean;
      viewCount: number;
      uniqueVisitorCount: number;
      downloadCount: number;
      lastViewedAt: Date | null;
    }>
  > {
    const shares = await this.shareRepository.find({
      where: { userId },
      order: { updatedAt: 'DESC' },
    });
    return shares.map((s) => ({
      resumeId: s.resumeId,
      slug: s.slug,
      isActive: s.isActive,
      viewCount: s.viewCount,
      uniqueVisitorCount: s.uniqueVisitorCount,
      downloadCount: s.downloadCount,
      lastViewedAt: s.lastViewedAt ?? null,
    }));
  }

  async getShareWithAnalytics(
    userId: string,
    resumeId: string,
  ): Promise<ShareWithAnalyticsResponse> {
    await this.assertOwnedResume(userId, resumeId);
    const share = await this.shareRepository.findOne({
      where: { resumeId, userId },
    });

    if (!share) {
      return {
        share: null,
        analytics: this.buildAnalyticsReport(null, []),
      };
    }

    const events = await this.eventRepository.find({
      where: { shareId: share.id },
      order: { createdAt: 'DESC' },
      take: 500,
    });

    return {
      share,
      analytics: this.buildAnalyticsReport(share, events),
    };
  }

  async upsertShareSettings(
    userId: string,
    resumeId: string,
    dto: UpdateResumeShareDto,
  ): Promise<ShareWithAnalyticsResponse> {
    const resume = await this.assertOwnedResume(userId, resumeId);
    let share = await this.shareRepository.findOne({
      where: { resumeId, userId },
    });

    const requestedSlug =
      dto.slug !== undefined ? this.normalizeSlugInput(dto.slug) : undefined;
    if (requestedSlug !== undefined) {
      await this.assertSlugAvailable(requestedSlug, share?.id);
    }

    if (!share) {
      const generatedSlug =
        requestedSlug ||
        (await this.generateUniqueSlug(
          resume.content?.contact?.fullName || resume.name || 'candidate',
        ));
      share = this.shareRepository.create({
        resumeId,
        userId,
        slug: generatedSlug,
        isActive: dto.isActive ?? true,
        allowPdfDownload: dto.allowPdfDownload ?? true,
        allowDocxDownload: dto.allowDocxDownload ?? true,
        hideContactDetails: dto.hideContactDetails ?? false,
        recruiterNote: dto.recruiterNote?.trim() || null,
        expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
        viewCount: 0,
        uniqueVisitorCount: 0,
        downloadCount: 0,
      });
    } else {
      if (requestedSlug !== undefined) share.slug = requestedSlug;
      if (dto.isActive !== undefined) share.isActive = dto.isActive;
      if (dto.allowPdfDownload !== undefined) {
        share.allowPdfDownload = dto.allowPdfDownload;
      }
      if (dto.allowDocxDownload !== undefined) {
        share.allowDocxDownload = dto.allowDocxDownload;
      }
      if (dto.hideContactDetails !== undefined) {
        share.hideContactDetails = dto.hideContactDetails;
      }
      if (dto.recruiterNote !== undefined) {
        share.recruiterNote = dto.recruiterNote?.trim() || null;
      }
      if (dto.expiresAt !== undefined) {
        share.expiresAt = dto.expiresAt ? new Date(dto.expiresAt) : null;
      }
    }

    const saved = await this.shareRepository.save(share);
    this.logger.log(
      `Updated share "${saved.slug}" for resume ${resumeId} (active=${saved.isActive})`,
    );

    const events = await this.eventRepository.find({
      where: { shareId: saved.id },
      order: { createdAt: 'DESC' },
      take: 500,
    });

    return {
      share: saved,
      analytics: this.buildAnalyticsReport(saved, events),
    };
  }

  async regenerateSlug(
    userId: string,
    resumeId: string,
  ): Promise<ShareWithAnalyticsResponse> {
    const resume = await this.assertOwnedResume(userId, resumeId);
    const share = await this.shareRepository.findOne({
      where: { resumeId, userId },
    });

    const nextSlug = await this.generateUniqueSlug(
      resume.content?.contact?.fullName || resume.name || 'candidate',
    );

    if (!share) {
      return this.upsertShareSettings(userId, resumeId, {
        isActive: true,
        slug: nextSlug,
      });
    }

    share.slug = nextSlug;
    const saved = await this.shareRepository.save(share);
    const events = await this.eventRepository.find({
      where: { shareId: saved.id },
      order: { createdAt: 'DESC' },
      take: 500,
    });

    return {
      share: saved,
      analytics: this.buildAnalyticsReport(saved, events),
    };
  }

  async resetAnalytics(
    userId: string,
    resumeId: string,
  ): Promise<ShareWithAnalyticsResponse> {
    await this.assertOwnedResume(userId, resumeId);
    const share = await this.shareRepository.findOne({
      where: { resumeId, userId },
    });

    if (!share) {
      return {
        share: null,
        analytics: this.buildAnalyticsReport(null, []),
      };
    }

    await this.eventRepository.delete({ shareId: share.id });
    share.viewCount = 0;
    share.uniqueVisitorCount = 0;
    share.downloadCount = 0;
    share.lastViewedAt = null;
    const saved = await this.shareRepository.save(share);

    return {
      share: saved,
      analytics: this.buildAnalyticsReport(saved, []),
    };
  }

  async getPublicResumeBySlug(
    slug: string,
    viewerContext: ViewerTelemetryContext = {},
    trackView: boolean = true,
  ): Promise<PublicSharedResumePayload> {
    const { share, resume } = await this.resolveActivePublicShare(slug);

    if (trackView) {
      await this.recordTrackedEvent(share, 'view', viewerContext, true);
    }

    const sanitizedContent = this.maskContentIfPrivate(
      resume.content,
      share.hideContactDetails,
    );

    return {
      slug: share.slug,
      resumeId: resume.id,
      resumeTitle: resume.name,
      templateKey: resume.templateKey,
      content: sanitizedContent,
      recruiterNote: share.recruiterNote ?? null,
      allowPdfDownload: share.allowPdfDownload,
      allowDocxDownload: share.allowDocxDownload,
      hideContactDetails: share.hideContactDetails,
      updatedAt: resume.updatedAt.toISOString(),
    };
  }

  async recordPublicEvent(
    slug: string,
    eventType: ResumeShareEventType,
    viewerContext: ViewerTelemetryContext = {},
  ): Promise<{ recorded: boolean; eventType: ResumeShareEventType }> {
    const { share } = await this.resolveActivePublicShare(slug);
    await this.recordTrackedEvent(
      share,
      eventType,
      viewerContext,
      eventType === 'view',
    );
    return { recorded: true, eventType };
  }

  async exportPublicDocx(
    slug: string,
    pageSize: 'A4' | 'US Letter' = 'A4',
    viewerContext: ViewerTelemetryContext = {},
  ) {
    const { share, resume } = await this.resolveActivePublicShare(slug);
    if (!share.allowDocxDownload) {
      throw new ForbiddenException(
        'DOCX downloads are disabled by the candidate for this shared link.',
      );
    }

    const maskedResume: Resume = {
      ...resume,
      content: this.maskContentIfPrivate(resume.content, share.hideContactDetails),
    };

    const result = await this.docxExportService.generateResumeDocx(maskedResume, {
      pageSize,
      fileName: resume.name,
    });

    await this.recordTrackedEvent(share, 'download_docx', viewerContext, false);
    return result;
  }

  async exportPublicPdf(
    slug: string,
    dto: ExportPdfDto,
    viewerContext: ViewerTelemetryContext = {},
  ) {
    const { share, resume } = await this.resolveActivePublicShare(slug);
    if (!share.allowPdfDownload) {
      throw new ForbiddenException(
        'PDF downloads are disabled by the candidate for this shared link.',
      );
    }

    const result = await this.pdfExportService.generateVectorPdf({
      ...dto,
      fileName: dto.fileName || resume.name,
    });

    await this.recordTrackedEvent(share, 'download_pdf', viewerContext, false);
    return result;
  }

  private async assertOwnedResume(
    userId: string,
    resumeId: string,
  ): Promise<Resume> {
    const resume = await this.resumeRepository.findOne({
      where: { id: resumeId, userId, isArchived: false },
    });
    if (!resume) {
      throw new NotFoundException('Resume not found or access denied');
    }
    return resume;
  }

  private async resolveActivePublicShare(slug: string): Promise<{
    share: ResumeShare;
    resume: Resume;
  }> {
    const cleanSlug = (slug || '').trim().toLowerCase();
    if (!cleanSlug) {
      throw new NotFoundException('Shared resume link not found.');
    }

    const share = await this.shareRepository.findOne({
      where: { slug: cleanSlug },
    });

    if (!share || !share.isActive) {
      throw new NotFoundException(
        'This resume link is inactive or no longer shared.',
      );
    }

    if (share.expiresAt && share.expiresAt.getTime() < Date.now()) {
      throw new GoneException('This shared resume link has expired.');
    }

    const resume = await this.resumeRepository.findOne({
      where: { id: share.resumeId, isArchived: false },
    });

    if (!resume) {
      throw new NotFoundException('The shared resume no longer exists.');
    }

    return { share, resume };
  }

  private maskContentIfPrivate(
    content: ResumeContent,
    hideContactDetails: boolean,
  ): ResumeContent {
    const cloned = JSON.parse(JSON.stringify(content)) as ResumeContent;
    if (!hideContactDetails || !cloned.contact) {
      return cloned;
    }

    cloned.contact = {
      ...cloned.contact,
      email: '',
      phone: undefined,
    };
    return cloned;
  }

  private normalizeSlugInput(rawSlug: string): string {
    const normalized = rawSlug
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9-]+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

    if (normalized.length < 4 || normalized.length > 80) {
      throw new BadRequestException(
        'Custom share slug must be between 4 and 80 URL-safe characters.',
      );
    }

    if (RESERVED_SLUGS.has(normalized)) {
      throw new BadRequestException(
        `Slug "${normalized}" is reserved. Please choose another link name.`,
      );
    }

    return normalized;
  }

  private async assertSlugAvailable(
    slug: string,
    currentShareId?: string,
  ): Promise<void> {
    const existing = await this.shareRepository.findOne({ where: { slug } });
    if (existing && existing.id !== currentShareId) {
      throw new ConflictException(
        `Share URL "/r/${slug}" is already claimed. Please pick another custom slug.`,
      );
    }
  }

  private async generateUniqueSlug(baseName: string): Promise<string> {
    const base =
      baseName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')
        .slice(0, 40) || 'candidate-resume';

    for (let attempt = 0; attempt < 6; attempt++) {
      const suffix = randomBytes(3).toString('hex');
      const candidate = `${base}-${suffix}`;
      if (RESERVED_SLUGS.has(candidate)) continue;
      const existing = await this.shareRepository.findOne({
        where: { slug: candidate },
      });
      if (!existing) return candidate;
    }

    return `resume-${randomBytes(5).toString('hex')}`;
  }

  private async recordTrackedEvent(
    share: ResumeShare,
    eventType: ResumeShareEventType,
    viewerContext: ViewerTelemetryContext,
    dedupeRapidViews: boolean,
  ): Promise<void> {
    const telemetry = this.parseViewerTelemetry(viewerContext, share.id);

    // Avoid counting double-mounted dev loads within a 3-second window as two views
    if (dedupeRapidViews && telemetry.visitorHash) {
      const threeSecondsAgo = new Date(Date.now() - 3000);
      const recentView = await this.eventRepository.findOne({
        where: {
          shareId: share.id,
          eventType: 'view',
          visitorHash: telemetry.visitorHash,
          createdAt: MoreThan(threeSecondsAgo),
        },
      });
      if (recentView) {
        return;
      }
    }

    let isNewUniqueVisitor = false;
    if (eventType === 'view' && telemetry.visitorHash) {
      const priorEvent = await this.eventRepository.findOne({
        where: {
          shareId: share.id,
          eventType: 'view',
          visitorHash: telemetry.visitorHash,
        },
      });
      isNewUniqueVisitor = !priorEvent;
    }

    const event = this.eventRepository.create({
      shareId: share.id,
      resumeId: share.resumeId,
      eventType,
      visitorHash: telemetry.visitorHash,
      referrer: telemetry.referrer,
      deviceType: telemetry.deviceType,
      browser: telemetry.browser,
      os: telemetry.os,
    });

    await this.eventRepository.save(event);

    const now = new Date();
    if (eventType === 'view') {
      share.viewCount = (share.viewCount || 0) + 1;
      if (isNewUniqueVisitor) {
        share.uniqueVisitorCount = (share.uniqueVisitorCount || 0) + 1;
      }
      share.lastViewedAt = now;
      await this.shareRepository.save(share);
    } else if (
      eventType === 'download_pdf' ||
      eventType === 'download_docx'
    ) {
      share.downloadCount = (share.downloadCount || 0) + 1;
      share.lastViewedAt = now;
      await this.shareRepository.save(share);
    }
  }

  private parseViewerTelemetry(
    viewerContext: ViewerTelemetryContext,
    shareId: string,
  ): {
    visitorHash: string;
    referrer: string;
    deviceType: 'desktop' | 'mobile' | 'tablet' | 'bot';
    browser: string;
    os: string;
  } {
    const ip = viewerContext.ip?.trim() || 'unknown';
    const ua = viewerContext.userAgent?.trim() || '';

    const visitorHash = createHash('sha256')
      .update(`${shareId}:${ip}:${ua}`)
      .digest('hex')
      .slice(0, 32);

    let deviceType: 'desktop' | 'mobile' | 'tablet' | 'bot' = 'desktop';
    if (/googlebot|bingbot|linkedinbot|facebookexternalhit|slackbot|twitterbot/i.test(ua)) {
      deviceType = 'bot';
    } else if (/ipad|tablet|playbook|silk/i.test(ua)) {
      deviceType = 'tablet';
    } else if (/mobile|iphone|ipod|android.*mobile/i.test(ua)) {
      deviceType = 'mobile';
    }

    let browser = 'Unknown';
    if (/Edg\//i.test(ua)) browser = 'Edge';
    else if (/Chrome\//i.test(ua) && !/Chromium/i.test(ua)) browser = 'Chrome';
    else if (/Firefox\//i.test(ua)) browser = 'Firefox';
    else if (/Safari\//i.test(ua) && !/Chrome\//i.test(ua)) browser = 'Safari';

    let os = 'Unknown';
    if (/Windows/i.test(ua)) os = 'Windows';
    else if (/Macintosh|Mac OS X/i.test(ua)) os = 'macOS';
    else if (/iPhone|iPad|iPod/i.test(ua)) os = 'iOS';
    else if (/Android/i.test(ua)) os = 'Android';
    else if (/Linux/i.test(ua)) os = 'Linux';

    let referrer = 'Direct';
    const rawRef = viewerContext.referer?.trim();
    if (rawRef) {
      try {
        const parsed = new URL(rawRef);
        referrer = parsed.hostname.replace(/^www\./, '') || 'Direct';
      } catch {
        referrer = rawRef.slice(0, 120);
      }
    }

    return {
      visitorHash,
      referrer,
      deviceType,
      browser,
      os,
    };
  }

  private buildAnalyticsReport(
    share: ResumeShare | null,
    events: ResumeShareEvent[],
  ): ShareAnalyticsReport {
    const today = new Date();
    const dailyMap = new Map<
      string,
      { date: string; label: string; views: number; downloads: number }
    >();

    for (let offset = 13; offset >= 0; offset--) {
      const d = new Date(today);
      d.setUTCDate(d.getUTCDate() - offset);
      const isoDay = d.toISOString().slice(0, 10);
      const label = d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        timeZone: 'UTC',
      });
      dailyMap.set(isoDay, { date: isoDay, label, views: 0, downloads: 0 });
    }

    let pdfDownloads = 0;
    let docxDownloads = 0;
    let printActions = 0;
    let contactClicks = 0;

    const deviceCounts = new Map<string, number>();
    const referrerCounts = new Map<string, number>();

    for (const ev of events) {
      const created =
        ev.createdAt instanceof Date ? ev.createdAt : new Date(ev.createdAt);
      const dayKey = created.toISOString().slice(0, 10);
      const dayBucket = dailyMap.get(dayKey);

      if (ev.eventType === 'view') {
        if (dayBucket) dayBucket.views += 1;
        const devKey = ev.deviceType || 'desktop';
        deviceCounts.set(devKey, (deviceCounts.get(devKey) || 0) + 1);
        const refKey = ev.referrer || 'Direct';
        referrerCounts.set(refKey, (referrerCounts.get(refKey) || 0) + 1);
      } else if (ev.eventType === 'download_pdf') {
        pdfDownloads += 1;
        if (dayBucket) dayBucket.downloads += 1;
      } else if (ev.eventType === 'download_docx') {
        docxDownloads += 1;
        if (dayBucket) dayBucket.downloads += 1;
      } else if (ev.eventType === 'print') {
        printActions += 1;
      } else if (ev.eventType === 'contact_click') {
        contactClicks += 1;
      }
    }

    const deviceBreakdown = Array.from(deviceCounts.entries())
      .map(([device, count]) => ({ device, count }))
      .sort((a, b) => b.count - a.count);

    const referrerBreakdown = Array.from(referrerCounts.entries())
      .map(([referrer, count]) => ({ referrer, count }))
      .sort((a, b) => b.count - a.count);

    const recentEvents = events.slice(0, 15).map((ev) => ({
      id: ev.id,
      eventType: ev.eventType,
      referrer: ev.referrer || 'Direct',
      deviceType: ev.deviceType || 'desktop',
      browser: ev.browser || 'Unknown',
      os: ev.os || 'Unknown',
      createdAt:
        ev.createdAt instanceof Date
          ? ev.createdAt.toISOString()
          : String(ev.createdAt),
    }));

    return {
      totalViews: share?.viewCount ?? 0,
      uniqueVisitors: share?.uniqueVisitorCount ?? 0,
      pdfDownloads,
      docxDownloads,
      totalDownloads:
        share?.downloadCount ?? pdfDownloads + docxDownloads,
      printActions,
      contactClicks,
      lastViewedAt: share?.lastViewedAt
        ? share.lastViewedAt.toISOString()
        : null,
      dailyTrend: Array.from(dailyMap.values()),
      deviceBreakdown,
      referrerBreakdown,
      recentEvents,
    };
  }
}
