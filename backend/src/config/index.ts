import dotenv from 'dotenv';
import path from 'path';

// Load .env from backend directory or project root
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET || 'fallback-super-secret-key-2026',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  seatHoldTtlMinutes: parseInt(process.env.SEAT_HOLD_TTL_MINUTES || '10', 10),
  waitlistOfferTtlMinutes: parseInt(process.env.WAITLIST_OFFER_TTL_MINUTES || '10', 10),
  resendApiKey: process.env.RESEND_API_KEY || '',
  emailFrom: process.env.EMAIL_FROM || 'onboarding@resend.dev',
};
