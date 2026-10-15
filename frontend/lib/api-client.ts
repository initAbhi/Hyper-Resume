import { env } from './env';

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

export interface ResumeVersion {
  id: string;
  resumeId: string;
  versionNumber: number;
  changeSummary: string;
  contentSnapshot: ResumeContent;
  jobMatchId?: string;
  createdAt: string;
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

export interface JobApplication {
  id: string;
  userId: string;
  resumeId?: string;
  jobDescriptionId?: string;
  companyName: string;
  jobTitle: string;
  status: 'draft' | 'applied' | 'interviewing' | 'offer' | 'rejected' | 'archived';
  applicationUrl?: string;
  appliedDate?: string;
  notes?: string;
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

  constructor(baseUrl: string = env.apiUrl) {
    this.baseUrl = baseUrl;
    if (typeof window !== 'undefined') {
      try {
        this.token = localStorage.getItem('hr_access_token');
      } catch {
        // Local storage unavailable (private browsing)
      }
    }
  }

  setToken(token: string | null) {
    this.token = token;
    if (typeof window !== 'undefined') {
      try {
        if (token) {
          localStorage.setItem('hr_access_token', token);
        } else {
          localStorage.removeItem('hr_access_token');
        }
      } catch {
        // Ignore storage write issues
      }
    }
  }

  getToken(): string | null {
    return this.token;
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
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
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

    let response: Response;
    try {
      response = await fetch(url, {
        credentials: 'include',
        ...options,
        headers,
      });
    } catch (networkError: unknown) {
      throw new ApiError({
        statusCode: 0,
        code: 'NETWORK_ERROR',
        message:
          networkError instanceof Error
            ? networkError.message
            : 'Unable to connect to the HyperResume server.',
        details: [],
        requestId,
      });
    }

    // Health check endpoints return unintercepted JSON
    if (endpoint.includes('/health')) {
      if (!response.ok) {
        throw new ApiError({
          statusCode: response.status,
          code: 'SERVICE_UNAVAILABLE',
          message: 'Health check failed',
          details: [],
          requestId,
        });
      }
      const rawData = await response.json();
      return {
        data: rawData as T,
        meta: {
          requestId: response.headers.get('x-request-id') || requestId,
          timestamp: new Date().toISOString(),
        },
      };
    }

    if (!response.ok) {
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
      throw new ApiError(errorPayload);
    }

    return (await response.json()) as ApiResponse<T>;
  }

  // --- Auth Endpoints ---
  async signup(dto: { email: string; password: string; fullName: string }) {
    const res = await this.request<SignupResponse>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(dto),
    });
    if (res.data.tokens?.accessToken) {
      this.setToken(res.data.tokens.accessToken);
    }
    return res.data;
  }

  async login(dto: { email: string; password: string }) {
    const res = await this.request<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(dto),
    });
    if (res.data.tokens?.accessToken) {
      this.setToken(res.data.tokens.accessToken);
    }
    return res.data;
  }

  async logout() {
    try {
      await this.request<{ message: string }>('/auth/logout', {
        method: 'POST',
        body: JSON.stringify({}),
      });
    } finally {
      this.setToken(null);
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
    const res = await this.request<Resume[]>(endpoint);
    return res.data;
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
    const res = await this.request<Resume>('/resumes', {
      method: 'POST',
      body: JSON.stringify(dto),
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
    dto: { analysisType: 'ats_audit' | 'job_match' | 'bullet_improve'; jobDescriptionId?: string },
  ) {
    const res = await this.request<ResumeAnalysis>(`/resumes/${resumeId}/analyses`, {
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
    const res = await this.request<JobDescription[]>(endpoint);
    return res.data;
  }

  async getJobDescription(id: string) {
    const res = await this.request<JobDescription>(`/job-descriptions/${id}`);
    return res.data;
  }

  // --- Job Matching Endpoints ---
  async createJobMatch(dto: { resumeId: string; jobDescriptionId: string }) {
    const res = await this.request<JobMatch>('/job-matches', {
      method: 'POST',
      body: JSON.stringify(dto),
    });
    return res.data;
  }

  async getJobMatch(matchId: string) {
    const res = await this.request<JobMatch>(`/job-matches/${matchId}`);
    return res.data;
  }

  // --- Applications Endpoints ---
  async listApplications(pagination?: { page?: number; limit?: number }) {
    const query = new URLSearchParams();
    if (pagination?.page) query.set('page', String(pagination.page));
    if (pagination?.limit) query.set('limit', String(pagination.limit));
    const endpoint = `/applications${query.toString() ? `?${query.toString()}` : ''}`;
    const res = await this.request<JobApplication[]>(endpoint);
    return res.data;
  }

  async createApplication(dto: {
    companyName: string;
    jobTitle: string;
    resumeId?: string;
    jobDescriptionId?: string;
    status?: 'draft' | 'applied' | 'interviewing' | 'offer' | 'rejected' | 'archived';
    applicationUrl?: string;
    appliedDate?: string;
    notes?: string;
  }) {
    const res = await this.request<JobApplication>('/applications', {
      method: 'POST',
      body: JSON.stringify(dto),
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
      status?: 'draft' | 'applied' | 'interviewing' | 'offer' | 'rejected' | 'archived';
      applicationUrl?: string;
      appliedDate?: string;
      notes?: string;
    },
  ) {
    const res = await this.request<JobApplication>(`/applications/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(dto),
    });
    return res.data;
  }

  async deleteApplication(id: string) {
    const res = await this.request<{ message: string }>(`/applications/${id}`, {
      method: 'DELETE',
    });
    return res.data;
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

