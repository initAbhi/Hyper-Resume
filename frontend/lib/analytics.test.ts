import { describe, expect, it, beforeEach } from 'bun:test';
import { analytics, type AnalyticsPayload } from './analytics';

describe('Analytics Engine', () => {
  beforeEach(() => {
    analytics.clear();
    analytics.setConsent(true);
  });

  it('should record an event when consent is granted', () => {
    analytics.track('landing_view', { source: 'organic_search' });

    const events = analytics.getRecordedEvents();
    expect(events).toHaveLength(1);
    expect(events[0].event).toBe('landing_view');
    expect(events[0].properties.source).toBe('organic_search');
    expect(events[0].timestamp).toBeDefined();
  });

  it('should sanitize and strip forbidden PII fields from tracking payloads', () => {
    analytics.track('resume_upload_completed', {
      source: 'web',
      fileFormat: 'pdf',
      name: 'John Doe',
      email: 'john@example.com',
      phoneNumber: '123-456-7890',
      resumeText: 'Full resume contents containing personal address and details',
      jobDescription: 'Software engineer at Acme corp...',
      passwordHash: 'secret123',
    } as AnalyticsPayload);

    const events = analytics.getRecordedEvents();
    expect(events).toHaveLength(1);
    const recordedProps = events[0].properties as Record<string, unknown>;

    // Allowed props
    expect(recordedProps.source).toBe('web');
    expect(recordedProps.fileFormat).toBe('pdf');

    // Forbidden props must be scrubbed
    expect(recordedProps.name).toBeUndefined();
    expect(recordedProps.email).toBeUndefined();
    expect(recordedProps.phoneNumber).toBeUndefined();
    expect(recordedProps.resumeText).toBeUndefined();
    expect(recordedProps.jobDescription).toBeUndefined();
    expect(recordedProps.passwordHash).toBeUndefined();
  });

  it('should not record any event when consent is revoked (DNT active)', () => {
    analytics.setConsent(false);
    analytics.track('pricing_viewed', { planId: 'pro' });

    expect(analytics.getRecordedEvents()).toHaveLength(0);
  });

  it('should drop oversized text strings to prevent accidental content leakage', () => {
    const longString = 'A'.repeat(150);
    analytics.track('export_completed', {
      templateId: 'clean_modern',
      extraNotes: longString,
    } as AnalyticsPayload);

    const events = analytics.getRecordedEvents();
    expect(events).toHaveLength(1);
    const props = events[0].properties as Record<string, unknown>;
    expect(props.templateId).toBe('clean_modern');
    expect(props.extraNotes).toBeUndefined();
  });

  it('should track conversion funnel events: checkout_started, purchase_completed, and credit_exhausted', () => {
    analytics.track('checkout_started', { planId: 'job_hunt_pack', amountMinor: 39900 });
    analytics.track('purchase_completed', { planId: 'job_hunt_pack', credits: 30 });
    analytics.track('credit_exhausted', { lastAction: 'bullet_improve' });

    const events = analytics.getRecordedEvents();
    expect(events).toHaveLength(3);
    expect(events[0].event).toBe('checkout_started');
    expect(events[1].event).toBe('purchase_completed');
    expect(events[2].event).toBe('credit_exhausted');
  });

  it('should track funnel step with default acquisition context', () => {
    analytics.trackFunnelStep('pricing_viewed', { source: 'landing_cta' });

    const events = analytics.getRecordedEvents();
    expect(events).toHaveLength(1);
    expect(events[0].event).toBe('pricing_viewed');
    expect(events[0].properties.source).toBe('landing_cta');
  });
});

