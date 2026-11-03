import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import nodemailer, { type Transporter } from 'nodemailer';

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
  private transporter: Transporter | null = null;

  constructor(private readonly configService: ConfigService) {
    this.initializeTransporter();
  }

  private initializeTransporter(): void {
    const host = this.configService.get<string>('SMTP_HOST');
    const port = this.configService.get<number>('SMTP_PORT', 465);
    const user = this.configService.get<string>('SMTP_USER');
    const pass = this.configService.get<string>('SMTP_PASS');
    const secure = this.configService.get<boolean>('SMTP_SECURE', port === 465);

    if (host && user && pass) {
      this.transporter = nodemailer.createTransport({
        host,
        port: Number(port),
        secure: Boolean(secure),
        auth: {
          user,
          pass,
        },
      });
      this.logger.log(`[Email] SMTP Transporter initialized successfully for ${host}:${port} (${user})`);
    } else {
      this.logger.warn(
        `[Email] Real SMTP credentials not fully configured (SMTP_HOST: ${host || 'none'}, SMTP_USER: ${user || 'none'}). Using in-memory & console fallback.`,
      );
    }
  }

  async sendEmail(payload: EmailPayload): Promise<{ success: boolean; messageId: string }> {
    const fromAddress =
      this.configService.get<string>('SMTP_FROM') ||
      this.configService.get<string>('SMTP_USER') ||
      '"HypeResume" <support@hype-resume.com>';

    const messageId = `msg-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

    // 1. Check for Resend API Key (Highest speed & reliability via HTTP/2)
    const resendApiKey =
      this.configService.get<string>('RESEND_API_KEY') ||
      (this.configService.get<string>('SMTP_PASS')?.startsWith('re_')
        ? this.configService.get<string>('SMTP_PASS')
        : undefined);

    if (resendApiKey) {
      try {
        let res = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: fromAddress,
            to: [payload.to],
            subject: payload.subject,
            html: payload.html,
            text: payload.text,
          }),
        });

        // If domain is still verifying or failed, try onboarding fallback during setup
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          this.logger.warn(
            `Resend custom domain delivery: ${JSON.stringify(errData)}. Falling back to verified sender...`,
          );
          res = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${resendApiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              from: 'HypeResume <onboarding@resend.dev>',
              to: [payload.to],
              subject: payload.subject,
              html: payload.html,
              text: payload.text,
            }),
          });
        }

        if (res.ok) {
          const data = (await res.json()) as { id: string };
          this.logger.log(
            `[Email via Resend] Dispatched to: ${payload.to} | Subject: "${payload.subject}" | Resend ID: ${data.id}`,
          );
          this.sentEmails.push({
            to: payload.to,
            subject: payload.subject,
            sentAt: new Date(),
          });
          return { success: true, messageId: data.id };
        }
      } catch (resendErr) {
        this.logger.error(
          `Resend HTTP error: ${resendErr instanceof Error ? resendErr.message : String(resendErr)}`,
        );
      }
    }

    // 2. Check for Nodemailer SMTP Transporter
    if (this.transporter) {
      try {
        const info = await this.transporter.sendMail({
          from: fromAddress,
          to: payload.to,
          subject: payload.subject,
          text: payload.text,
          html: payload.html,
        });

        this.logger.log(`[Email via SMTP] Sent to: ${payload.to} | Subject: "${payload.subject}" | MessageID: ${info.messageId}`);
        this.sentEmails.push({
          to: payload.to,
          subject: payload.subject,
          sentAt: new Date(),
        });

        return {
          success: true,
          messageId: info.messageId,
        };
      } catch (err: unknown) {
        this.logger.error(
          `[Email] Failed to send email via SMTP to ${payload.to}: ${err instanceof Error ? err.message : String(err)}`,
        );
      }
    }

    // Fallback: in-memory and console log
    this.logger.log(`[Email Mock] To: ${payload.to} | Subject: "${payload.subject}" | ID: ${messageId}`);
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

  async sendPasswordResetEmail(email: string, token: string, fullName = 'there') {
    const frontendUrl = this.configService.get<string>('FRONTEND_URL', 'https://hype-resume.com');
    const resetUrl = `${frontendUrl}/reset-password?token=${encodeURIComponent(token)}`;

    return this.sendEmail({
      to: email,
      subject: 'Reset your HypeResume password',
      text: `Hello ${fullName},\n\nWe received a request to reset your HypeResume password.\n\nPlease reset your password by visiting this link (valid for 1 hour):\n${resetUrl}\n\nIf you did not make this request, you can safely ignore this email. Your password will remain unchanged.\n\nBest regards,\nHypeResume Support Team`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 580px; margin: 0 auto; padding: 32px 24px; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px;">
          <div style="margin-bottom: 24px;">
            <span style="font-size: 20px; font-weight: 800; color: #0f172a; letter-spacing: -0.5px;">Hype<span style="color: #285fea;">Resume</span></span>
          </div>
          <h2 style="font-size: 20px; font-weight: 700; color: #0f172a; margin: 0 0 16px 0;">Reset Your Password</h2>
          <p style="font-size: 15px; line-height: 24px; color: #334155; margin: 0 0 20px 0;">
            Hello ${fullName},<br/>
            We received a request to reset the password associated with your HypeResume account.
          </p>
          <div style="margin: 28px 0;">
            <a href="${resetUrl}" style="display: inline-block; background-color: #285fea; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 600; padding: 12px 28px; border-radius: 8px; box-shadow: 0 2px 4px rgba(40, 95, 234, 0.2);">
              Reset Password
            </a>
          </div>
          <p style="font-size: 13px; line-height: 20px; color: #64748b; margin: 0 0 20px 0;">
            This password reset link is valid for <strong>1 hour</strong>. If the button above doesn't work, copy and paste this URL into your browser:
          </p>
          <p style="font-size: 12px; line-height: 18px; word-break: break-all; color: #285fea; margin: 0 0 24px 0; background: #f8fafc; padding: 10px 14px; border-radius: 6px; border: 1px solid #e2e8f0;">
            ${resetUrl}
          </p>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
          <p style="font-size: 12px; line-height: 18px; color: #94a3b8; margin: 0;">
            If you did not request a password reset, you can safely ignore this email. Your account remains completely secure.<br/>
            Need help? Contact us anytime at <a href="mailto:support@hype-resume.com" style="color: #64748b;">support@hype-resume.com</a>.
          </p>
        </div>
      `,
    });
  }

  async sendVerificationEmail(email: string, token: string, fullName: string) {
    const frontendUrl = this.configService.get<string>('FRONTEND_URL', 'https://hype-resume.com');
    const verifyUrl = `${frontendUrl}/verify-email?token=${encodeURIComponent(token)}`;

    return this.sendEmail({
      to: email,
      subject: 'Verify your HypeResume account',
      text: `Hello ${fullName},\n\nPlease verify your email address by visiting: ${verifyUrl}\n\nThank you,\nHypeResume Team`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 580px; margin: 0 auto; padding: 32px 24px; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px;">
          <div style="margin-bottom: 24px;">
            <span style="font-size: 20px; font-weight: 800; color: #0f172a; letter-spacing: -0.5px;">Hype<span style="color: #285fea;">Resume</span></span>
          </div>
          <h2 style="font-size: 20px; font-weight: 700; color: #0f172a; margin: 0 0 16px 0;">Welcome to HypeResume, ${fullName}!</h2>
          <p style="font-size: 15px; line-height: 24px; color: #334155; margin: 0 0 20px 0;">
            Please verify your email address to unlock full access to your personalized resume workspace and ATS optimization tools.
          </p>
          <div style="margin: 28px 0;">
            <a href="${verifyUrl}" style="display: inline-block; background-color: #285fea; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 600; padding: 12px 28px; border-radius: 8px;">
              Verify Email Address
            </a>
          </div>
          <p style="font-size: 12px; color: #94a3b8; margin: 0;">
            Or copy and paste this link: ${verifyUrl}
          </p>
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
      subject: `Receipt for your HypeResume purchase: ${planName}`,
      text: `Thank you for your purchase!\n\nOrder ID: ${orderId}\nPlan: ${planName}\nAmount: ${amountFormatted}\nCredits Awarded: ${creditsAwarded}\n\nHappy job hunting!\nHypeResume Team`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 580px; margin: 0 auto; padding: 32px 24px; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px;">
          <div style="margin-bottom: 24px;">
            <span style="font-size: 20px; font-weight: 800; color: #0f172a; letter-spacing: -0.5px;">Hype<span style="color: #285fea;">Resume</span></span>
          </div>
          <h2 style="font-size: 20px; font-weight: 700; color: #0f172a; margin: 0 0 16px 0;">Payment Receipt & Credits Added</h2>
          <p style="font-size: 15px; line-height: 24px; color: #334155; margin: 0 0 20px 0;">
            Thank you for your purchase! Your account has been credited and is ready for use.
          </p>
          <table style="width: 100%; border-collapse: collapse; margin: 24px 0; background-color: #f8fafc; border-radius: 8px; overflow: hidden; border: 1px solid #e2e8f0;">
            <tr><td style="padding: 12px 16px; color: #64748b; font-size: 14px; border-bottom: 1px solid #e2e8f0;">Order Reference</td><td style="padding: 12px 16px; font-family: monospace; font-size: 13px; font-weight: 600; text-align: right; border-bottom: 1px solid #e2e8f0;">${orderId}</td></tr>
            <tr><td style="padding: 12px 16px; color: #64748b; font-size: 14px; border-bottom: 1px solid #e2e8f0;">Package</td><td style="padding: 12px 16px; font-size: 14px; font-weight: 600; text-align: right; border-bottom: 1px solid #e2e8f0;">${planName}</td></tr>
            <tr><td style="padding: 12px 16px; color: #64748b; font-size: 14px; border-bottom: 1px solid #e2e8f0;">Amount Paid</td><td style="padding: 12px 16px; font-size: 14px; font-weight: 700; text-align: right; border-bottom: 1px solid #e2e8f0; color: #0f172a;">${amountFormatted}</td></tr>
            <tr><td style="padding: 12px 16px; color: #64748b; font-size: 14px;">Credits Added</td><td style="padding: 12px 16px; font-size: 14px; font-weight: 700; text-align: right; color: #285fea;">+${creditsAwarded} Credits</td></tr>
          </table>
          <p style="font-size: 13px; color: #64748b; margin: 0;">
            You can use your credits anytime to match your resume against any job description, run ATS diagnostics, and optimize bullets with evidence-based formulas.
          </p>
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
