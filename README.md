# Emergency Response Intelligence Platform (ERIP)

A production-oriented operational intelligence platform demonstrating geospatial
search, travel-time analysis, routing, and emergency response workflows.

This repository is built incrementally against the phased roadmap in
[`ROADMAP.md`](./ROADMAP.md). The current implementation covers **Phase 0
(Foundation)** and **Phase 1 (Operational Map MVP)**.

## What's implemented

- **Monorepo** using npm workspaces (`apps/web`, `apps/api`).
- **Backend** — NestJS REST API with `Facilities`, `Resources`, and `Incidents`
  modules serving seeded data (San Francisco operating area).
- **Frontend** — React + TypeScript + Vite Command Center with a Leaflet map
  rendering the three operational layers, layer filters, a legend, and a
  details panel.
- **Docker Compose** — `db` (PostgreSQL), `api`, and `web` services.

> Phase 1 serves data from seeded JSON. PostGIS, Valhalla routing, the AI
> copilot, Kubernetes, and real-time simulation are intentionally **not** yet
> implemented — see the roadmap.

## Project layout

```
.
├── apps/
│   ├── api/            NestJS backend
│   │   └── src/
│   │       ├── common/domain.ts      shared domain contract
│   │       ├── seed/                 seeded facilities/resources/incidents
│   │       ├── facilities/           FacilitiesModule
│   │       ├── resources/            ResourcesModule
│   │       ├── incidents/            IncidentsModule
│   │       └── health/               health check
│   └── web/            React + Vite frontend
│       └── src/
│           ├── pages/CommandCenter.tsx
│           ├── components/           OperationalMap, LayerFilters, DetailsPanel
│           ├── lib/style.ts          map color language
│           └── api/client.ts
├── docker-compose.yml
└── docs/               vision, architecture, data model, scenarios
```

## API endpoints (Phase 1)

| Method | Path              | Description                |
| ------ | ----------------- | -------------------------- |
| GET    | `/api/health`     | Service health + phase     |
| GET    | `/api/facilities` | All facilities             |
| GET    | `/api/facilities/:id` | Single facility        |
| GET    | `/api/resources`  | All responder units        |
| GET    | `/api/resources/:id`  | Single resource        |
| GET    | `/api/incidents`  | All incidents              |
| GET    | `/api/incidents/:id`  | Single incident        |

## Running locally (without Docker)

Requires Node.js 20+.

```bash
npm install            # installs all workspaces

npm run dev:api        # NestJS on http://localhost:3000
npm run dev:web        # Vite dev server on http://localhost:5173
```

The Vite dev server proxies `/api` to the backend, so open
http://localhost:5173/command.

## Running with Docker Compose

```bash
docker compose up --build
```

- Web (nginx): http://localhost:8080/command
- API: http://localhost:3000/api/health
- Postgres: localhost:5432 (user/pass/db: `erip`)

## Roadmap

See [`ROADMAP.md`](./ROADMAP.md) and [`docs/`](./docs) for the full phased plan.
# emergency-response-intelligence-platform
