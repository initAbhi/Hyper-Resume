import { env } from './env';
import { logger } from './logger';

const apiLogger = logger.child('ApiClient');

export interface ApiResponse<T> {
  data: T;
  meta: {
    requestId: string;
    timestamp: string;
    [key: string]: unknown;
  };
}

export interface ApiErrorPayload {
  statusCode: number;
  code: string;
  message: string;
  details: unknown[];
  requestId: string;
}

export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly details: unknown[];
  public readonly requestId: string;

  constructor(payload: ApiErrorPayload) {
    super(payload.message);
    this.name = 'ApiError';
    this.statusCode = payload.statusCode;
    this.code = payload.code;
    this.details = payload.details || [];
    this.requestId = payload.requestId || 'unknown';
  }
}

// Data Models
export interface User {
  id: string;
  email: string;
  fullName: string;
  role: 'user' | 'admin';
  isActive: boolean;
  isEmailVerified: boolean;
  createdAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface LoginResponse {
  user: User;
  tokens: AuthTokens;
}

export interface SignupResponse {
  user: User;
  tokens: AuthTokens;
}

export interface CurrentUserResponse {
  user: User;
  creditBalance: number;
}

export interface ResumeContent {
  contact: {
    fullName: string;
    email: string;
    phone?: string;
    location?: string;
    linkedinUrl?: string;
    githubUrl?: string;
    websiteUrl?: string;
    photoUrl?: string;
  };
  headline: string;
  summary: string;
  skills: Array<{ name: string; category?: string }>;
  experience: Array<{
    id?: string;
    company: string;
    title: string;
    location?: string;
    startDate: string;
    endDate?: string;
    current: boolean;
    bullets: string[];
  }>;
  education: Array<{
    id?: string;
    school: string;
    degree: string;
    field: string;
    graduationDate?: string;
    location?: string;
    gpa?: string;
  }>;
  projects?: Array<{
    id?: string;
    name: string;
    description: string;
    highlights: string[];
    url?: string;
  }>;
  certifications?: Array<{
    id?: string;
    name: string;
    issuer: string;
    issueDate?: string;
  }>;
}

export interface Resume {
  id: string;
  userId: string;
  name: string;
  targetRole?: string;
  targetCompany?: string;
  templateKey: string;
  locale: string;
  version: number;
  isMaster: boolean;
  isArchived: boolean;
  content: ResumeContent;
  createdAt: string;
  updatedAt: string;
}

export interface PdfCompressionVerification {
  validPdf: boolean;
  pageCountPreserved: boolean;
  textExtractionPassed: boolean;
  isScannedPdf?: boolean;
}

export interface PdfCompressionResponse {
  success: boolean;
  status: 'COMPRESSED' | 'SIZE_LIMIT_NOT_REACHED' | 'ALREADY_OPTIMIZED' | 'VERIFICATION_FAILED';
  originalSize: number;
  compressedSize: number;
  reductionPercentage: number;
  withinUploadLimit: boolean;
  verification: PdfCompressionVerification;
  message?: string;
  parsed?: {
    fileName: string;
    extractedTextLength: number;
    draft: ParsedProfileDraft;
  };
}

export interface ResumeVersion {
  id: string;
  resumeId: string;
  versionNumber: number;
  changeSummary: string;
  contentSnapshot: ResumeContent;
  jobMatchId?: string;
  createdAt: string;
}

export interface BulletDiff {
  original: string;
  adapted: string;
  metricFlag?: boolean;
  warnings?: string[];
}

export interface ExperienceDiff {
  company: string;
  title: string;
  bullets: BulletDiff[];
}

export interface SectionChanges {
  summary?: {
    original: string;
    adapted: string;
    metricFlag?: boolean;
    warnings?: string[];
  };
  headline?: {
    original: string;
    adapted: string;
  };
  experience?: ExperienceDiff[];
  skills?: {
    original: Array<{ name: string; category?: string }>;
    recommendedBenchmarkSkills: string[];
  };
  projects?: Array<{
    name: string;
    description: { original: string; adapted: string };
    highlights: BulletDiff[];
  }>;
}

export interface ResumeAdaptation {
  id: string;
  userId: string;
  sourceResumeId: string;
  sampleId: string;
  adaptationType: 'full_profile' | 'section';
  targetRole?: string | null;
  idempotencyKey: string;
  status: 'PENDING' | 'SUCCEEDED' | 'FAILED';
  creditsCharged: number;
  proposedContent?: ResumeContent | null;
  sectionChanges?: SectionChanges | null;
  unsupportedWarnings?: string[] | null;
  recommendedBenchmarkSkills?: string[] | null;
  usageMetadata?: {
    modelId: string;
    pricingVersion: string;
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
    costUsd: number;
  } | null;
  errorCode?: string | null;
  errorMessage?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ResumeAnalysis {
  id: string;
  userId: string;
  resumeId: string;
  analysisType: 'ats_audit' | 'job_match' | 'bullet_improve';
  score: number;
  findings: {
    actionVerbsCount: number;
    metricsCount: number;
    missingSections: string[];
    formattingFlags: string[];
    bulletQuality: Array<{
      bullet: string;
      hasActionVerb: boolean;
      hasMetric: boolean;
      feedback: string;
    }>;
  };
  recommendations: string[];
  createdAt: string;
}

export interface JobDescription {
  id: string;
  userId: string;
  title: string;
  companyName?: string;
  originalText: string;
  sourceUrl?: string;
  parsedRequirements?: Array<{
    id: string;
    text: string;
    type: 'required_skill' | 'preferred_skill' | 'experience' | 'education' | 'responsibility';
    weight: number;
    keywords: string[];
  }>;
  createdAt: string;
}

export interface JobMatchAnalysisResult {
  overallScore: number;
  subScores: {
    requiredSkills: number;
    preferredSkills: number;
    experienceAlignment: number;
    educationAlignment: number;
    actionMetricsDensity: number;
  };
  summary: string;
  matchedRequirements: Array<{
    requirementId: string;
    status: 'supported' | 'needs_confirmation' | 'not_evidenced' | 'not_applicable';
    confidence: number;
    evidenceQuotes: string[];
    explanation: string;
    suggestedAction: string;
  }>;
  missingKeywords: string[];
  recommendedImprovements: string[];
}

export interface JobMatch {
  id: string;
  userId: string;
  resumeId: string;
  jobDescriptionId: string;
  score: number;
  analysis: JobMatchAnalysisResult;
  tailoredVersionId?: string;
  createdAt: string;
  resume?: Resume;
  jobDescription?: JobDescription;
}

export type JobApplicationStatus =
  | 'bookmarked'
  | 'applying'
  | 'applied'
  | 'interviewing'
  | 'negotiating'
  | 'offer'
  | 'accepted'
  | 'withdrawn'
  | 'rejected'
  | 'ghosted'
  | 'archived'
  | 'draft';

export interface ApplicationInterviewRound {
  id: string;
  roundName: string;
  date?: string;
  type?: string;
  format?: string;
  interviewers?: { name: string; title?: string; linkedin?: string }[];
  notes?: string;
}

export interface ApplicationContact {
  id: string;
  name: string;
  role?: string;
  email?: string;
  linkedin?: string;
  notes?: string;
}

export interface ApplicationChecklistItem {
  id: string;
  text: string;
  completed: boolean;
  category?: 'applying' | 'interviewing' | 'offer';
}

export interface ApplicationRichMetadata {
  salary?: string;
  location?: string;
  excitement?: number; // 1 to 5 stars
  deadline?: string;
  followUpDate?: string;
  postedDate?: string;
  savedDate?: string;
  jobDescription?: string;
  notesText?: string;
  interviews?: ApplicationInterviewRound[];
  contacts?: ApplicationContact[];
  checklist?: ApplicationChecklistItem[];
  closeReason?: string;
}

// --- AI Interview Studio Types ---
export type InterviewSessionMode = 'quick_practice' | 'full_mock' | 'weak_area';
export type InterviewSessionStatus =
  | 'initializing'
  | 'in_progress'
  | 'completed'
  | 'abandoned'
  | 'failed'
  | 'expired';
export type InterviewDifficulty = 'junior' | 'mid' | 'senior';
export type QuestionCategory =
  | 'role_alignment'
  | 'resume_claim'
  | 'technical_depth'
  | 'job_match_gap'
  | 'behavioral';

export interface TurnEvaluation {
  starPresent?: {
    situation: boolean;
    task: boolean;
    action: boolean;
    result: boolean;
  };
  metricsDetected: boolean;
  technicalAccuracyNotes: string;
  strengths: string[];
  improvementTip: string;
  idealAnswerDraft?: string;
  isLockedForPro?: boolean;
}

export interface InterviewQuestion {
  id: string;
  sessionId: string;
  orderIndex: number;
  category: QuestionCategory;
  questionText: string;
  contextHint?: string;
  idealAnswerOutline?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InterviewTurn {
  id: string;
  sessionId: string;
  questionId: string;
  status: 'evaluating' | 'evaluated' | 'failed';
  candidateAnswer: string;
  timeTakenSeconds: number;
  turnScore?: number;
  evaluation?: TurnEvaluation;
  followUpQuestion?: string;
  followUpAnswer?: string;
  followUpScore?: number;
  followUpStatus?: string;
  evaluatedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InterviewSession {
  id: string;
  userId: string;
  resumeId: string;
  jobDescriptionId?: string;
  sessionMode: InterviewSessionMode;
  targetRole: string;
  difficulty: InterviewDifficulty;
  status: InterviewSessionStatus;
  isFreeTrial: boolean;
  totalQuestions: number;
  currentQuestionIndex: number;
  overallScore?: number;
  scoreBreakdown?: {
    starScore: number;
    technicalScore: number;
    relevanceScore: number;
    clarityScore: number;
  };
  summaryFeedback?: {
    strengths: string[];
    improvements: string[];
    actionItems: string[];
  };
  creditsCharged: number;
  idempotencyKey?: string;
  totalInputTokens: number;
  totalOutputTokens: number;
  thinkingTokens: number;
  estimatedCostUsd: number;
  expiresAt: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
  resume?: Resume;
  jobDescription?: JobDescription;
}

export interface InterviewReportData {
  session: InterviewSession;
  questions: InterviewQuestion[];
  turns: InterviewTurn[];
  isPaidUser: boolean;
}

export function parseApplicationMetadata(rawNotes?: string): ApplicationRichMetadata {
  if (!rawNotes) return {};
  try {
    const parsed = JSON.parse(rawNotes);
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return parsed as ApplicationRichMetadata;
    }
  } catch {
    // legacy or simple string
  }
  return { notesText: rawNotes };
}

export function serializeApplicationMetadata(meta: ApplicationRichMetadata): string {
  return JSON.stringify(meta);
}

export interface JobApplication {
  id: string;
  userId: string;
  resumeId?: string;
  jobDescriptionId?: string;
  companyName: string;
  jobTitle: string;
  status: JobApplicationStatus;
  applicationUrl?: string;
  appliedDate?: string;
  notes?: string;
  metadata?: ApplicationRichMetadata;
  createdAt: string;
  updatedAt: string;
}

export interface Template {
  id: string;
  templateKey: string;
  name: string;
  description: string;
  isFree: boolean;
  isActive: boolean;
  layoutOptions: {
    font: string;
    headerStyle: string;
    columns: number;
  };
}

export interface CreditLedgerItem {
  id: string;
  amount: number;
  transactionType: string;
  description: string;
  createdAt: string;
}

export interface CandidateProfile {
  id: string;
  userId: string;
  headline: string;
  summary: string;
  location: string;
  phone?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  websiteUrl?: string;
  skills: Array<{ name: string; category?: string }>;
  experience: Array<{
    id?: string;
    company: string;
    title: string;
    location?: string;
    startDate: string;
    endDate?: string;
    current: boolean;
    bullets: string[];
  }>;
  education: Array<{
    id?: string;
    school: string;
    degree: string;
    field: string;
    graduationDate?: string;
    location?: string;
    gpa?: string;
  }>;
  projects?: Array<{
    id?: string;
    name: string;
    description: string;
    highlights: string[];
    url?: string;
  }>;
  certifications?: Array<{
    id?: string;
    name: string;
    issuer: string;
    issueDate?: string;
  }>;
}

export interface ParsedProfileDraft {
  contact?: {
    fullName?: string;
    email?: string;
    phone?: string;
    location?: string;
    linkedinUrl?: string;
    githubUrl?: string;
    websiteUrl?: string;
  };
  headline: string;
  summary: string;
  location: string;
  skills: Array<{ name: string; category?: string }>;
  experience: Array<{
    company: string;
    title: string;
    location?: string;
    startDate: string;
    endDate?: string;
    current: boolean;
    bullets: string[];
  }>;
  education: Array<{
    school: string;
    degree: string;
    field: string;
    graduationDate?: string;
    location?: string;
    gpa?: string;
  }>;
  projects: Array<{
    name: string;
    description: string;
    highlights: string[];
    url?: string;
  }>;
  certifications: Array<{
    name: string;
    issuer: string;
    issueDate?: string;
  }>;
  confidenceScore: number;
}

export class ApiClient {
  private readonly baseUrl: string;
  private token: string | null = null;
  private refreshToken: string | null = null;
  private refreshPromise: Promise<string | null> | null = null;

