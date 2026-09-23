import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../src/app';
import { prisma } from '../src/config/prisma';

describe('Concurrency Control - Parallel Seat Hold', () => {
  let tokenUserA = '';
  let tokenUserB = '';
  let targetShowSeatId = '';
  let targetShowId = '';

  const userA = { name: 'User A', email: `concurrency-a-${Date.now()}@example.com`, password: 'password123' };
  const userB = { name: 'User B', email: `concurrency-b-${Date.now()}@example.com`, password: 'password123' };

  beforeAll(async () => {
    // Register User A & User B
    const resA = await request(app).post('/api/auth/register').send(userA);
    tokenUserA = resA.body.data.token;

    const resB = await request(app).post('/api/auth/register').send(userB);
    tokenUserB = resB.body.data.token;

    // Find an active show and an available seat
    const show = await prisma.show.findFirst({
      include: {
        showSeats: {
          where: { status: 'AVAILABLE' },
          take: 1,
        },
      },
    });

    if (show && show.showSeats.length > 0) {
      targetShowId = show.id;
      targetShowSeatId = show.showSeats[0].id;
    }
  });

  afterAll(async () => {
    // Cleanup test users
    await prisma.user.deleteMany({
      where: { email: { in: [userA.email, userB.email] } },
    });
    await prisma.$disconnect();
  });

  it('should prevent two users from holding the exact same seat concurrently', async () => {
    if (!targetShowId || !targetShowSeatId) {
      console.warn('Skipping test: no seed show available');
      return;
    }

    // Execute two simultaneous HTTP hold requests for the same seat
    const reqA = request(app)
      .post(`/api/shows/${targetShowId}/holds`)
      .set('Authorization', `Bearer ${tokenUserA}`)
      .send({ seatIds: [targetShowSeatId] });

    const reqB = request(app)
      .post(`/api/shows/${targetShowId}/holds`)
      .set('Authorization', `Bearer ${tokenUserB}`)
      .send({ seatIds: [targetShowSeatId] });

    const [resA, resB] = await Promise.all([reqA, reqB]);

    const statuses = [resA.status, resB.status].sort();

    // Exactly one must succeed (201) and one must receive conflict (409)
    expect(statuses).toEqual([201, 409]);

    const winningRes = resA.status === 201 ? resA : resB;
    const losingRes = resA.status === 409 ? resA : resB;

    expect(winningRes.body.success).toBe(true);
    expect(winningRes.body.data.holdToken).toBeDefined();

    expect(losingRes.body.success).toBe(false);
    expect(losingRes.body.error.code).toBe('SEAT_UNAVAILABLE');
  });
});
