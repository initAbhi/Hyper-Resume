import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Resume } from '../resumes/entities/resume.entity.js';
import { JobApplication } from '../applications/entities/job-application.entity.js';
import { JobsService } from '../jobs/jobs.service.js';
import { JobMatchingService } from '../job-matching/job-matching.service.js';
import { ApplicationsService } from '../applications/applications.service.js';
import {
  computeResumeJobFit,
  DEFAULT_ATS_BOARDS,
  fetchArbeitnowJobs,
  fetchAshbyBoard,
  fetchGreenhouseBoard,
  fetchLeverBoard,
  fetchRemotiveJobs,
  getOfflineFallbackJobs,
  type CuratedAtsBoard,
  type DiscoveredJobItem,
  type SourceFetchStatus,
} from './job-discovery-providers.util.js';
import type {
  RunDiscoveredMatchDto,
  SaveDiscoveredJobDto,
  SearchDiscoveredJobsDto,
} from './dto/job-discovery.dto.js';

@Injectable()
export class JobDiscoveryService {
  private readonly logger = new Logger(JobDiscoveryService.name);

  constructor(
    @InjectRepository(Resume)
    private readonly resumeRepository: Repository<Resume>,
    @InjectRepository(JobApplication)
    private readonly applicationRepository: Repository<JobApplication>,
    private readonly jobsService: JobsService,
    private readonly jobMatchingService: JobMatchingService,
    private readonly applicationsService: ApplicationsService,
  ) {}

  listSupportedBoards(): CuratedAtsBoard[] {
    return DEFAULT_ATS_BOARDS;
  }

  async searchJobs(
    userId: string,
    query: SearchDiscoveredJobsDto,
  ): Promise<{
    jobs: DiscoveredJobItem[];
    total: number;
    liveCount: number;
    sourcesStatus: SourceFetchStatus[];
    fetchedAt: string;
    feedMode: 'live' | 'offline_fallback';
    scoredAgainstResumeId?: string;
    scoredAgainstResumeName?: string;
  }> {
    const refresh = Boolean(query.refresh);
    const sourceFilter = query.source || 'all';
    const workplaceFilter = query.workplace || 'all';
    const sortBy = query.sort || 'match';

    // Load active resume (if provided or fallback to user's master/latest resume)
    let activeResume: Resume | null = null;
    if (query.resumeId) {
      activeResume = await this.resumeRepository.findOne({
        where: { id: query.resumeId, userId, isArchived: false },
      });
    } else {
      const userResumes = await this.resumeRepository.find({
        where: { userId, isArchived: false },
        order: { isMaster: 'DESC', updatedAt: 'DESC' },
        take: 1,
      });
      activeResume = userResumes[0] || null;
    }

    const fetchTasks: Array<{
      label: string;
      promise: Promise<{ items: DiscoveredJobItem[]; cached: boolean }>;
    }> = [];

    if (query.boardToken?.trim()) {
      const provider = query.boardProvider || (sourceFilter === 'ashby' ? 'ashby' : sourceFilter === 'lever' ? 'lever' : 'greenhouse');
      const token = query.boardToken.trim();
      if (provider === 'ashby') {
        fetchTasks.push({ label: `Ashby:${token}`, promise: fetchAshbyBoard(token, undefined, refresh) });
      } else if (provider === 'lever') {
        fetchTasks.push({ label: `Lever:${token}`, promise: fetchLeverBoard(token, undefined, refresh) });
      } else {
        fetchTasks.push({ label: `Greenhouse:${token}`, promise: fetchGreenhouseBoard(token, undefined, refresh) });
      }
    } else {
      if (sourceFilter === 'all' || sourceFilter === 'ashby') {
        fetchTasks.push({ label: 'Ashby:linear', promise: fetchAshbyBoard('linear', 'Linear', refresh) });
        fetchTasks.push({ label: 'Ashby:notion', promise: fetchAshbyBoard('notion', 'Notion', refresh) });
      }
      if (sourceFilter === 'all' || sourceFilter === 'greenhouse') {
        fetchTasks.push({ label: 'Greenhouse:stripe', promise: fetchGreenhouseBoard('stripe', 'Stripe', refresh) });
        fetchTasks.push({ label: 'Greenhouse:figma', promise: fetchGreenhouseBoard('figma', 'Figma', refresh) });
      }
      if (sourceFilter === 'all' || sourceFilter === 'remotive') {
        fetchTasks.push({ label: 'Remotive', promise: fetchRemotiveJobs(refresh) });
      }
      if (sourceFilter === 'all' || sourceFilter === 'arbeitnow') {
        fetchTasks.push({ label: 'Arbeitnow', promise: fetchArbeitnowJobs(refresh) });
      }
      if (sourceFilter === 'lever') {
        fetchTasks.push({ label: 'Lever:spotify', promise: fetchLeverBoard('spotify', 'Spotify', refresh) });
      }
    }

    const settled = await Promise.allSettled(fetchTasks.map((t) => t.promise));
    const sourcesStatus: SourceFetchStatus[] = [];
    let rawJobs: DiscoveredJobItem[] = [];

    settled.forEach((res, idx) => {
      const label = fetchTasks[idx].label;
      if (res.status === 'fulfilled') {
        sourcesStatus.push({
          source: label,
          ok: true,
          count: res.value.items.length,
          cached: res.value.cached,
        });
        rawJobs.push(...res.value.items);
      } else {
        const msg = res.reason instanceof Error ? res.reason.message : String(res.reason);
        this.logger.warn(`Job discovery source ${label} failed: ${msg}`);
        sourcesStatus.push({
          source: label,
          ok: false,
          count: 0,
          cached: false,
          error: msg,
        });
      }
    });

    const liveCount = rawJobs.filter((j) => j.isLive).length;
    let feedMode: 'live' | 'offline_fallback' = 'live';
    if (rawJobs.length === 0) {
      feedMode = 'offline_fallback';
      rawJobs = getOfflineFallbackJobs();
    }

    // Deduplicate across sources by normalized (company + title)
    const seenKeys = new Set<string>();
    const deduped: DiscoveredJobItem[] = [];
    for (const item of rawJobs) {
      const key = `${item.company.toLowerCase()}::${item.title.toLowerCase()}`;
      if (!seenKeys.has(key)) {
        seenKeys.add(key);
        deduped.push(item);
      }
    }

    // Load user applications to annotate tracked state honestly
    const userApps = await this.applicationRepository.find({
      where: { userId },
      select: { id: true, company: true, role: true, jobUrl: true },
    });
    const appByUrl = new Map<string, string>();
    const appByCompanyRole = new Map<string, string>();
    for (const app of userApps) {
      if (app.jobUrl) appByUrl.set(app.jobUrl.trim().toLowerCase(), app.id);
      appByCompanyRole.set(
        `${app.company.trim().toLowerCase()}::${app.role.trim().toLowerCase()}`,
        app.id,
      );
    }

    const qLower = (query.q || '').trim().toLowerCase();
    const qTokens = qLower.split(/\s+/).filter(Boolean);

    const filteredAndScored = deduped
      .filter((job) => {
        if (workplaceFilter !== 'all' && job.workplaceType.toLowerCase() !== workplaceFilter) {
          return false;
        }
        if (qTokens.length > 0) {
          const searchable = `${job.title} ${job.company} ${job.location} ${job.tags.join(' ')} ${job.snippet}`.toLowerCase();
          return qTokens.every((tok) => searchable.includes(tok));
        }
        return true;
      })
      .map((job) => {
        const fit = computeResumeJobFit(job, activeResume?.content);
        const trackedId =
          appByUrl.get(job.applyUrl.trim().toLowerCase()) ||
          appByCompanyRole.get(
            `${job.company.trim().toLowerCase()}::${job.title.trim().toLowerCase()}`,
          );

        return {
          ...job,
          matchScore: fit.matchScore,
          matchedSkills: fit.matchedSkills,
          missingKeywords: fit.missingKeywords,
          isSavedInTracker: Boolean(trackedId),
          trackedApplicationId: trackedId,
        };
      });

    filteredAndScored.sort((a, b) => {
      if (sortBy === 'recent') {
        return new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime();
      }
      return (b.matchScore || 0) - (a.matchScore || 0);
    });

    return {
      jobs: filteredAndScored.slice(0, 45),
      total: filteredAndScored.length,
      liveCount,
      sourcesStatus,
      fetchedAt: new Date().toISOString(),
      feedMode,
      scoredAgainstResumeId: activeResume?.id,
      scoredAgainstResumeName: activeResume?.name,
    };
  }

