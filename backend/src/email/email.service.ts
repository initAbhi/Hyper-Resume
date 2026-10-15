import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface EmailPayload {
  to: string;
  subject: string;
  text: string;
  html: string;
}

export interface EmailRecord {
  to: string;
  subject: string;
  sentAt: Date;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly sentEmails: EmailRecord[] = [];

  constructor(private readonly configService: ConfigService) {}

  async sendEmail(payload: EmailPayload): Promise<{ success: boolean; messageId: string }> {
    const messageId = `msg-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

    // In dev or test environments, record in-memory and log cleanly
    this.logger.log(`[Email] To: ${payload.to} | Subject: "${payload.subject}" | ID: ${messageId}`);

    this.sentEmails.push({
      to: payload.to,
      subject: payload.subject,
      sentAt: new Date(),
    });

    return {
      success: true,
      messageId,
    };
  }

  async sendVerificationEmail(email: string, token: string, fullName: string) {
    const frontendUrl = this.configService.get<string>('FRONTEND_URL', 'http://localhost:3000');
    const verifyUrl = `${frontendUrl}/verify-email?token=${token}`;

    return this.sendEmail({
      to: email,
      subject: 'Verify your HyperResume account',
      text: `Hello ${fullName},\n\nPlease verify your email address by visiting: ${verifyUrl}\n\nThank you,\nHyperResume Team`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2>Welcome to HyperResume, ${fullName}!</h2>
          <p>Please verify your email address to secure your career workspace.</p>
          <p><a href="${verifyUrl}" style="display: inline-block; padding: 10px 20px; background-color: #2563eb; color: #fff; text-decoration: none; border-radius: 6px;">Verify Email Address</a></p>
          <p style="font-size: 12px; color: #666;">Or copy and paste this link: ${verifyUrl}</p>
        </div>
      `,
    });
  }

  async sendPurchaseConfirmation(
    email: string,
    orderId: string,
    planName: string,
    amountFormatted: string,
    creditsAwarded: number,
  ) {
    return this.sendEmail({
      to: email,
      subject: `Receipt for your HyperResume purchase: ${planName}`,
      text: `Thank you for your purchase!\n\nOrder ID: ${orderId}\nPlan: ${planName}\nAmount: ${amountFormatted}\nCredits Awarded: ${creditsAwarded}\n\nHappy job hunting!\nHyperResume Team`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
          <h2 style="color: #0f172a;">Payment Confirmation</h2>
          <p>Thank you for recharging your HyperResume credits!</p>
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <tr><td style="padding: 8px 0; color: #64748b;">Order ID</td><td style="font-family: monospace; font-weight: bold;">${orderId}</td></tr>
            <tr><td style="padding: 8px 0; color: #64748b;">Plan</td><td style="font-weight: bold;">${planName}</td></tr>
            <tr><td style="padding: 8px 0; color: #64748b;">Amount Paid</td><td style="font-weight: bold;">${amountFormatted}</td></tr>
            <tr><td style="padding: 8px 0; color: #64748b;">Credits Added</td><td style="font-weight: bold; color: #2563eb;">+${creditsAwarded} Credits</td></tr>
          </table>
          <p style="font-size: 13px; color: #64748b;">You can use these credits at any time to run grounded job matches and STAR/XYZ bullet rewrites.</p>
        </div>
      `,
    });
  }

  getSentEmails(): EmailRecord[] {
    return [...this.sentEmails];
  }

  clearSentEmails(): void {
    this.sentEmails.length = 0;
  }
}
