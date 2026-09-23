import { Resend } from 'resend';
import { config } from '../config';

export interface EmailParams {
  to: string;
  subject: string;
  html: string;
}

export interface IEmailService {
  sendEmail(params: EmailParams): Promise<boolean>;
}

class ResendEmailService implements IEmailService {
  private resend: Resend | null = null;

  constructor() {
    if (config.resendApiKey && config.resendApiKey !== 're_123456789_example_key') {
      this.resend = new Resend(config.resendApiKey);
    }
  }

  async sendEmail({ to, subject, html }: EmailParams): Promise<boolean> {
    try {
      if (!this.resend) {
        console.log(`[EMAIL SIMULATION / LOG FALLBACK] To: ${to} | Subject: ${subject}`);
        return true;
      }

      const { data, error } = await this.resend.emails.send({
        from: config.emailFrom,
        to: [to],
        subject,
        html,
      });

      if (error) {
        console.error('Resend email error:', error);
        return false;
      }

      console.log('Email sent successfully via Resend:', data?.id);
      return true;
    } catch (error) {
      console.error('Failed to send email:', error);
      return false;
    }
  }
}

export const emailService: IEmailService = new ResendEmailService();

export const sendBookingConfirmationEmail = async (params: {
  to: string;
  customerName: string;
  bookingReference: string;
  eventTitle: string;
  venueName: string;
  showTime: string;
  seats: string[];
  totalAmount: number;
  qrCodeUrl?: string;
}): Promise<boolean> => {
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; padding: 24px; background: #ffffff;">
      <h2 style="color: #0f172a; margin-top: 0;">🎉 Booking Confirmed!</h2>
      <p>Hi <strong>${params.customerName}</strong>,</p>
      <p>Thank you for your purchase. Here are your ticket details:</p>
      <div style="background-color: #f8fafc; padding: 16px; border-radius: 6px; margin: 16px 0;">
        <p style="margin: 4px 0;"><strong>Event:</strong> ${params.eventTitle}</p>
        <p style="margin: 4px 0;"><strong>Venue:</strong> ${params.venueName}</p>
        <p style="margin: 4px 0;"><strong>Show Time:</strong> ${params.showTime}</p>
        <p style="margin: 4px 0;"><strong>Seats:</strong> ${params.seats.join(', ')}</p>
        <p style="margin: 4px 0;"><strong>Total Paid:</strong> ₹${params.totalAmount.toFixed(2)}</p>
        <p style="margin: 4px 0; color: #6366f1;"><strong>Booking Reference:</strong> ${params.bookingReference}</p>
      </div>
      ${
        params.qrCodeUrl
          ? `<div style="text-align: center; margin: 24px 0;">
              <img src="${params.qrCodeUrl}" alt="Ticket QR Code" style="width: 180px; height: 180px; border: 1px solid #cbd5e1; border-radius: 8px;" />
              <p style="font-size: 12px; color: #64748b;">Show this QR code at the venue entry.</p>
            </div>`
          : ''
      }
      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
      <p style="font-size: 12px; color: #94a3b8; text-align: center;">Ticket Booking Platform Evaluation System</p>
    </div>
  `;

  return await emailService.sendEmail({
    to: params.to,
    subject: `Ticket Booking Confirmation - ${params.bookingReference}`,
    html,
  });
};

export const sendWaitlistOfferEmail = async (params: {
  to: string;
  customerName: string;
  eventTitle: string;
  venueName: string;
  categoryName: string;
  claimUrl: string;
  expiresInMinutes: number;
}): Promise<boolean> => {
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; padding: 24px; background: #ffffff;">
      <h2 style="color: #4f46e5; margin-top: 0;">🎟️ A Seat Has Become Available!</h2>
      <p>Hi <strong>${params.customerName}</strong>,</p>
      <p>Great news! A seat in the <strong>${params.categoryName}</strong> category has become available for <strong>${params.eventTitle}</strong> at <strong>${params.venueName}</strong>.</p>
      <div style="background-color: #eef2ff; padding: 16px; border-radius: 6px; margin: 16px 0; text-align: center;">
        <p style="margin-bottom: 16px; color: #3730a3; font-weight: 600;">You have ${params.expiresInMinutes} minutes to claim this seat!</p>
        <a href="${params.claimUrl}" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Claim Seat Now</a>
      </div>
      <p style="font-size: 13px; color: #64748b;">If you do not claim this offer within ${params.expiresInMinutes} minutes, it will automatically expire and pass to the next customer on the waitlist.</p>
    </div>
  `;

  return await emailService.sendEmail({
    to: params.to,
    subject: `Waitlist Seat Available - ${params.eventTitle}`,
    html,
  });
};
