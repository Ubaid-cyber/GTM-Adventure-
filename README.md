# 🏔️ GTM ADVENTURES: HQ COMMAND CENTER
**Elite Expedition Management & High-Altitude Logistics Platform**

> [!IMPORTANT]
> **V1 RELEASE STATUS: MISSION READY**
> This platform is officially cleared for administrative operations and expedition deployment.

GTM Adventures is a production-grade travel and expedition engine designed for extreme reliability in mission-critical environments. This platform manages high-value bookings, medical clearances, and real-time situational reports (SITREPs) for global trekking operations.

---

## 🛡️ Mission-Critical Architecture (V1 Standard)

The platform is engineered to handle "Worst-Case" production scenarios where data integrity and fiscal accuracy are non-negotiable.

### 1. High-Concurrency & Inventory Safety
- **Logic**: Pessimistic Row-Level Locking (`FOR UPDATE`) within a Prisma Transaction.
- **Result**: Prevents "Phantom Overbooking" by locking trek inventory the millisecond a booking begins.

### 2. Fiscal Integrity & Audit Precision
- **Logic**: Fiscal Aggregation Engine isolated to `status: CONFIRMED` transactions. 
- **Result**: Real-time revenue charts and 18% GST estimates are mathematically precise and audit-ready.

### 3. Platform Governance & Activity History
- **Logic**: Deep-Trace Audit Logging capturing Action, IP, User ID, and Raw JSON Payloads.
- **Result**: HQ Command Center enables forensic deep-dives into all administrative events through the Activity Details tool.

### 4. Smart Idempotency (Layer 7 Safety)
- **Logic**: Hashed Intent Fingerprinting to detect duplicate booking requests.
- **Result**: Safely handles high-latency network double-clicks by identifying identical intent within a 5-minute window.

### 5. Payment Lifecycle Resilience
- **Logic**: Two-Layer Proof of Payment (Frontend Verify + Server-to-Server Webhooks).
- **Result**: Bookings are automatically confirmed via Razorpay even if the user disconnects mid-transaction.

---

## 🗺️ Expedition Roadmap

### 📦 Phase 1: Core Command (V1 COMPLETE)
- [x] **HQ Command Center**: High-density admin dashboard with fiscal oversight.
- [x] **Activity History**: Forensic audit trail with IP governance (Blocking/Banning).
- [x] **Lead Management**: Multi-action contact hub (WhatsApp/Email/Forwarding).
- [x] **Health & Safety**: Trekker document upload and medical profile management.
- [x] **Payment Engine**: Live Razorpay integration with webhook failover.

### 📦 Phase 2: Tactical Intelligence (PLANNED / POST-V1)
- [ ] **Socket.io Integration**: Real-time, bi-directional mission feeds (Pop-up alerts).
- [ ] **Cloudinary Integration**: Automated high-altitude media compression.
- [ ] **Smart Idempotency Deployment**: Finalizing Redis-backed request caching.

---

## 🔐 Development Credentials
For local development and testing, use these accounts (Password for all is `admin`):

| Role | Email | Password |
| :--- | :--- | :--- |
| **Super Admin** | `admin@gtm-adventures.com` | `admin` |
| **Trek Leader** | `leader@gtm-adventures.com` | `admin` |
| **Regular User** | `user@gtm-adventures.com` | `admin` |

---

## 📞 Governance & Support
Official communication channels for altitude operations and technical governance.

- **Admin Support**: info@gtmadventures.com
- **Operational Hotline**: +91 9682614480
- **Technical Lead**: Ubaid Bhat

---

## 🛠️ Technology Stack
- **Engine**: Next.js 14 (App Router)
- **Database**: PostgreSQL with Prisma ORM
- **Styling**: Vanilla CSS (Elite Midnight/Glassmorphism design system)
- **Payment**: Razorpay Integration (Live)

## 🏗️ Getting Started
1. **Environment Setup**: Copy `.env.example` to `.env`.
2. **Database Initialization**: `npx prisma db push && npx prisma db seed`.
3. **Launch Mission Control**: `npm run dev`.

---
## 🚀 Production Deployment & Environment Setup

Follow this protocol to migrate GTM Adventures from Development to a Production-Ready environment.

### 1. Database Infrastructure
*   **PostgreSQL**: Secure a hosted instance (e.g., [Supabase](https://supabase.com/), [Neon](https://neon.tech/), [AWS RDS](https://aws.amazon.com/rds/)).
*   **Redis (Critical)**: Required for the **Aegis Shield** (Security Layer). Use [Upstash](https://upstash.com/) or [Redis Cloud](https://redis.io/cloud/).

### 2. Required Environment Variables (.env)
Ensure these are set in your production platform (Vercel, Netlify, or VPS):

```bash
# Infrastructure
DATABASE_URL="postgresql://user:password@host:5432/dbname"
REDIS_URL="rediss://default:password@host:port"

# Authentication
NEXTAUTH_URL="https://gtmadventures.com"
NEXTAUTH_SECRET="your-32-char-secret-key"

# SEO & Public Identification
NEXT_PUBLIC_SITE_URL="https://gtmadventures.com"

# Payments & Webhooks
RAZORPAY_KEY_ID="rzp_live_..."
RAZORPAY_KEY_SECRET="..."
RAZORPAY_WEBHOOK_SECRET="..." # Configured in Razorpay Dash
# Webhook URL to give Razorpay: https://yourdomain.com/api/webhooks/razorpay

# Artificial Intelligence (Semantic Search)
GEMINI_API_KEY="your-google-ai-key"

# OTP & Communications (Twilio Verify)
TWILIO_ACCOUNT_SID="AC..."
TWILIO_AUTH_TOKEN="..."
TWILIO_VERIFY_SERVICE_SID="VA..."
NEXT_PUBLIC_DEFAULT_COUNTRY_CODE="+91"
```

### 3. Deployment Command Sequence
1.  **Build**: `npm run build` (Pre-compiles for performance).
2.  **Migrate**: `npx prisma db push` (Syncs production database schema).
3.  **Governance**: `npx prisma studio` (Use locally with production URL to manage live data).

### 4. SEO Verification
Our elite SEO infrastructure uses `NEXT_PUBLIC_SITE_URL` to generate:
*   `robots.txt`
*   `sitemap.xml`
*   Dynamic Canonical Tags
*   JSON-LD Structured Data

---
**GTM Adventures is built for the peaks. Every line of code is a safety line.**
