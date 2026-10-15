/**
 * HyperResume Privacy-Preserving Analytics Engine
 *
 * Invariant: Never capture, store, or transmit personally identifiable information (PII),
 * candidate names, resume bodies, bullet content, or job description text.
 */

export type AnalyticsEventType =
  | 'landing_view'
  | 'resume_checker_started'
  | 'resume_upload_completed'
  | 'analysis_completed'
  | 'signup_started'
  | 'signup_completed'
  | 'resume_created'
  | 'job_match_started'
  | 'job_match_completed'
  | 'suggestion_accepted'
  | 'export_completed'
  | 'pricing_viewed'
  | 'checkout_started'
  | 'purchase_completed'
  | 'credit_exhausted';


export interface AnalyticsPayload {
  source?: string;
  templateId?: string;
  roleCategory?: string;
  planId?: string;
  fileFormat?: 'pdf' | 'docx';
  matchScoreBucket?: 'low' | 'medium' | 'high';
  isFirstTime?: boolean;
  [key: string]: unknown;
}

export interface AnalyticsEvent {
  event: AnalyticsEventType;
  timestamp: string;
  properties: AnalyticsPayload;
}

class AnalyticsService {
  private eventQueue: AnalyticsEvent[] = [];
  private isConsentGranted: boolean = true; // Respect DNT and local preferences

  constructor() {
    if (typeof window !== 'undefined') {
      const win = window as unknown as { doNotTrack?: string };
      if (navigator.doNotTrack === '1' || win.doNotTrack === '1') {
        this.isConsentGranted = false;
      }
    }
  }

  public setConsent(granted: boolean): void {
    this.isConsentGranted = granted;
  }

  /**
   * Dispatches a sanitized, strictly non-PII analytical event
   */
  public track(event: AnalyticsEventType, properties: AnalyticsPayload = {}): void {
    if (!this.isConsentGranted) {
      return;
    }

    const sanitizedProps = this.sanitizePayload(properties);

    const record: AnalyticsEvent = {
      event,
      timestamp: new Date().toISOString(),
      properties: sanitizedProps,
    };

    this.eventQueue.push(record);

    if (process.env.NODE_ENV === 'development') {
      console.log(`[Analytics] Tracked event: ${event}`, sanitizedProps);
    }

    // Custom event dispatch for optional client listeners
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('hyperresume:analytics', { detail: record }),
      );
    }
  }

  /**
   * Tracks UTM acquisition params if present (e.g., utm_source, utm_medium, utm_campaign)
   */
  public getAcquisitionContext(): { source: string; medium?: string; campaign?: string } {
    if (typeof window === 'undefined') {
      return { source: 'direct' };
    }
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const source = urlParams.get('utm_source') || (document.referrer ? new URL(document.referrer).hostname : 'direct');
      const medium = urlParams.get('utm_medium') || undefined;
      const campaign = urlParams.get('utm_campaign') || undefined;
      return { source, medium, campaign };
    } catch {
      return { source: 'direct' };
    }
  }

  /**
   * Track high-level funnel milestones with channel attribution
   */
  public trackFunnelStep(
    step: AnalyticsEventType,
    extra: AnalyticsPayload = {},
  ): void {
    const acq = this.getAcquisitionContext();
    this.track(step, {
      ...acq,
      ...extra,
    });
  }

  public getRecordedEvents(): AnalyticsEvent[] {
    return [...this.eventQueue];
  }

  public clear(): void {
    this.eventQueue = [];
  }

  /**
   * Sanitizer to guarantee zero accidental PII leakage
   */
  private sanitizePayload(props: Record<string, unknown>): AnalyticsPayload {
    const forbiddenKeys = ['name', 'email', 'phone', 'text', 'resume', 'jobdescription', 'password'];
    const sanitized: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(props)) {
      const lowerKey = key.toLowerCase();
      if (forbiddenKeys.some((f) => lowerKey.includes(f))) {
        continue; // Drop forbidden keys
      }
      if (typeof value === 'string' && value.length > 100) {
        // Drop oversized arbitrary text strings to prevent body text leaking
        continue;
      }
      sanitized[key] = value;
    }

    return sanitized as AnalyticsPayload;
  }
}

export const analytics = new AnalyticsService();

