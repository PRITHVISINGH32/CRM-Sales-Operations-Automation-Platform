import { z } from 'zod';

export const createEventSchema = z.object({
  title: z.string().min(2, 'Title is required'),
  description: z.string().min(5, 'Description is required'),
  type: z.enum(['MOVIE', 'CONCERT']),
  posterUrl: z.string().url().optional().or(z.literal('')),
});

export const createShowSchema = z.object({
  eventId: z.string().uuid(),
  venueId: z.string().uuid(),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  categoryPrices: z.array(
    z.object({
      categoryId: z.string().uuid(),
      price: z.number().positive(),
    })
  ).min(1, 'At least one category price is required'),
});

export const createVenueSchema = z.object({
  name: z.string().min(2, 'Venue name is required'),
  location: z.string().min(2, 'Location is required'),
  rows: z.array(
    z.object({
      rowLabel: z.string().min(1),
      categoryName: z.string().min(1),
      seatCount: z.number().int().positive(),
    })
  ).min(1, 'At least one row definition is required'),
});
