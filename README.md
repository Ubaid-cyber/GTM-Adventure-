# GTM Adventure — Himalayan Trek Booking Platform

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

### 4. Seed the database
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

## Module Roadmap

- ✅ Module 1: Auth & Multi-Role Security
- 🟡 Module 2: AI-Powered Adventure Discovery
- ⬜ Module 3: High-Concurrency Booking Engine
- ⬜ Module 4: Live Expedition Monitoring
- ⬜ Module 5: Health & Wellness (Medical Profiling)
- ⬜ Module 6: Document & Compliance Center
- ⬜ Module 7: Equipment Rental & Add-ons
- ⬜ Module 8: Expedition Management
- ⬜ Module 9: Gtm Miles & Loyalty Engine
- ⬜ Module 10: Production Optimization & SEO
- ⬜ Module 11: Partner & Vendor Portal
