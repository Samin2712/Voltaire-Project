# Problem Statement Check

Source reviewed: `Hackathon Problem Statement (Preliminary Round) v1.2.pdf`.

## Current Status

| Requirement | Status | Notes |
| --- | --- | --- |
| 3 rooms: Drawing Room, Work Room 1, Work Room 2 | OK | Implemented in `src/lib/mock-api.ts`. |
| 2 fans + 3 lights per room | OK | 5 devices per room, 15 total. The PDF later says 18 devices, but that conflicts with the fixed room setup. |
| Simulated live device data | OK | Random device states change every ~4.5 seconds. |
| Device fields: status, power draw, room, last changed | OK | Implemented for every simulated device. |
| Live web dashboard | OK | Dashboard updates without manual refresh through Socket.IO when the backend is running, with mock fallback for offline demos. |
| Top-view office layout with visual states | OK | Lights glow and fans animate when on. |
| Total and per-room power display | Mostly OK | Total power is prominent; per-room breakdown is available in charts, floor plan, analytics, and reports. |
| Active alerts with timestamps | OK | After-hours, all-on-room, high-power, and spike alerts are simulated. |
| Discord bot using same backend | Partial | Backend exposes human-friendly bot endpoints for status, room, usage, and alerts from the shared store. A real Discord gateway/client process is still needed for an actual server bot. |
| Single backend source of truth | OK | Express + Socket.IO backend owns the simulated store; the dashboard reads it live and falls back to local mock data only when the backend is offline. |
| High-level system diagram | Partial | There is a visual architecture section in the app, but no standalone diagram asset in the repo. The PDF says not to use Mermaid. |
| Hardware/electrical schematic | Missing | No Wokwi/Tinkercad schematic or wiring documentation is present. |
| Public codebase with setup README | Improved | Docker setup instructions are now in `README.md`. Public hosting/repo setup is outside this local folder. |
| Video demo | Not applicable | Must be recorded separately. |

## Recommended Next Work

1. Add a real Discord bot process that maps `!status`, `!room <name>`, and `!usage` to the existing `/api/bot/*` endpoints.
2. Add a `docs/architecture-diagram.png` or similar non-Mermaid diagram asset.
3. Add a hardware schematic document with ESP32 pin mapping, relay/input sensing assumptions, and current sensor notes.
4. Decide how to explain the PDF's 15-vs-18 device-count conflict in the final submission.
