# GTM Adventures — Himalayan Trek Booking Platform

A production-grade, full-stack adventure booking platform built with a clean **monorepo** structure.

## Project Structure

```
gtm-adventure/
├── .env                       ← Shared environment variables
├── prisma/                    ← Database schema (shared)
│   └── schema.prisma
├── scripts/                   ← Maintenance scripts (seeding, etc.)
│
├── frontend/                  ← Next.js 16 App (UI + Auth session)
│   ├── src/
│   │   ├── app/               ← Pages: /, /login, /register, /treks, /about, /dashboard
│   │   ├── components/        ← UI components (Header, BookingWidget)
│   │   ├── hooks/             ← Client-side hooks
│   │   └── middleware.ts      ← Route protection (NextAuth)
│   └── package.json
│
└── backend/                   ← Express.js REST API (Port 4000)
    ├── src/
    │   ├── server.ts          ← Entry point
    │   ├── lib/               ← Prisma, Redis, Gemini AI, OTP, Rate Limiting
    │   ├── routes/            ← /api/auth, /api/treks, /api/bookings, /api/embeddings
    │   └── services/          ← Business logic (coming in future modules)
    └── package.json
```

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16, TypeScript, Tailwind CSS, Framer Motion |
| Auth | NextAuth v5 (session layer, calls backend) |
| Backend | Express.js, TypeScript, tsx |
| Database | PostgreSQL + Prisma ORM |
| Cache/Rate Limiting | Redis (IORedis) |
| AI Search | Google Gemini (768-D embeddings) |

## 🛡️ Security Architecture: 

Our platform is built on a **Zero-Trust** foundation, ensuring every action is verified and every role is isolated.

### 1. Zero-Trust Access Control
* **Middleware Interception:** We use Next.js Middleware to intercept every request, enforcing role-based permissions (`TREKKER`, `LEADER`, `ADMIN`) before any page logic executes.

### 2. Multi-Layer Authentication
* **Social Auth:** 1-tap integration via **Auth.js (NextAuth)** for seamless Google/Gmail login.
* **Phone + OTP:** High-fidelity mobile login using **Twilio Verify** to securely capture and verify high-intent users.
* **Traditional:** Industrial email/password with salted `bcrypt` hashing.

### 3. Production Hardening ("Must-Haves")
* **Account Lockout:** Integrated **Redis-based rate limiting** that blocks IPs after 5 failed attempts, neutralizing brute-force attacks.
* **Session Audit Logs:** Automated logging of IP, device, and timestamp for every successful sign-in—crucial for forensic auditing.
* **Elevated 2FA:** Mandatory second factor (**TOTP**) for every `ADMIN` and `LEADER` account to prevent credential theft.

### 4. Role Hierarchy & Operational Protocols
* **TREKKER:** Consumer-level access to personal bookings, medical history, and specific expedition HUDs.
* **GROUP LEADER (Team Leader):** Tactical field oversight.
    1. **🛡️ The "Guide Assignment" Logic**:
       In the database, every Trek has an optional `guideID`.
       - **Assignment**: An Admin assigns a Group Leader to a specific trek (or multiple treks).
       - **Strict Filtering**: When a Group Leader logs in, the backend automatically filters all data. They do not "search" for participants; the system only delivers the participants and bookings linked to the treks they are officially guiding.
    2. **🛡️ Strategic "No-Access" Guarantee**:
       Because this filtering happens at the Database level (not just the UI), a Group Leader has zero technical way to see:
       - Global revenue or total platform bookings.
       - The participants of other Group Leaders.
       - Platform-wide analytics.
    3. **🛡️ What the Group Leader Sees**:
       When they open their "My Participants" or "Safety Records" links:
       - If they are assigned to "Everest Base Camp - April Batch", they see only those 15 trekkers.
       - If they have no assignments yet, their dashboard will professionally state: "No active tactical deployments assigned. Contact administration for group allocation."
* **ADMIN:** HQ-level control. Strategic oversight of global revenue, platform-wide treks, user management, and system-wide audit logs.

## 🎨 Design System: "Elite Midnight"

Our design philosophy for GTM Adventures prioritizes **High-Density, Engineering-First aesthetics** that match the standards of top-tier global trekking agencies.

| Token | Value | Rationale |
|---|---|---|
| **Primary** | `#1e3a8a` (Midnight Blue) | Represents the deep Himalayan sky; provides a premium, trustworthy "Command Center" feel. |
| **Interface** | **Glassmorphism** | `backdrop-blur-3xl` with white glass overlays for a high-tech "Satellite HUD" look. |
| **Verified Status** | **Brand Blue** | Unified "Elite Verification" status to match brand identity instead of generic green. |
| **Geometry** | **Landscape Rectangle** | Optimized `720px` wide-screen layouts for professional data entry and status reporting. |

## Getting Started

### 1. Install dependencies
```bash
npm install
```

### 2. Set up environment variables
```bash
cp .env.example .env
# Fill in DATABASE_URL, AUTH_SECRET, GEMINI_API_KEY, etc.
```

### 3. Run database migrations
```bash
npm run db:generate
npm run db:migrate
```

### 🔍 Member & Operations Directory
To verify all registered personnel, guides, and leadership status, run:
```bash
npx tsx scripts/audit-personnel.ts
```

### 🏔️ Booking Management
To reseed the base trekking data and mock expeditions:
```bash
npm run seed
```

### 5. Start both servers
```bash
npm run dev
# Frontend: http://localhost:3000
# Backend:  http://localhost:4000
```

