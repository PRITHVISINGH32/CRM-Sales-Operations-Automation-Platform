import { z } from 'zod';

export const createHoldSchema = z.object({
  seatIds: z.array(z.string().uuid()).min(1, 'Select at least one seat to hold'),
});

export const simulatePaymentSchema = z.object({
  holdId: z.string().uuid().optional(),
  holdToken: z.string().uuid().optional(),
  result: z.enum(['SUCCESS', 'FAILED']),
}).refine((data) => data.holdId || data.holdToken, {
  message: 'Either holdId or holdToken must be provided',
});

export const joinWaitlistSchema = z.object({
  categoryId: z.string().uuid('Category ID is required'),
});

export const claimWaitlistOfferSchema = z.object({
  token: z.string().min(1, 'Token is required'),
});
