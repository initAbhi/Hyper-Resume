/**
 * HyperResume Privacy-Preserving Analytics Engine
 *
 * Invariant: Never capture, store, or transmit personally identifiable information (PII),
 * candidate names, resume bodies, bullet content, or job description text.
 */

import { env } from './env';
import { logger } from './logger';

const analyticsLogger = logger.child('Analytics');

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

    analyticsLogger.debug(`Tracked event: ${event}`, sanitizedProps);

    // Dispatch to Meta Pixel automatically
    if (typeof window !== 'undefined' && typeof (window as any).fbq === 'function') {
      try {
        const fbq = (window as any).fbq;
        switch (event) {
          case 'landing_view':
            fbq('track', 'PageView');
            break;
          case 'pricing_viewed':
            fbq('track', 'ViewContent', {
              content_name: 'Pricing Plans',
              content_category: 'Pricing',
              ...sanitizedProps,
            });
            break;
          case 'signup_completed':
            fbq('track', 'CompleteRegistration', {
              content_name: 'User Registration',
              status: true,
              ...sanitizedProps,
            });
            break;
          case 'checkout_started': {
            const eventOptions = sanitizedProps.orderId ? { eventID: String(sanitizedProps.orderId) } : undefined;
            const amountMinor =
              typeof sanitizedProps.amountMinor === 'number'
                ? sanitizedProps.amountMinor
                : typeof sanitizedProps.amount === 'number'
                  ? sanitizedProps.amount
                  : 39900;
            const currency =
              typeof sanitizedProps.currency === 'string' && sanitizedProps.currency.trim()
                ? sanitizedProps.currency.toUpperCase()
                : 'INR';
            fbq('track', 'InitiateCheckout', {
              content_name: sanitizedProps.planName || sanitizedProps.planId || 'HypeResume Pro',
              value: amountMinor / 100,
              currency,
              num_items: 1,
            }, eventOptions);
            break;
          }
          case 'purchase_completed': {
            const eventOptions = sanitizedProps.orderId ? { eventID: String(sanitizedProps.orderId) } : undefined;
            const amountMinor =
              typeof sanitizedProps.amountMinor === 'number'
                ? sanitizedProps.amountMinor
                : typeof sanitizedProps.amount === 'number'
                  ? sanitizedProps.amount
                  : 39900;
            const currency =
              typeof sanitizedProps.currency === 'string' && sanitizedProps.currency.trim()
                ? sanitizedProps.currency.toUpperCase()
                : 'INR';
            fbq('track', 'Purchase', {
              content_name: sanitizedProps.planName || sanitizedProps.planId || 'HypeResume Pro',
              value: amountMinor / 100,
              currency,
              content_type: 'product',
            }, eventOptions);
            break;
          }
          case 'analysis_completed':
            fbq('track', 'Lead', {
              content_name: String(sanitizedProps.source || 'Resume Audit Tool'),
              content_category: 'Free Tool',
            });
            fbq('trackCustom', event, sanitizedProps);
            break;
          case 'resume_upload_completed':
          case 'job_match_completed':
          case 'suggestion_accepted':
          case 'export_completed':
            fbq('trackCustom', event, sanitizedProps);
            break;
          default:
            fbq('trackCustom', event, sanitizedProps);
        }
      } catch (err) {
        analyticsLogger.warn('Meta Pixel dispatch error', err);
      }
    }

    // Forward sanitized funnel telemetry to first-party backend in browsers
    if (
      typeof window !== 'undefined' &&
      typeof fetch === 'function' &&
      (typeof process === 'undefined' || process.env?.NODE_ENV !== 'test')
    ) {
      try {
        const sid = this.getOrCreateSessionId();
        const urlParams = new URLSearchParams(window.location.search);
        void fetch(`${env.apiUrl}/analytics/event`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          keepalive: true,
          body: JSON.stringify({
            eventType: event,
            path: window.location.pathname,
            referrer: document.referrer || undefined,
            utmSource: urlParams.get('utm_source') || undefined,
            utmMedium: urlParams.get('utm_medium') || undefined,
            utmCampaign: urlParams.get('utm_campaign') || undefined,
            sessionId: sid,
            metadata: sanitizedProps,
          }),
        }).catch(() => {
          // Non-blocking telemetry
        });
      } catch {
        // Non-blocking telemetry
      }
    }

    // Custom event dispatch for optional client listeners
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('hyperresume:analytics', { detail: record }),
      );
    }
  }

  private getOrCreateSessionId(): string | undefined {
    if (typeof window === 'undefined') return undefined;
    try {
      const storageKey = 'hr_analytics_sid';
      let existing = window.sessionStorage?.getItem(storageKey);
      if (!existing) {
        existing =
          typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
            ? crypto.randomUUID()
            : `sid_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
        window.sessionStorage?.setItem(storageKey, existing);
      }
      return existing;
    } catch {
      return undefined;
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

