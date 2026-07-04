# ⚡ Voltaire Backend

Smart Office Energy Monitoring — Backend API, Simulator & Discord Bot API.

## Quick Start

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Start development server (auto-reload)
npm run dev
```

The server starts at **http://localhost:3001**.

---

## Architecture

```
backend/
├── src/
│   ├── server.ts          # Entry point — HTTP + Socket.IO
│   ├── app.ts             # Express app factory
│   ├── config/            # Environment & settings
│   ├── types/             # TypeScript interfaces
│   ├── data/              # SQLite data layer
│   │   ├── database.ts    # Schema, seed, connection
│   │   ├── devices.ts     # Device CRUD
│   │   ├── alerts.ts      # Alert CRUD
│   │   ├── activity.ts    # Activity log
│   │   └── usage.ts       # Power samples & history
│   ├── services/          # Business logic
│   │   ├── device-service.ts
│   │   ├── alert-service.ts
│   │   ├── usage-service.ts
│   │   └── bot-service.ts
│   ├── routes/            # REST API routes
│   ├── socket/            # Socket.IO manager
│   ├── simulator/         # Device simulator
│   └── utils/             # Helper functions
├── data/                  # SQLite database (auto-created)
├── .env.example
└── package.json
```

---

## API Endpoints

### Core

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Server health check |
| GET | `/api/devices` | All 15 devices |
| GET | `/api/devices/:id` | Single device |
| PATCH | `/api/devices/:id/toggle` | Toggle device ON/OFF |
| PATCH | `/api/devices/:id` | Update device status |
| GET | `/api/rooms` | All rooms with summaries |
| GET | `/api/rooms/:roomId` | Single room with devices |
| GET | `/api/usage` | Current power, kWh, bill |
| GET | `/api/usage/history?period=hourly\|weekly` | Historical data |
| GET | `/api/alerts` | Active alerts |
| PATCH | `/api/alerts/:id/dismiss` | Dismiss alert |
| GET | `/api/activity` | Recent activity log |
| GET | `/api/stats` | Dashboard KPIs |
| GET | `/api/reports/daily` | Daily report |
| GET | `/api/reports/weekly` | Weekly report |

### Discord Bot

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/bot/status` | Human-friendly office status |
| GET | `/api/bot/room/:roomName` | Room summary (fuzzy match) |
| GET | `/api/bot/usage` | Usage summary |
| GET | `/api/bot/alerts` | Active alerts summary |

---

## Socket.IO Events

### Server → Client

| Event | Payload | Description |
|-------|---------|-------------|
| `client:connected` | Full initial state | Sent on connection |
| `device:update` | `Device[]` | Device states changed |
| `usage:update` | `UsageData` | Power/energy updated |
| `room:update` | `RoomSummary[]` | Room data updated |
| `alert:new` | `Alert` | New alert created |
| `alert:update` | `Alert` | Alert dismissed/resolved |
| `activity:new` | `ActivityEvent` | New activity event |
| `dashboard:update` | `DashboardStats` | Dashboard KPIs refreshed |

---

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3001` | Server port |
| `HOST` | `0.0.0.0` | Bind address |
| `CORS_ORIGIN` | `http://localhost:3000` | Allowed origins (comma-sep) |
| `SIMULATOR_INTERVAL_MS` | `5000` | Simulation tick interval |
| `OFFICE_HOURS_START` | `9` | Office start hour (24h) |
| `OFFICE_HOURS_END` | `17` | Office end hour (24h) |
| `HIGH_POWER_THRESHOLD` | `600` | High power alert (watts) |
| `SPIKE_THRESHOLD` | `150` | Spike detection (watts) |
| `BILL_RATE_PER_KWH` | `8.4` | Electricity rate (BDT) |
| `DB_PATH` | `./data/voltaire.db` | SQLite database path |

---

## Simulator

The simulator runs every 5 seconds and:

1. **Time-aware toggling**: More devices ON during office hours (9AM–5PM), fewer after hours
2. **Spike simulation**: 5% chance per tick of turning on 3–4 extra devices
3. **Runtime tracking**: Accumulates runtime and energy for ON devices
4. **Alert generation**: Checks for after-hours, full-room, high-power, and spike conditions
5. **Real-time emission**: Pushes all updates via Socket.IO

---

## Alert Types

| Type | Severity | Trigger |
|------|----------|---------|
| `after-hours` | Critical | Device ON outside 9AM–5PM |
| `full-room` | Warning | All 5 devices ON > 2 hours |
| `high-power` | Warning | Total power > 600W |
| `spike` | Info | Sudden increase > 150W |