## API Endpoints (Backend — Port 4000)

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/health` | Health check |
| POST | `/api/auth/register` | Create new user |
| POST | `/api/auth/login` | Credential verification |
| POST | `/api/auth/otp` | Request OTP |
| GET | `/api/treks` | List treks with AI search + filters |
| GET | `/api/treks/:id` | Get single trek |
| POST | `/api/bookings` | Create booking (atomic) |
| GET | `/api/bookings?email=...` | Get user bookings |
| POST | `/api/embeddings` | Generate AI embeddings (dev only) |

## 🛡️ Payment & High-Concurrency Architecture (Module 3)

We have engineered the booking engine to handle high-traffic bursts and unstable networks identically to a Tier-1 production SaaS setup.

### 1. The "Flash Sale" Double Booking Edge Case
* **Risk:** 50 users try to book the final 2 spots at exactly the same millisecond.
* **Solution:** We implemented atomic, database-level **Pessimistic Row Locking** (`SELECT ... FOR UPDATE` via Prisma `$transaction`). The PostgreSQL engine physically queues the concurrent requests, ensuring the `availableSpots` tracker is decremented fairly without racing. The system throws a `NOT_ENOUGH_SPOTS` error gracefully to latecomers.

### 2. The "Abandoned Cart" Edge Case
* **Risk:** A user clicks "Secure Checkout", locking our strict inventory, but closes their tab, leaving the booking stuck in `PENDING` and permanently stealing spots from paying customers.
* **Solution:** A **Spot Recovery Cron Mechanism** (`/api/cron/release-spots`). If a booking stays `PENDING` for more than 10 minutes, the background job autonomously releases the inventory back to the active pool. We also provided a manual "Cancel & Release Spots" button inside the Booking Widget.

### 3. The "Dropped Internet" Edge Case
* **Risk:** A user pays on their phone just as they lose cell service. Razorpay charges their card, but the frontend never sends the verification ping (`/api/razorpay/verify`) to Next.js.
* **Solution:** The **Razorpay Webhook** endpoint (`/api/webhooks/razorpay`). Even if the frontend connection completely drops, Razorpay's massive servers independently dial our Next.js backend with a cryptographic signature, confirming the payment and autonomously forcing the booking status to `CONFIRMED`.

## Module Roadmap

- [x] **Module 1: High-Fidelity UI/UX Framework** (Visual Command Center)
- [x] **Module 2: AI-Powered Adventure Discovery** (Semantic Search)
- [x] **Module 3: High-Concurrency Booking Engine** (Secure Payments)
  - [x] Setup real Razorpay API keys (`RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`) in `.env` (Live Test Mode).
  - [x] Setup Webhook URL in Razorpay Dashboard to capture closed-browser payments and add `RAZORPAY_WEBHOOK_SECRET` to `.env`.
  - [x] Implement 10-minute auto-cancellation script/timeout to release pending or abandoned cart spots back to the public pool so you don't lose upfront space.
## 📡 Community & Social Ledger (Module 6: Command Center)

Command Center is the high-tech "Digital Command Center" for every GTM-Adventure expedition. It transforms a standard booking into a tactical, ongoing mission.

### 1. The "Satellite Uplink" Concept
* **Social Ledger:** A private communication feed for expedition members (Trekkers & Leaders) to share updates, milestones, and alerts.
* **Connectivity Logic:** In the Himalayas, where cell towers are scarce, the app is designed to sync via **Satellite Hotspots** (e.g., Starlink, Iridium GO!). 
* **Global Sync:** If any single member of the team gets a signal (Satellite or Basecamp WiFi) and sends an update, it is "beamed" to the cloud and becomes visible to the entire authorized crew.

### 2. Personnel Roster
A secure **Personnel Registry** that identifies the Expedition Leader (Guide) and all confirmed Trekkers. It builds community by showing participant roles and profiles before deployment.

### 3. Technical Roadmap (Upcoming)

| Feature | Technology | Rationale |
|---|---|---|
| **Real-Time Feed** | **Socket.io** | Implementation of Bi-directional WebSockets to ensure updates "pop-up" instantly on everyone's dashboard without a page refresh (NASA Command Center style). |
| **Media Transmissions** | **Cloudinary / AWS** | High-altitude photos and videos are stored in dedicated buckets. Cloudinary is used for automated compression to ensure 4K mountain photos can be sent even over slow satellite links. |

## Module Roadmap

- [x] **Module 1: High-Fidelity UI/UX Framework** (Visual Command Center)
- [x] **Module 2: AI-Powered Adventure Discovery** (Semantic Search)
- [x] **Module 3: High-Concurrency Booking Engine** (Secure Payments)
- [x] **Module 4: Live Expedition Monitoring** (Command Center)
- [x] **Module 5: Expedition Health & Wellness** (Vital Telemetry)
- [x] **Module 6: Community & Social Ledger** (Shared Journeys)
  - [x] **Personnel Roster:** Complete view of the expedition crew and leader.
  - [x] **Mission Feed:** Basic Uplink architecture for text updates.
  - [x] **Database Sync:** Restored schema for `ExpeditionPost` and `PostComment`.
  - [ ] **Socket.io Integration:** Real-time bi-directional feed (Future Engineering).
  - [ ] **Cloudinary Integration:** High-altitude media uploads (Future Enhancement).
- [ ] Module 7: Equipment Rental & Add-ons
- [ ] Module 8: Expedition Management
- [ ] Module 9: Gtm Miles & Loyalty Engine
- [ ] Module 10: Production Optimization & SEO
- [ ] Module 11: Partner & Vendor Portal
- [ ] Module 12: Main Admin Panel (HQ Command Center)



