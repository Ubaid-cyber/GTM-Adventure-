import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { prisma } from './lib/prisma.js';

dotenv.config({ path: '../.env' }); // Load from root .env

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({
  origin: process.env.NEXTAUTH_URL || 'http://localhost:3000',
  credentials: true
}));

app.use(express.json());

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Import Routes
import trekRoutes from './routes/treks.js';
import bookingRoutes from './routes/bookings.js';
import expeditionRoutes from './routes/expeditions.js';
import cronRoutes from './routes/cron.js';
import webhookRoutes from './routes/webhooks.js';
import razorpayRoutes from './routes/razorpay.js';
import communityRoutes from './routes/community.js';

app.use('/api/treks', trekRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/expeditions', expeditionRoutes);
app.use('/api/cron', cronRoutes);
app.use('/api/webhooks', webhookRoutes);
app.use('/api/razorpay', razorpayRoutes);
app.use('/api/expeditions', communityRoutes); // Shared with community logic

app.listen(PORT, () => {
  console.log(`\n🚀 GTM Adventures Backend running at http://localhost:${PORT}`);
  console.log(`📡 Database: ${process.env.DATABASE_URL?.split('@')[1] || 'Connected'}\n`);
});
