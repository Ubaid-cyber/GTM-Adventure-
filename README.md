# 🏔️ GTM ADVENTURES: HQ COMMAND CENTER
**Elite Expedition Management & High-Altitude Logistics Platform**

GTM Adventures is a production-grade travel and expedition engine designed for extreme reliability in mission-critical environments. This platform manages high-value bookings, medical clearances, and real-time situational reports (SITREPs) for global trekking operations.

---

## 🛡️ Mission-Critical Architecture (Zero-Failure Implementation)

The platform is engineered to handle "Worst-Case" production scenarios where data integrity and fiscal accuracy are non-negotiable.

### 1. High-Concurrency & Inventory Safety
**Worst Case**: Hundreds of users attempt to book the last remaining spot on an Everest Base Camp trek simultaneously (The "Flash Sale" problem).
- **The Logic**: We use **Pessimistic Row-Level Locking** (`FOR UPDATE`) within a Prisma Transaction.
- **The Result**: The database "locks" the specific trek row the millisecond the first request arrives. All other simultaneous requests are queued and safely rejected if the spot is gone, preventing "Phantom Overbooking."

### 2. Fiscal Integrity & Audit Precision
**Worst Case**: Bookings are pending or cancelled, but still appear in revenue reports, leading to incorrect tax (GST) liability.
- **The Logic**: Our **Fiscal Aggregation Engine** strictly queries only `status: CONFIRMED` transactions. 
- **The Result**: Real-time revenue charts and the 18% GST estimate are mathematically isolated from noise, ensuring the "Accounting" view is always audit-ready.

### 3. Platform Governance & Forensic Audit
**Worst Case**: An unauthorized change occurs, and admins cannot find the "Who/When/How."
- **The Logic**: Every administrative action triggers a **Deep-Trace Audit Log**. We capture the Action, IP, User ID, and a **Raw JSON Payload**.
- **The Result**: The HQ Command Center features a **Payload Inspection Tool** (Internal Database Modal) that allows for forensic deep-dives into any system event.

### 4. Smart Idempotency (Layer 7 Safety)
**Worst Case**: A user on a lagging network double-clicks "Book Now," accidentally charging themselves twice.
- **The Logic**: We implement a **Hashed Intent Fingerprint** `Hash(UserId + TrekId + Participants)`.
- **The Result**: If a second identical request arrives within 5 minutes, the server identifies the fingerprint and safely redirects the user to their existing receipt instead of creating a second charge.

---

## 🗺️ Expedition Roadmap

### 📦 Phase 1: Core Command (Current focus)
- [x] **Module 12: HQ Command Center**: High-density admin dashboard with fiscal oversight and audit inspection.
- [x] **Module 11: Community Feed**: Satellite-ready situational reports (SITREPs) and mission updates.
- [x] **Module 10: Health & Safety**: Document upload and medical profile management for trekkers.

### 📦 Phase 2: Tactical Intelligence (Next Steps)
- [ ] **Socket.io Integration**: Real-time, bi-directional mission feeds (NASA-style pop-up alerts).
- [ ] **Cloudinary Integration**: Automated compression and secure storage of high-altitude media.
- [ ] **Smart Idempotency Deployment**: Finalizing the Redis-backed request caching.

---

## 🔐 Dummy Test Credentials (DEV ONLY)

For local development and testing of different access levels, use these accounts:

| Role | Email | Password |
| :--- | :--- | :--- |
| **Super Admin** | `admin@gtm-adventures.com` | `admin` |
| **Trek Leader** | `bhatubaid341@gmail.com` | `admin` |
| **Regular User** | `user@gtm-adventures.com` | `admin` |

---

## 🛠️ Technology Stack
- **Engine**: Next.js 14 (App Router)
- **Database**: PostgreSQL with Prisma ORM
- **Real-time**: Socket.io (Planned)
- **Styling**: Vanilla CSS (Elite Midnight/Glassmorphism design system)
- **Payment**: Razorpay Integration (Live)

## 🏗️ Getting Started

1. **Environment Setup**:
   Copy `.env.example` to `.env` and configure your `DATABASE_URL` and `RAZORPAY_KEY_ID`.
   
2. **Database Initialization**:
   ```bash
   npx prisma db push
   npx prisma db seed
   ```

3. **Launch Mission Control**:
   ```bash
   npm run dev
   ```

---
**GTM Adventures is built for the peaks. Every line of code is a safety line.**
