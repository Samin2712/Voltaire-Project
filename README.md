# ⚡ Voltaire — Smart Office Energy Monitoring

Real-time IoT platform for monitoring every light and fan across your office. Live power analytics, room intelligence, instant anomaly alerts, and a Discord co-pilot — all from one beautifully-crafted dashboard.

## 🏗️ Architecture

```
[ Simulated Devices (15) ]
         │
         ▼
[  Backend API (Express + Socket.IO)  ]
    │            │            │
    ▼            ▼            ▼
[ Web UI ]  [ Discord Bot ]  [ REST Clients ]
```

**One backend. Two surfaces. Zero drift.**
Dashboard and bot both read from the same source of truth.

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ (or Bun)
- **npm** or **bun**

### 1. Start the Backend

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

Backend starts at **http://localhost:3001**

### 2. Start the Frontend

```bash
# From project root
npm install   # or: bun install
npm run dev   # or: bun run dev
```

Frontend starts at **http://localhost:3000**

### 3. Docker (Both Services)

```bash
docker-compose up --build
```

- Frontend: http://localhost:3000
- Backend: http://localhost:3001

## 📦 Project Structure

```
pulse-office-grid/
├── backend/                    # Node.js + Express + TypeScript
│   ├── src/
│   │   ├── server.ts           # Entry — HTTP + Socket.IO
│   │   ├── app.ts              # Express app factory
│   │   ├── config/             # Environment config
│   │   ├── types/              # Shared interfaces
│   │   ├── data/               # SQLite data layer
│   │   ├── services/           # Business logic
│   │   ├── routes/             # REST API (17+ endpoints)
│   │   ├── socket/             # Socket.IO manager
│   │   ├── simulator/          # Device simulator
│   │   └── utils/              # Helpers
│   ├── .env.example
│   └── package.json
├── src/                        # React + TanStack Start frontend
│   ├── components/             # UI components
│   ├── lib/
│   │   ├── api.ts              # Backend API service
│   │   ├── socket.ts           # Socket.IO client
│   │   ├── use-live-data.ts    # React hooks (backend + mock fallback)
│   │   ├── mock-api.ts         # Offline mock data
│   │   └── types.ts            # TypeScript types
│   └── routes/                 # Page routes
├── docker-compose.yml
└── README.md
```

## 🔌 API Reference

### Core Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/devices` | All 15 devices |
| GET | `/api/devices/:id` | Single device |
| PATCH | `/api/devices/:id/toggle` | Toggle ON/OFF |
| GET | `/api/rooms` | All rooms + summaries |
| GET | `/api/rooms/:roomId` | Single room |
| GET | `/api/usage` | Current power, kWh, bill |
| GET | `/api/usage/history` | Historical chart data |
| GET | `/api/alerts` | Active alerts |
| PATCH | `/api/alerts/:id/dismiss` | Dismiss alert |
| GET | `/api/activity` | Activity timeline |
| GET | `/api/stats` | Dashboard KPIs |
| GET | `/api/reports/daily` | Daily report |
| GET | `/api/reports/weekly` | Weekly report |

### Discord Bot Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/bot/status` | Office status summary |
| GET | `/api/bot/room/:name` | Room summary |
| GET | `/api/bot/usage` | Usage summary |
| GET | `/api/bot/alerts` | Alerts summary |

## 📡 Socket.IO Events

| Event | Direction | Description |
|-------|-----------|-------------|
| `client:connected` | Server → Client | Full initial state |
| `device:update` | Server → Client | Device states changed |
| `usage:update` | Server → Client | Power/energy updated |
| `room:update` | Server → Client | Room data updated |
| `alert:new` | Server → Client | New alert |
| `alert:update` | Server → Client | Alert dismissed |
| `activity:new` | Server → Client | Activity event |
| `dashboard:update` | Server → Client | KPI refresh |

## ⚙️ Environment Variables

See `backend/.env.example` for all configurable values:

- `PORT` — Backend port (default: 3001)
- `CORS_ORIGIN` — Allowed frontend origins
- `SIMULATOR_INTERVAL_MS` — Simulation speed (default: 5000ms)
- `OFFICE_HOURS_START/END` — Office hours (9–17)
- `HIGH_POWER_THRESHOLD` — Alert threshold (600W)
- `BILL_RATE_PER_KWH` — Electricity rate (8.4 BDT)

## 🏠 Rooms & Devices

| Room | Fans | Lights | Total |
|------|------|--------|-------|
| Drawing Room | 2 | 3 | 5 |
| Work Room 1 | 2 | 3 | 5 |
| Work Room 2 | 2 | 3 | 5 |
| **Total** | **6** | **9** | **15** |

Power: Fan = 60W, Light = 15W

## 🔔 Alert Types

| Type | Severity | Trigger |
|------|----------|---------|
| After-hours | 🔴 Critical | Device ON outside 9AM–5PM |
| Full room | 🟡 Warning | All 5 devices ON > 2 hours |
| High power | 🟡 Warning | Total > 600W |
| Spike | 🔵 Info | Sudden increase > 150W |

## 🛠️ Technology Stack

**Frontend:** React 19, TypeScript, TanStack Start, Tailwind v4, shadcn/ui, Framer Motion, Recharts, Lucide

**Backend:** Node.js, Express, TypeScript, Socket.IO, SQLite (better-sqlite3), CORS

**DevOps:** Docker, Docker Compose

## 📝 License

Built for Techathon Nationals & Rover Summit 2026.