  constructor(baseUrl: string = env.apiUrl) {
    this.baseUrl = baseUrl;
    if (typeof window !== 'undefined') {
      try {
        this.token = localStorage.getItem('hr_access_token');
        this.refreshToken = localStorage.getItem('hr_refresh_token');
      } catch {
        // Local storage unavailable (private browsing)
      }
    }
  }

  public getBaseUrl(): string {
    if (typeof window !== 'undefined') {
      const host = window.location.hostname;
      if (host === 'localhost' || host === '127.0.0.1') {
        return 'http://localhost:3001/api/v1';
      }
    }
    return this.baseUrl || env.apiUrl;
  }

  setToken(token: string | null) {
    this.setTokens(token, this.refreshToken);
  }

  setTokens(accessToken: string | null, refreshToken?: string | null) {
    this.token = accessToken;
    if (refreshToken !== undefined) {
      this.refreshToken = refreshToken;
    }
    if (typeof window !== 'undefined') {
      try {
        if (accessToken) {
          localStorage.setItem('hr_access_token', accessToken);
        } else {
          localStorage.removeItem('hr_access_token');
        }
        if (refreshToken) {
          localStorage.setItem('hr_refresh_token', refreshToken);
        } else if (refreshToken === null) {
          localStorage.removeItem('hr_refresh_token');
        }
      } catch {
        // Ignore storage write issues
      }
    }
  }

