import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import crypto from 'node:crypto';

export interface MetaUserData {
  email?: string;
  userId?: string;
  clientIp?: string;
  clientUserAgent?: string;
  sourceUrl?: string;
}

export interface MetaPurchaseEventParams {
  orderId: string;
  amountMinor: number;
  currency: string;
  planName: string;
  userData?: MetaUserData;
}

export interface MetaInitiateCheckoutParams {
  orderId?: string;
  planId: string;
  planName: string;
  amountMinor: number;
  currency: string;
  userData?: MetaUserData;
}

@Injectable()
export class MetaConversionsService {
  private readonly logger = new Logger(MetaConversionsService.name);
  private readonly accessToken: string;
  private readonly pixelId: string;
  private readonly testEventCode?: string;
  private readonly defaultSourceUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.accessToken =
      this.configService.get<string>('META_CONVERSIONS_API_TOKEN', '')?.trim() || '';
    this.pixelId =
      this.configService.get<string>('META_PIXEL_ID', '')?.trim() || '';
    this.testEventCode =
      this.configService.get<string>('META_TEST_EVENT_CODE', '')?.trim() || undefined;
    const frontendUrl = (
      this.configService.get<string>('FRONTEND_URL') || 'https://hype-resume.com'
    ).replace(/\/+$/, '');
    this.defaultSourceUrl = `${frontendUrl}/pricing`;

    if (this.accessToken && this.pixelId) {
      this.logger.log(`Meta Conversions API initialized for Dataset/Pixel ${this.pixelId}`);
    } else {
      this.logger.warn(
        'META_CONVERSIONS_API_TOKEN or META_PIXEL_ID not configured. Conversions API disabled.',
      );
    }
  }

  private sha256(value: string): string {
    return crypto.createHash('sha256').update(value.trim().toLowerCase()).digest('hex');
  }

  async sendEvent(
    eventName: string,
    eventData: Record<string, unknown>,
    userData?: MetaUserData,
    eventId?: string,
  ): Promise<boolean> {
    if (!this.accessToken || !this.pixelId) {
      return false;
    }

    try {
      const formattedUserData: Record<string, unknown> = {};
      if (userData?.email) {
        formattedUserData.em = [this.sha256(userData.email)];
      }
      if (userData?.userId) {
        formattedUserData.external_id = [this.sha256(userData.userId)];
      }
      if (userData?.clientIp) {
        formattedUserData.client_ip_address = userData.clientIp;
      }
      if (userData?.clientUserAgent) {
        formattedUserData.client_user_agent = userData.clientUserAgent;
      }

      const eventPayload = {
        event_name: eventName,
        event_time: Math.floor(Date.now() / 1000),
        event_id: eventId,
        action_source: 'website',
        event_source_url: userData?.sourceUrl || this.defaultSourceUrl,
        user_data: formattedUserData,
        custom_data: eventData,
      };

      const requestBody: Record<string, unknown> = {
        data: [eventPayload],
      };

      if (this.testEventCode) {
        requestBody.test_event_code = this.testEventCode;
      }

      const url = `https://graph.facebook.com/v21.0/${this.pixelId}/events?access_token=${encodeURIComponent(this.accessToken)}`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const result = (await response.json()) as any;

      if (!response.ok) {
        this.logger.warn(
          `Meta CAPI event ${eventName} error: ${JSON.stringify(result?.error || result)}`,
        );
        return false;
      }

      this.logger.log(
        `Meta CAPI event ${eventName} sent (events_received: ${result?.events_received || 1}, event_id: ${eventId || 'none'})`,
      );
      return true;
    } catch (err: unknown) {
      this.logger.error(
        `Failed to send Meta CAPI event ${eventName}: ${err instanceof Error ? err.message : String(err)}`,
      );
      return false;
    }
  }

  async sendPurchase(params: MetaPurchaseEventParams): Promise<void> {
    const value = Number((params.amountMinor / 100).toFixed(2));
    await this.sendEvent(
      'Purchase',
      {
        value,
        currency: params.currency || 'INR',
        content_name: params.planName,
        content_type: 'product',
        order_id: params.orderId,
      },
      params.userData,
      params.orderId,
    );
  }

  async sendInitiateCheckout(params: MetaInitiateCheckoutParams): Promise<void> {
    const value = Number((params.amountMinor / 100).toFixed(2));
    await this.sendEvent(
      'InitiateCheckout',
      {
        value,
        currency: params.currency || 'INR',
        content_name: params.planName,
        content_ids: [params.planId],
        num_items: 1,
      },
      params.userData,
      params.orderId ? `ic_${params.orderId}` : undefined,
    );
  }
}
