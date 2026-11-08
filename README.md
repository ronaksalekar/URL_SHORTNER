# 🔗 High-Performance URL Shortener & Analytics API

A production-grade, collision-free URL shortening and real-time click analytics REST API engineered with **Node.js**, **Express**, and **PostgreSQL**.

[![Node Version](https://img.shields.io/badge/Node.js-%3E%3D18.0.0-339933?logo=node.js)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.21-000000?logo=express)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql)](https://www.postgresql.org/)
[![Deployed on Railway](https://img.shields.io/badge/Railway-Live%20Deploy-0B0D0E?logo=railway)](https://railway.com/)

---

## ⚡ Architectural Highlights

1. **Collision-Free $O(1)$ Short Code Generation:**
   - Rather than generating random hashes and checking for collisions with expensive database retries, short codes are derived by converting PostgreSQL `BIGSERIAL` sequence values into dense **Base62** strings (`[a-zA-Z0-9]`).
2. **Real-Time Click Analytics & Auditing:**
   - Every `302 Found` redirection logs request metadata (IP address, referrer header, user agent, timestamp) directly into a relational `clicks` table indexed for time-series aggregation.
3. **Link Expiration & Lifecycle State:**
   - Supports optional `expiresAt` timestamps and soft deactivation (`isActive`). Expired or deactivated links return standard HTTP `410 Gone`.
4. **Perimeter Abuse Prevention:**
   - Restricts long URLs to safe protocols (`http:` and `https:`) and blocks dangerous URI schemes (`javascript:`, `data:`).
   - Enforces IP-based rate limiting via `express-rate-limit` (100 requests per 15-minute window).
5. **Production Reliability & PaaS Readiness:**
   - Automated idempotent database migrations run seamlessly on deploy (`node scripts/migrate.js`).
   - Dynamic PostgreSQL SSL negotiation (`{ rejectUnauthorized: false }`) compatible with cloud databases (Railway, Neon, Supabase, Render).
   - Graceful shutdown handling (`SIGTERM`/`SIGINT`) to drain the database pool and finish in-flight requests.

---

## 🏛️ System Architecture

```
HTTP Clients (Web / Mobile / Curl)
           │
           ▼
┌──────────────────────────────────────┐
│        Express Application           │
│  • Trust Proxy (Reverse Proxies)     │
│  • Rate Limiting (100 req/15m)       │
│  • URL Scheme Sanitization           │
└──────────────────┬───────────────────┘
                   │
    ┌──────────────┴──────────────┐
    ▼                             ▼
[ POST /api/shorten ]     [ GET /:shortCode ]
• Fetch BIGSERIAL sequence • Query active URL
• Encode Base62 string    • Log click metadata
• Insert into urls table  • Return 302 redirect
    │                             │
    └──────────────┬──────────────┘
                   │
                   ▼
┌──────────────────────────────────────┐
│       PostgreSQL Database            │
│  • urls (id, short_code, long_url)   │
│  • clicks (url_id, ip, referrer)     │
└──────────────────────────────────────┘
```

---

## 🚀 API Reference

### 1. Healthcheck
```http
GET /health
```
**Response (200 OK):**
```json
{
  "status": "ok"
}
```

### 2. Shorten a URL
```http
POST /api/shorten
Content-Type: application/json

{
  "longUrl": "https://github.com",
  "expiresAt": "2026-12-31T23:59:59.000Z" // optional
}
```
**Response (201 Created):**
```json
{
  "shortCode": "b",
  "shortUrl": "https://your-domain.com/b",
  "longUrl": "https://github.com",
  "createdAt": "2026-11-08T09:23:44.023Z",
  "expiresAt": null
}
```

### 3. Redirect to Long URL
```http
GET /:shortCode
```
* Returns HTTP `302 Found` with `Location: <longUrl>`.
* Asynchronously records visit timestamp, referrer, IP, and user-agent.
* If expired or inactive, returns HTTP `410 Gone`.

### 4. Click Analytics & Statistics
```http
GET /api/stats/:shortCode
```
**Response (200 OK):**
```json
{
  "shortCode": "b",
  "longUrl": "https://github.com",
  "createdAt": "2026-11-08T09:23:44.023Z",
  "expiresAt": null,
  "isActive": true,
  "totalClicks": 124,
  "clicksByDay": [
    { "date": "2026-11-08T00:00:00.000Z", "count": 124 }
  ],
  "referrers": [
    { "referrer": "direct", "count": 98 },
    { "referrer": "https://twitter.com", "count": 26 }
  ]
}
```

---

## 🛠️ Local Development Setup

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/ronaksalekar/URL_SHORTNER.git
cd URL_SHORTNER
npm install
```

### 2. Configure Environment Variables
Create a `.env` file from the example:
```bash
cp .env.example .env
```
Update `.env` with your PostgreSQL credentials:
```env
PORT=3000
DATABASE_URL=postgresql://postgres:password@localhost:5432/url_shortener
BASE_URL=http://localhost:3000
```

### 3. Run Database Migrations
```bash
npm run migrate
```

### 4. Run the Test Suite
```bash
npm test
```

### 5. Start the Server
```bash
npm run dev   # hot reload with node --watch
# or
npm start     # runs migrations and starts server
```

---

## 🚢 Deployment (Railway CLI)

This project is pre-configured with [`railway.json`](railway.json) for zero-downtime PaaS deployment:

```bash
# 1. Login to Railway
railway login

# 2. Deploy directly from terminal
railway up
```

---

## 📄 License
MIT