  getToken(): string | null {
    return this.token;
  }

  getRefreshToken(): string | null {
    return this.refreshToken;
  }

  async tryRefreshToken(): Promise<string | null> {
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = (async () => {
      try {
        const refreshUrl = `${this.getBaseUrl()}/auth/refresh`;
        const res = await fetch(refreshUrl, {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            refreshToken: this.refreshToken || undefined,
          }),
        });

        if (!res.ok) {
          this.setTokens(null, null);
          return null;
        }

        const body = await res.json();
        const tokens = body?.data?.tokens || body?.tokens;
        if (tokens?.accessToken) {
          this.setTokens(tokens.accessToken, tokens.refreshToken || this.refreshToken);
          return tokens.accessToken;
        }

        this.setTokens(null, null);
        return null;
      } catch {
        return null;
      } finally {
        this.refreshPromise = null;
      }
    })();

    return this.refreshPromise;
  }

  private generateRequestId(): string {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    return `req-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }

  async request<T>(
    endpoint: string,
    options: RequestInit = {},
    isRetry: boolean = false,
  ): Promise<ApiResponse<T>> {
    const url = `${this.getBaseUrl()}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
    const requestId =
      (options.headers as Record<string, string>)?.[
        'x-request-id'
      ] || this.generateRequestId();

    const headers: Record<string, string> = {
      'X-Request-ID': requestId,
      ...((options.headers as Record<string, string>) || {}),
    };

    // If body is NOT FormData, set JSON content type
    if (!(options.body instanceof FormData) && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json';
    }

    // Attach Bearer token if present
    if (this.token && !headers['Authorization']) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const method = (options.method || 'GET').toUpperCase();
    apiLogger.debug(`--> ${method} ${endpoint}`, { requestId });
    const startTime = typeof performance !== 'undefined' ? performance.now() : Date.now();

    let response: Response;
    try {
      response = await fetch(url, {
        credentials: 'include',
        ...options,
        headers,
      });
    } catch (networkError: unknown) {
      apiLogger.error(`Network failure on ${method} ${endpoint} [${requestId}]`, {
        error: networkError instanceof Error ? networkError.message : String(networkError),
      });
      throw new ApiError({
        statusCode: 0,
        code: 'NETWORK_ERROR',
        message:
          networkError instanceof Error
            ? networkError.message
            : 'Unable to connect to the HypeResume server.',
        details: [],
        requestId,
      });
    }

    const durationMs = Math.round(
      (typeof performance !== 'undefined' ? performance.now() : Date.now()) - startTime,
    );

    // Health check endpoints return unintercepted JSON
    if (endpoint.includes('/health')) {
      if (!response.ok) {
        apiLogger.warn(`<-- ${response.status} ${method} ${endpoint} (${durationMs}ms) [${requestId}]`);
        throw new ApiError({
          statusCode: response.status,
          code: 'SERVICE_UNAVAILABLE',
          message: 'Health check failed',
          details: [],
          requestId,
        });
      }
      const rawData = await response.json();
      apiLogger.debug(`<-- ${response.status} ${method} ${endpoint} (${durationMs}ms) [${requestId}]`);
      return {
        data: rawData as T,
        meta: {
          requestId: response.headers.get('x-request-id') || requestId,
          timestamp: new Date().toISOString(),
        },
      };
    }

    if (!response.ok) {
      // Auto-refresh token on 401 Unauthorized for non-auth requests
      if (
        response.status === 401 &&
        !isRetry &&
        !endpoint.includes('/auth/login') &&
        !endpoint.includes('/auth/signup') &&
        !endpoint.includes('/auth/refresh') &&
        !endpoint.includes('/auth/google') &&
        !endpoint.includes('/auth/reset-password') &&
        !endpoint.includes('/auth/forgot-password')
      ) {
        apiLogger.debug('Access token expired on 401, attempting silent token refresh', { endpoint });
        const newToken = await this.tryRefreshToken();
        if (newToken) {
          const retryHeaders = {
            ...headers,
            Authorization: `Bearer ${newToken}`,
          };
          return this.request<T>(endpoint, { ...options, headers: retryHeaders }, true);
        }
      }

      let errorPayload: ApiErrorPayload;
      try {
        const body = await response.json();
        errorPayload = {
          statusCode: body.statusCode || response.status,
          code: body.code || 'API_ERROR',
          message: body.message || response.statusText,
          details: body.details || [],
          requestId:
            body.requestId ||
            response.headers.get('x-request-id') ||
            requestId,
        };
      } catch {
        errorPayload = {
          statusCode: response.status,
          code: 'HTTP_ERROR',
          message: `Request failed with status ${response.status}`,
          details: [],
          requestId: response.headers.get('x-request-id') || requestId,
        };
      }
      apiLogger.error(
        `<-- ${response.status} ${method} ${endpoint} (${durationMs}ms) [${requestId}]`,
        errorPayload,
      );
      throw new ApiError(errorPayload);
    }

    apiLogger.debug(`<-- ${response.status} ${method} ${endpoint} (${durationMs}ms) [${requestId}]`);
    return (await response.json()) as ApiResponse<T>;
  }

