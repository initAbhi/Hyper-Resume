import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import crypto from 'node:crypto';

export interface MetaUserData {
  email?: string;
  clientIp?: string;
  clientUserAgent?: string;
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

  constructor(private readonly configService: ConfigService) {
    this.accessToken =
      this.configService.get<string>('META_CONVERSIONS_API_TOKEN', '')?.trim();
    this.pixelId =
      this.configService.get<string>('META_PIXEL_ID', '1117348281146781')?.trim();
    this.testEventCode =
      this.configService.get<string>('META_TEST_EVENT_CODE', '')?.trim() || undefined;

    if (this.accessToken) {
      this.logger.log(`Meta Conversions API initialized for Dataset/Pixel ${this.pixelId}`);
    } else {
      this.logger.warn('META_CONVERSIONS_API_TOKEN not configured. Conversions API disabled.');
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
        event_source_url: 'https://hype-resume.com/pricing',
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
        this.logger.warn(`Meta CAPI event ${eventName} error: ${JSON.stringify(result?.error || result)}`);
        return false;
      }

      this.logger.log(
        `Meta CAPI event ${eventName} sent successfully (events_received: ${result?.events_received || 1}, event_id: ${eventId || 'none'})`,
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
    const value = params.amountMinor / 100;
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
    const value = params.amountMinor / 100;
    await this.sendEvent(
      'InitiateCheckout',
      {
        value,
        currency: params.currency || 'INR',
        content_name: params.planName,
        num_items: 1,
      },
      params.userData,
      params.orderId,
    );
  }
}
