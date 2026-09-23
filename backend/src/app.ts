import express from 'express';
import http from 'http';
import cors from 'cors';
import { config } from './config';
import { errorHandler } from './middleware/error.middleware';
import { initSocketServer } from './sockets/socket.server';
import { releaseExpiredHolds } from './jobs/releaseExpiredHolds';
import { processExpiredWaitlistOffers } from './jobs/processExpiredWaitlistOffers';
import { ensureDatabaseSeeded } from './config/autoSeed';

// Import Routes
import authRoutes from './routes/auth.routes';
import venueRoutes from './routes/venue.routes';
import eventRoutes from './routes/event.routes';
import showRoutes from './routes/show.routes';
import paymentRoutes from './routes/payment.routes';
import bookingRoutes from './routes/booking.routes';
import waitlistRoutes from './routes/waitlist.routes';

const app = express();
const server = http.createServer(app);

// Initialize Socket.IO
initSocketServer(server);

// Middleware
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, postman)
    if (!origin) return callback(null, true);
    
    // Check if origin matches frontendUrl, vercel app, or localhost
    if (
      origin === config.frontendUrl ||
      origin.includes('vercel.app') ||
      origin.includes('localhost') ||
      origin.includes('127.0.0.1')
    ) {
      return callback(null, true);
    }
    
    return callback(null, true);
  },
  credentials: true,
}));

app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/venues', venueRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/shows', showRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/waitlist', waitlistRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error Handler Middleware
app.use(errorHandler);

const isTestEnv = process.env.NODE_ENV === 'test' || Boolean(process.env.VITEST);

// Start Background Database Jobs (only in non-test env)
if (!isTestEnv) {
  const HOLD_WORKER_INTERVAL_MS = 10000; // 10 seconds
  const WAITLIST_WORKER_INTERVAL_MS = 15000; // 15 seconds

  // Auto seed database if empty
  ensureDatabaseSeeded();

  setInterval(async () => {
    await releaseExpiredHolds();
  }, HOLD_WORKER_INTERVAL_MS);

  setInterval(async () => {
    await processExpiredWaitlistOffers();
  }, WAITLIST_WORKER_INTERVAL_MS);

  server.listen(config.port, () => {
    console.log(`🚀 Ticket Booking API Server running on port ${config.port}`);
    console.log(`📡 Socket.IO server listening for real-time seat status updates`);
    console.log(`⏰ Background workers active: Hold TTL (10s) & Waitlist TTL (15s)`);
  });
}

export { app, server };