  async saveDiscoveredJobToTracker(userId: string, dto: SaveDiscoveredJobDto) {
    const existing = await this.applicationRepository.findOne({
      where: [
        ...(dto.applyUrl?.trim() ? [{ userId, jobUrl: dto.applyUrl.trim() }] : []),
        { userId, company: dto.company.trim(), role: dto.title.trim() },
      ],
    });

    if (existing) {
      return {
        alreadyTracked: true,
        application: existing,
        jobDescription: null,
      };
    }

    const jobDescription = await this.jobsService.createJobDescription(userId, {
      title: dto.title.trim(),
      companyName: dto.company.trim(),
      originalText:
        dto.descriptionText.trim().length >= 30
          ? dto.descriptionText.trim()
          : `${dto.title} at ${dto.company} (${dto.location || 'Remote'})`,
      sourceUrl: dto.applyUrl?.trim() || undefined,
    });

    const application = await this.applicationsService.createApplication(userId, {
      company: dto.company.trim(),
      role: dto.title.trim(),
      resumeId: dto.resumeId,
      jobUrl: dto.applyUrl?.trim() || undefined,
      status: 'bookmarked',
      jobDescriptionId: jobDescription.id,
      notes: `Discovered via ${dto.source || 'Live ATS Feed'}${dto.location ? ` · ${dto.location}` : ''}`,
    });

    return {
      alreadyTracked: false,
      application,
      jobDescription,
    };
  }

  async runDiscoveredJobMatch(userId: string, dto: RunDiscoveredMatchDto) {
    const resume = await this.resumeRepository.findOne({
      where: { id: dto.resumeId, userId, isArchived: false },
    });
    if (!resume) {
      throw new NotFoundException('Resume not found or access denied');
    }

    const jobDescription = await this.jobsService.createJobDescription(userId, {
      title: dto.title.trim(),
      companyName: dto.company.trim(),
      originalText:
        dto.descriptionText.trim().length >= 30
          ? dto.descriptionText.trim()
          : `${dto.title} at ${dto.company}`,
      sourceUrl: dto.applyUrl?.trim() || undefined,
    });

    const match = await this.jobMatchingService.createJobMatch(userId, {
      resumeId: dto.resumeId,
      jobDescriptionId: jobDescription.id,
    });

    return {
      jobDescription,
      match,
    };
  }
}
