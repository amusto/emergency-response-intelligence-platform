# Emergency Response Intelligence Platform (ERIP)

A production-oriented operational intelligence platform demonstrating geospatial
search, travel-time analysis, routing, and emergency response workflows.

This repository is built incrementally against the phased roadmap in
[`ROADMAP.md`](./ROADMAP.md). The current implementation covers **Phase 0
(Foundation)**, **Phase 1 (Operational Map MVP)**, **Phase 2 (Operational
Search)**, **Phase 3 (PostGIS Geospatial Search)**, and **Phase 4 (Travel-Time
Routing)**.

## What's implemented

- **Monorepo** using npm workspaces (`apps/web`, `apps/api`).
- **Backend** — NestJS REST API with `Facilities`, `Resources`, `Incidents`,
  `Search`, `Geo`, and `Routing` modules.
- **PostGIS data layer** — entities live in PostgreSQL with
  `geography(Point, 4326)` columns and GiST indexes. The API bootstraps the
  schema and seeds it from the canonical seed data on startup.
- **Proximity search** — `GET /geo/nearby-facilities` and `nearby-resources`
  use `ST_DWithin` + `ST_Distance` to return the nearest entities with
  metre-accurate distances.
- **Travel-time routing** — `GET /routing/route` and `/routing/isochrone` call a
  Valhalla engine over OpenStreetMap. Routing degrades to a clearly-labeled
  straight-line estimate when Valhalla is unavailable, so the demo still works.
- **Frontend** — React + TypeScript + Vite Command Center with a Leaflet map,
  layer filters, legend, search panel (map flies to results), an incident
  details panel listing nearest units/facilities, and on-map routing with an
  ETA + distance banner.
- **Operational search** — `GET /search?q=` returns grouped, relevance-ranked
  matches across incidents, resources, and facilities.
- **Docker Compose** — `db` (PostGIS), `valhalla`, `api`, and `web` services.

> The AI copilot, Kubernetes, and real-time simulation are intentionally **not**
> yet implemented — see the roadmap.

## Project layout

```
.
├── apps/
│   ├── api/            NestJS backend
│   │   └── src/
│   │       ├── common/               domain contract + SQL mappers
│   │       ├── database/             pool, PostGIS schema, seeding
│   │       ├── seed/                 canonical facilities/resources/incidents
│   │       ├── facilities/           FacilitiesModule
│   │       ├── resources/            ResourcesModule
│   │       ├── incidents/            IncidentsModule
│   │       ├── search/               SearchModule (cross-entity search)
│   │       ├── geo/                  GeoModule (ST_DWithin / ST_Distance)
│   │       ├── routing/              RoutingModule (Valhalla + polyline)
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
| GET    | `/api/search?q=`  | Grouped, ranked search across all entities |
| GET    | `/api/geo/nearby-facilities?lat=&lng=&radius=&limit=` | Nearest facilities by distance |
| GET    | `/api/geo/nearby-resources?lat=&lng=&radius=&limit=&type=` | Nearest units (optional EMS/Fire/Police) |
| GET    | `/api/routing/route?fromLat=&fromLng=&toLat=&toLng=&costing=` | Route + travel time between two points |
| GET    | `/api/routing/isochrone?lat=&lng=&contours=5,10,15&costing=` | Travel-time isochrone polygons (Valhalla) |

## Running locally (without Docker)

Requires Node.js 20+ and a reachable PostGIS database. The easiest path is to
run just the database in Docker and the apps on the host:

```bash
npm install                 # installs all workspaces

docker compose up -d db     # PostGIS on localhost:5432 (user/pass/db: erip)

npm run dev:api             # NestJS on http://localhost:3000
npm run dev:web             # Vite dev server on http://localhost:5173
```

The API reads `DATABASE_URL` (default `postgres://erip:erip@localhost:5432/erip`),
bootstraps the PostGIS schema, and seeds it on first start. The Vite dev server
proxies `/api` to the backend, so open http://localhost:5173/command.

## Running with Docker Compose

```bash
docker compose up --build
```

- Web (nginx): http://localhost:8080/command
- API: http://localhost:3000/api/health
- Postgres: localhost:5432 (user/pass/db: `erip`)

## Configuration

The API is configured entirely through environment variables:

| Variable | Default | Purpose |
| -------- | ------- | ------- |
| `DATABASE_URL` | `postgres://erip:erip@localhost:5432/erip` | Postgres/PostGIS connection string |
| `DATABASE_SSL` | `false` | Set `true` to connect over TLS (required by AWS RDS) |
| `DATABASE_CA_CERT` | — | RDS CA bundle as inline PEM or a file path; keeps cert verification on |
| `DATABASE_SSL_REJECT_UNAUTHORIZED` | `true` | Set `false` only as a last resort if no CA is supplied |
| `DB_BOOTSTRAP` | `true` | Run `CREATE EXTENSION`/tables on startup; set `false` if migrations are managed externally |
| `DB_SEED` | `true` | Seed reference data when tables are empty; set `false` in production |
| `VALHALLA_URL` | — | Base URL of the Valhalla engine; if unset, routing uses a straight-line estimate |
| `VALHALLA_TIMEOUT_MS` | `4000` | Per-request timeout for Valhalla calls |
| `PORT` | `3000` | API port |
| `CORS_ORIGIN` | (all) | Comma-separated allowed origins |

### Deploying against AWS RDS (PostGIS)

The existing RDS instance must be PostgreSQL with the PostGIS extension
available (RDS ships it; `CREATE EXTENSION postgis` runs as the `rds_superuser`).
Point the API at it and enable TLS:

```bash
DATABASE_URL=postgres://USER:PASS@your-instance.xxxx.us-east-1.rds.amazonaws.com:5432/erip
DATABASE_SSL=true
DATABASE_CA_CERT=/etc/ssl/certs/rds-global-bundle.pem   # AWS RDS global CA bundle
DB_SEED=false                                           # don't seed demo data into prod
```

Schema bootstrap is wrapped in a Postgres advisory lock, so running multiple
API instances against the same RDS database is safe. If your team applies
schema via a separate migration tool, set `DB_BOOTSTRAP=false`.

## Roadmap

See [`ROADMAP.md`](./ROADMAP.md) and [`docs/`](./docs) for the full phased plan.
# emergency-response-intelligence-platform
