import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { prisma } from './lib/prisma.js';

// Load environment variables
if (process.env.NODE_ENV !== 'production') {
  dotenv.config({ path: '../.env' }); // Load from root .env in local development
}

import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

const app = express();
const PORT = process.env.PORT || 4000;

// 🛡️ SECURITY PERIMETER
app.use(helmet()); // Global security headers (XSS, CSP, etc.)
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 1000, message: 'Too many requests from this IP. Operational lockout in effect.' });
app.use(limiter as any); // Global rate limiter

app.use(cors({
  origin: process.env.NEXTAUTH_URL || 'http://localhost:3000',
  credentials: true
}));

app.use(express.json({
  verify: (req: any, res, buf) => {
    // Only capture raw body for webhook paths to save memory elsewhere
    if (req.originalUrl?.startsWith('/api/webhooks')) {
      req.rawBody = buf;
    }
  }
}));

// Health Check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Import Routes
import trekRoutes from './routes/treks.js';
import bookingRoutes from './routes/bookings.js';
import expeditionOpsRouter from './routes/expedition-ops.js';
import cronRoutes from './routes/cron.js';
import webhookRoutes from './routes/webhooks.js';
import razorpayRoutes from './routes/razorpay.js';
import expeditionRoutes from './routes/expeditions.js';
import leaderRoutes from './routes/leader.js';
import adminOpsRouter from './routes/admin-ops.js';

app.use('/api/treks', trekRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/cron', cronRoutes);
app.use('/api/webhooks', webhookRoutes);
app.use('/api/razorpay', razorpayRoutes);
app.use('/api/active-bookings', expeditionOpsRouter); // Unified Expedition Operations
app.use('/api/expeditions', expeditionRoutes);
app.use('/api/leader', leaderRoutes);
app.use('/api/admin/ops', adminOpsRouter);

app.listen(PORT, () => {
  console.log(`\n🚀 GTM Adventures Backend running at http://localhost:${PORT}`);
  console.log(`📡 Database: ${process.env.DATABASE_URL?.split('@')[1] || 'Connected'}\n`);
});