  // --- Auth Endpoints ---
  async signup(dto: { email: string; password: string; fullName: string }) {
    const res = await this.request<SignupResponse>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(dto),
    });
    if (res.data.tokens?.accessToken) {
      this.setTokens(res.data.tokens.accessToken, res.data.tokens.refreshToken);
    }
    return res.data;
  }

  async login(dto: { email: string; password: string }) {
    const res = await this.request<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(dto),
    });
    if (res.data.tokens?.accessToken) {
      this.setTokens(res.data.tokens.accessToken, res.data.tokens.refreshToken);
    }
    return res.data;
  }

  async googleAuth(dto: {
    credential: string;
    targetRole?: string;
    targetGoal?: string;
    experienceLevel?: string;
  }) {
    const res = await this.request<LoginResponse & { isNewUser?: boolean }>('/auth/google', {
      method: 'POST',
      body: JSON.stringify(dto),
    });
    if (res.data.tokens?.accessToken) {
      this.setTokens(res.data.tokens.accessToken, res.data.tokens.refreshToken);
    }
    return res.data;
  }

  async refreshTokens(refreshToken?: string) {
    const res = await this.request<LoginResponse>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken: refreshToken || this.refreshToken || undefined }),
    });
    if (res.data.tokens?.accessToken) {
      this.setTokens(res.data.tokens.accessToken, res.data.tokens.refreshToken);
    }
    return res.data;
  }

  async requestPasswordReset(email: string) {
    const res = await this.request<{ message: string }>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
    return res.data;
  }

  async resetPassword(token: string, newPassword: string) {
    const res = await this.request<{ message: string }>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, newPassword }),
    });
    return res.data;
  }

  async logout() {
    try {
      await this.request<{ message: string }>('/auth/logout', {
        method: 'POST',
        body: JSON.stringify({ refreshToken: this.refreshToken || undefined }),
      });
    } catch {
      // Ignore network failures on logout
    } finally {
      this.setTokens(null, null);
    }
  }

  async getMe() {
    const res = await this.request<CurrentUserResponse>('/auth/me', {
      method: 'GET',
    });
    return res.data;
  }

  // --- Resumes Endpoints ---
  async listResumes(pagination?: { page?: number; limit?: number }) {
    const query = new URLSearchParams();
    if (pagination?.page) query.set('page', String(pagination.page));
    if (pagination?.limit) query.set('limit', String(pagination.limit));
    const endpoint = `/resumes${query.toString() ? `?${query.toString()}` : ''}`;
    const res = await this.request<{ items: Resume[]; total: number } | Resume[]>(endpoint);
    if (res.data && typeof res.data === 'object' && 'items' in (res.data as Record<string, unknown>)) {
      return ((res.data as unknown) as { items: Resume[] }).items || [];
    }
    return (Array.isArray(res.data) ? res.data : []) as Resume[];
  }

  async getResume(resumeId: string) {
    const res = await this.request<Resume>(`/resumes/${resumeId}`);
    return res.data;
  }

  async createResume(dto: {
    name: string;
    targetRole?: string;
    targetCompany?: string;
    templateKey?: string;
    locale?: string;
    content?: ResumeContent;
  }) {
    const { targetRole, targetCompany, ...payload } = dto;
    if (targetRole && payload.content && !payload.content.headline) {
      payload.content.headline = targetRole;
    }
    const res = await this.request<Resume>('/resumes', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return res.data;
  }

  async updateResume(
    resumeId: string,
    dto: {
      name?: string;
      templateKey?: string;
      locale?: string;
      content?: ResumeContent;
      expectedVersion?: number;
    },
  ) {
    const res = await this.request<Resume>(`/resumes/${resumeId}`, {
      method: 'PATCH',
      body: JSON.stringify(dto),
    });
    return res.data;
  }

  async archiveResume(resumeId: string) {
    const res = await this.request<{ message: string }>(`/resumes/${resumeId}`, {
      method: 'DELETE',
    });
    return res.data;
  }

  async listVersions(resumeId: string) {
    const res = await this.request<ResumeVersion[]>(`/resumes/${resumeId}/versions`);
    return res.data;
  }

  async createVersion(
    resumeId: string,
    dto: { changeSummary: string; jobMatchId?: string },
  ) {
    const res = await this.request<ResumeVersion>(`/resumes/${resumeId}/versions`, {
      method: 'POST',
      body: JSON.stringify(dto),
    });
    return res.data;
  }

  async runAnalysis(
    resumeId: string,
    dto: { analysisType: 'ats_check' | 'ats_audit' | 'comprehensive_audit' | 'job_match' | 'bullet_improve'; jobDescriptionId?: string },
  ) {
    const res = await this.request<ResumeAnalysis>(`/resumes/${resumeId}/analyses`, {
      method: 'POST',
      body: JSON.stringify(dto),
    });
    return res.data;
  }

  // --- Resume Adaptation Endpoints ---
  async adaptResume(dto: {
    sourceResumeId: string;
    sampleId: string;
    idempotencyKey: string;
    targetRole?: string;
    sampleBenchmarkData?: ResumeContent;
  }) {
    const res = await this.request<ResumeAdaptation>('/resumes/adapt', {
      method: 'POST',
      body: JSON.stringify(dto),
    });
    return res.data;
  }

  async adaptSection(dto: {
    sourceResumeId: string;
    sectionKey: 'summary' | 'experience' | 'skills' | 'projects';
    sampleId: string;
    idempotencyKey: string;
    targetRole?: string;
    sourceSectionData?: any;
    benchmarkSectionData?: any;
  }) {
    const res = await this.request<ResumeAdaptation>('/resumes/adapt-section', {
      method: 'POST',
      body: JSON.stringify(dto),
    });
    return res.data;
  }

  async getAdaptation(adaptationId: string) {
    const res = await this.request<ResumeAdaptation>(`/resumes/adaptations/${adaptationId}`);
    return res.data;
  }

  async applyAdaptation(
    adaptationId: string,
    dto: {
      title?: string;
      summaryDecision?: 'accept' | 'reject';
      bulletDecisions?: Record<string, Record<string, 'accept' | 'reject'>>;
      acceptedBenchmarkSkills?: string[];
      projectDecisions?: Record<string, 'accept' | 'reject'>;
      customFinalContent?: ResumeContent;
    },
  ) {
    const res = await this.request<Resume>(`/resumes/adaptations/${adaptationId}/apply`, {
      method: 'POST',
      body: JSON.stringify(dto),
    });
    return res.data;
  }

  // --- Resume Parsing Endpoint ---
  async uploadAndParseResume(file: File) {
    const formData = new FormData();
    formData.append('file', file);

    const res = await this.request<{
      fileName: string;
      extractedTextLength: number;
      draft: ParsedProfileDraft;
    }>('/resume-parsing/upload', {
      method: 'POST',
      body: formData,
    });
    return res.data;
  }

  // --- Smart PDF Compression Endpoints ---
  async compressResumePdf(file: File) {
    const formData = new FormData();
    formData.append('file', file);

    const res = await this.request<PdfCompressionResponse>('/resume-parsing/compress', {
      method: 'POST',
      body: formData,
    });
    return res.data;
  }

  async compressAndParseResume(file: File) {
    const formData = new FormData();
    formData.append('file', file);

    const res = await this.request<PdfCompressionResponse>('/resume-parsing/compress-and-parse', {
      method: 'POST',
      body: formData,
    });
    return res.data;
  }

  // --- Job Descriptions Endpoints ---
  async createJobDescription(dto: {
    title: string;
    companyName?: string;
    originalText: string;
    sourceUrl?: string;
  }) {
    const res = await this.request<JobDescription>('/job-descriptions', {
      method: 'POST',
      body: JSON.stringify(dto),
    });
    return res.data;
  }

  async listJobDescriptions(pagination?: { page?: number; limit?: number }) {
    const query = new URLSearchParams();
    if (pagination?.page) query.set('page', String(pagination.page));
    if (pagination?.limit) query.set('limit', String(pagination.limit));
    const endpoint = `/job-descriptions${query.toString() ? `?${query.toString()}` : ''}`;
    const res = await this.request<{ items: JobDescription[]; total: number } | JobDescription[]>(endpoint);
    if (res.data && typeof res.data === 'object' && 'items' in (res.data as Record<string, unknown>)) {
      return ((res.data as unknown) as { items: JobDescription[] }).items || [];
    }
    return (Array.isArray(res.data) ? res.data : []) as JobDescription[];
  }

  async getJobDescription(id: string) {
    const res = await this.request<JobDescription>(`/job-descriptions/${id}`);
    return res.data;
  }

  // --- Job Matching Endpoints ---
  private normalizeJobMatch(data: any): JobMatch {
    if (!data) return data;
    const score = Number(data.score ?? data.overallScore ?? 0);
    
    // Check if already in frontend analysis format
    if (data.analysis && data.analysis.matchedRequirements) {
      return {
        ...data,
        score,
      };
    }

    const rawReqs = Array.isArray(data.requirementsAnalysis)
      ? data.requirementsAnalysis
      : Array.isArray(data.analysis?.matchedRequirements)
      ? data.analysis.matchedRequirements
      : [];

    const matchedRequirements = rawReqs.map((r: any) => ({
      requirementId: r.requirementId || r.id || 'req',
      status: r.status || 'needs_confirmation',
      confidence: Number(r.confidence ?? 80),
      evidenceQuotes: Array.isArray(r.evidenceQuotes) ? r.evidenceQuotes : [],
      explanation: r.explanation || r.text || '',
      suggestedAction: r.suggestedAction || 'Review alignment with job description.',
    }));

    // Extract missing keywords from unevidenced or needing confirmation items
    const missingKeywords: string[] = [];
    rawReqs.forEach((r: any) => {
      if (r.status === 'not_evidenced' || r.status === 'needs_confirmation') {
        if (Array.isArray(r.keywords) && r.keywords.length > 0) {
          missingKeywords.push(...r.keywords);
        } else if (r.text) {
          // Extract keywords or use the requirement text
          missingKeywords.push(r.text);
        }
      }
    });

    const subScores = {
      requiredSkills: Number(data.scoreComponents?.requiredSkillsScore ?? data.analysis?.subScores?.requiredSkills ?? 85),
      preferredSkills: Number(data.scoreComponents?.preferredSkillsScore ?? data.analysis?.subScores?.preferredSkills ?? 75),
      experienceAlignment: Number(data.scoreComponents?.experienceScore ?? data.analysis?.subScores?.experienceAlignment ?? 88),
      educationAlignment: Number(data.scoreComponents?.responsibilityScore ?? data.analysis?.subScores?.educationAlignment ?? 95),
      actionMetricsDensity: Number(data.scoreComponents?.formattingScore ?? data.analysis?.subScores?.actionMetricsDensity ?? 80),
    };

    return {
      id: data.id,
      userId: data.userId,
      resumeId: data.resumeId,
      jobDescriptionId: data.jobDescriptionId,
      score,
      tailoredVersionId: data.tailoredVersionId,
      createdAt: data.createdAt,
      resume: data.resume,
      jobDescription: data.jobDescription,
      analysis: {
        overallScore: score,
        subScores,
        summary: data.recommendations?.[0] || 'Match analysis completed.',
        matchedRequirements,
        missingKeywords: Array.from(new Set(missingKeywords)),
        recommendedImprovements: Array.isArray(data.recommendations) ? data.recommendations : [],
      },
    };
  }

  async createJobMatch(dto: { resumeId: string; jobDescriptionId: string }) {
    const res = await this.request<any>('/job-matches', {
      method: 'POST',
      body: JSON.stringify(dto),
    });
    return this.normalizeJobMatch(res.data);
  }

  async getJobMatch(matchId: string) {
    const res = await this.request<any>(`/job-matches/${matchId}`);
    return this.normalizeJobMatch(res.data);
  }

  // --- Applications Endpoints ---
  async listApplications(pagination?: { page?: number; limit?: number }) {
    const query = new URLSearchParams();
    if (pagination?.page) query.set('page', String(pagination.page));
    if (pagination?.limit) query.set('limit', String(pagination.limit));
    const endpoint = `/applications${query.toString() ? `?${query.toString()}` : ''}`;
    const res = await this.request<{ items: JobApplication[]; total: number } | JobApplication[]>(endpoint);
    if (res.data && typeof res.data === 'object' && 'items' in (res.data as Record<string, unknown>)) {
      return ((res.data as unknown) as { items: JobApplication[] }).items || [];
    }
    return (Array.isArray(res.data) ? res.data : []) as JobApplication[];
  }


  async createApplication(dto: {
    companyName: string;
    jobTitle: string;
    resumeId?: string;
    jobDescriptionId?: string;
    status?: JobApplicationStatus;
    applicationUrl?: string;
    appliedDate?: string;
    notes?: string;
  }) {
    const payload = {
      company: dto.companyName,
      companyName: dto.companyName,
      role: dto.jobTitle,
      resumeId: dto.resumeId || undefined,
      resumeVersionId: undefined,
      jobUrl: dto.applicationUrl || undefined,
      applicationUrl: dto.applicationUrl || undefined,
      status: dto.status || 'applied',
      appliedDate: dto.appliedDate || undefined,
      notes: dto.notes || undefined,
    };
    const res = await this.request<JobApplication>('/applications', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return res.data;
  }

  async getApplication(id: string) {
    const res = await this.request<JobApplication>(`/applications/${id}`);
    return res.data;
  }

  async updateApplication(
    id: string,
    dto: {
      companyName?: string;
      jobTitle?: string;
      resumeId?: string;
      status?: JobApplicationStatus;
      applicationUrl?: string;
      appliedDate?: string;
      notes?: string;
    },
  ) {
    const payload = {
      ...(dto.companyName ? { company: dto.companyName, companyName: dto.companyName } : {}),
      ...(dto.jobTitle ? { role: dto.jobTitle, jobTitle: dto.jobTitle } : {}),
      ...(dto.resumeId !== undefined ? { resumeVersionId: dto.resumeId, resumeId: dto.resumeId } : {}),
      ...(dto.applicationUrl !== undefined ? { jobUrl: dto.applicationUrl, applicationUrl: dto.applicationUrl } : {}),
      ...(dto.status !== undefined ? { status: dto.status } : {}),
      ...(dto.appliedDate !== undefined ? { appliedDate: dto.appliedDate } : {}),
      ...(dto.notes !== undefined ? { notes: dto.notes } : {}),
    };
    const res = await this.request<JobApplication>(`/applications/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
    return res.data;
  }

  async deleteApplication(id: string) {
    const res = await this.request<{ message: string }>(`/applications/${id}`, {
      method: 'DELETE',
    });
    return res.data;
  }

  // --- AI Interview Studio Endpoints ---
  async startInterview(dto: {
    resumeId: string;
    jobDescriptionId?: string;
    sessionMode: InterviewSessionMode;
    targetRole: string;
    difficulty?: InterviewDifficulty;
    idempotencyKey?: string;
  }) {
    const headers: Record<string, string> = {};
    if (dto.idempotencyKey) {
      headers['idempotency-key'] = dto.idempotencyKey;
    }
    const res = await this.request<InterviewSession & { activeQuestion?: InterviewQuestion }>('/interviews/start', {
      method: 'POST',
      headers,
      body: JSON.stringify(dto),
    });
    return res.data;
  }

  async getInterviewSession(id: string) {
    const res = await this.request<{
      session: InterviewSession;
      questions: InterviewQuestion[];
      turns: InterviewTurn[];
      activeQuestion: InterviewQuestion | null;
    }>(`/interviews/${id}`);
    return res.data;
  }

  async submitInterviewAnswer(
    id: string,
    dto: { questionId: string; candidateAnswer: string; timeTakenSeconds: number },
  ) {
    const res = await this.request<InterviewTurn>(`/interviews/${id}/answer`, {
      method: 'POST',
      body: JSON.stringify(dto),
    });
    return res.data;
  }

  async submitInterviewFollowUp(
    id: string,
    dto: { questionId: string; followUpAnswer: string },
  ) {
    const res = await this.request<InterviewTurn>(`/interviews/${id}/follow-up`, {
      method: 'POST',
      body: JSON.stringify(dto),
    });
    return res.data;
  }

  async finishInterviewSession(id: string) {
    const res = await this.request<InterviewSession>(`/interviews/${id}/finish`, {
      method: 'POST',
    });
    return res.data;
  }

  async getInterviewReport(id: string) {
    const res = await this.request<InterviewReportData>(`/interviews/${id}/report`);
    return res.data;
  }

  async listInterviewSessions(pagination?: { page?: number; limit?: number }) {
    const query = new URLSearchParams();
    if (pagination?.page) query.set('page', String(pagination.page));
    if (pagination?.limit) query.set('limit', String(pagination.limit));
    const endpoint = `/interviews${query.toString() ? `?${query.toString()}` : ''}`;
    const res = await this.request<{ items: InterviewSession[]; total: number; page: number; limit: number } | InterviewSession[]>(endpoint);
    const data = res.data;
    if (data && typeof data === 'object' && 'items' in data && Array.isArray(data.items)) {
      return data;
    }
    if (Array.isArray(data)) {
      return { items: data, total: data.length, page: 1, limit: data.length };
    }
    return { items: [], total: 0, page: 1, limit: 20 };
  }

  // --- Templates Endpoints ---
  async listTemplates() {
    const res = await this.request<Template[]>('/templates');
    return res.data;
  }

  // --- Credits Endpoints ---
  async getCreditBalance() {
    const res = await this.request<{ balance: number }>('/credits/balance');
    return res.data.balance;
  }

  async getCreditHistory(pagination?: { page?: number; limit?: number }) {
    const query = new URLSearchParams();
    if (pagination?.page) query.set('page', String(pagination.page));
    if (pagination?.limit) query.set('limit', String(pagination.limit));
    const endpoint = `/credits/history${query.toString() ? `?${query.toString()}` : ''}`;
    const res = await this.request<CreditLedgerItem[]>(endpoint);
    return res.data;
  }

  // --- Profile Endpoints ---
  async getMyProfile() {
    const res = await this.request<CandidateProfile>('/profiles/me');
    return res.data;
  }

  async updateMyProfile(dto: Partial<CandidateProfile>) {
    const res = await this.request<CandidateProfile>('/profiles/me', {
      method: 'PUT',
      body: JSON.stringify(dto),
    });
    return res.data;
  }

  // --- Payments Endpoints ---
  async getPricingPlans() {
    const res = await this.request<PricingPlan[]>('/payments/plans');
    return res.data;
  }

  async createPaymentOrder(dto: { planId: string; provider?: string }) {
    const res = await this.request<PaymentOrderResponse>('/payments/create-order', {
      method: 'POST',
      body: JSON.stringify(dto),
    });
    return res.data;
  }

  async verifyPayment(dto: { orderId: string; providerPaymentId?: string }) {
    const res = await this.request<{ verified: boolean; paymentId: string; balance: number }>('/payments/verify', {
      method: 'POST',
      body: JSON.stringify(dto),
    });
    return res.data;
  }

  async getPaymentHistory() {
    const res = await this.request<PaymentRecord[]>('/payments/history');
    return res.data;
  }

  // --- Health Endpoints ---
  async getLiveStatus() {
    return this.request<{ status: string; uptime: number; timestamp: string }>('/health/live');
  }

  async getReadyStatus() {
    return this.request<{ status: string; database: string; timestamp: string }>('/health/ready');
  }

  async getHello() {
    return this.request<string>('/');
  }

  // --- Admin Endpoints ---
  async getAdminPaymentSettings() {
    const res = await this.request<AdminPaymentSettings>('/admin/settings/payment');
    return res.data;
  }

  async updateAdminPaymentMode(mode: 'test_mode' | 'live_mode') {
    const res = await this.request<AdminPaymentSettings>('/admin/settings/payment', {
      method: 'PATCH',
      body: JSON.stringify({ mode }),
    });
    return res.data;
  }

  async getAdminStats() {
    const res = await this.request<AdminStats>('/admin/stats');
    return res.data;
  }

  async getAdminRecentPayments(limit = 25) {
    const res = await this.request<AdminPaymentOrder[]>(`/admin/payments/recent?limit=${limit}`);
    return res.data;
  }

  async testAdminCheckout(planId = 'job_hunt_pack') {
    const res = await this.request<{
      orderId: string;
      mode: 'test_mode' | 'live_mode';
      checkoutUrl: string;
      providerOrderId: string;
    }>('/admin/test-checkout', {
      method: 'POST',
      body: JSON.stringify({ planId }),
    });
    return res.data;
  }

  async getAdminAnalytics() {
    const res = await this.request<AdminAnalyticsOverview>('/admin/analytics/overview');
    return res.data;
  }

  async getAdminUsers(search?: string, role?: string, limit = 50) {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (role && role !== 'all') params.append('role', role);
    params.append('limit', String(limit));
    const res = await this.request<AdminUserItem[]>(`/admin/users?${params.toString()}`);
    return res.data;
  }

  async grantAdminUserCredits(userId: string, amount: number, reason?: string) {
    const res = await this.request<{ userId: string; email: string; grantedAmount: number; newBalance: number }>(
      `/admin/users/${userId}/grant-credits`,
      {
        method: 'POST',
        body: JSON.stringify({ amount, reason }),
      },
    );
    return res.data;
  }

  async grantUserCredits(userId: string, amount: number, reason?: string) {
    return this.grantAdminUserCredits(userId, amount, reason);
  }

  async getAdminPayments(search?: string, status?: string, mode?: string, limit = 50) {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (status && status !== 'all') params.append('status', status);
    if (mode && mode !== 'all') params.append('mode', mode);
    params.append('limit', String(limit));
    const res = await this.request<AdminPaymentOrder[]>(`/admin/payments?${params.toString()}`);
    return res.data;
  }

  async getAdminResumes(search?: string, limit = 50) {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    params.append('limit', String(limit));
    const res = await this.request<AdminResumeItem[]>(`/admin/resumes?${params.toString()}`);
    return res.data;
  }

  async getAdminCreditsAudit(limit = 50) {
    const res = await this.request<AdminCreditAuditItem[]>(`/admin/credits/ledger?limit=${limit}`);
    return res.data;
  }
}

export interface AdminAnalyticsOverview {
  overview: {
    uniqueVisitors: number;
    pageViews: number;
    totalOrders: number;
    totalRevenue: string;
    conversionRate: string;
  };
  chartData: Array<{
    month: string;
    visitors: number;
    pageViews: number;
    orders: number;
    revenue: number;
  }>;
  topReferrers: Array<{
    source: string;
    share: string;
    visits: number;
  }>;
}

export interface AdminUserItem {
  id: string;
  email: string;
  fullName: string;
  role: 'user' | 'admin';
  isActive: boolean;
  isEmailVerified: boolean;
  creditBalance: number;
  resumesCount: number;
  createdAt: string;
}

export interface AdminResumeItem {
  id: string;
  name: string;
  userId: string;
  userEmail: string;
  templateKey: string;
  isMaster: boolean;
  version: number;
  updatedAt: string;
  createdAt: string;
}

export interface AdminCreditAuditItem {
  id: string;
  userId: string;
  userEmail: string;
  amount: number;
  transactionType: string;
  description: string;
  idempotencyKey: string;
  createdAt: string;
}

export interface AdminPaymentSettings {
  mode: 'test_mode' | 'live_mode';
  databaseMode: 'test_mode' | 'live_mode';
  provider: string;
  testConfigured: boolean;
  liveConfigured: boolean;
  testApiKeyMasked: string;
  liveApiKeyMasked: string;
  testWebhookKeyMasked: string;
  liveWebhookKeyMasked: string;
  testProducts: Record<string, string>;
  liveProducts: Record<string, string>;
  frontendUrl: string;
  updatedAt: string;
}

export interface AdminStats {
  totalUsers: number;
  totalPayments: number;
  successfulPayments: number;
  conversionRate?: string;
  totalRevenueMinor: number;
  totalRevenueFormatted: string;
  totalResumes: number;
  activePaymentMode: 'test_mode' | 'live_mode';
}

export interface AdminPaymentOrder {
  id: string;
  userId: string;
  userEmail: string;
  userName?: string;
  provider: string;
  orderId: string;
  providerTransactionId?: string;
  amountMinor: number;
  amountFormatted?: string;
  currency: string;
  status: 'pending' | 'succeeded' | 'failed' | 'refunded';
  planName: string;
  planId?: string;
  checkoutUrl?: string;
  environmentMode?: 'test_mode' | 'live_mode';
  createdAt: string;
}

export interface PricingPlan {
  id: string;
  name: string;
  tagline: string;
  amountMinor: number;
  currency: string;
  displayPrice: string;
  credits: number;
  billingType: 'one_time' | 'recurring_monthly';
  badge?: string;
  features: string[];
}

export interface PaymentOrderResponse {
  orderId: string;
  providerOrderId: string;
  amountMinor: number;
  currency: string;
  provider: string;
  checkoutUrl?: string;
  plan: PricingPlan;
}

export interface PaymentRecord {
  id: string;
  userId: string;
  provider: string;
  orderId: string;
  amountMinor: number;
  currency: string;
  status: 'pending' | 'succeeded' | 'failed' | 'refunded';
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export const apiClient = new ApiClient();

