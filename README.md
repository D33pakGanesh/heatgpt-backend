# HeatGPT Backend

HeatGPT Backend is the API service for the HeatGPT urban heat island explorer. It serves LGA boundaries from PostGIS, computes or retrieves satellite-derived heat metrics, proxies Earth Engine raster imagery, stores generated layer metadata, and sends selected LGA context to Gemini for HeatGPT chat responses.

This repository is the standalone backend for `D33pakGanesh/heatgpt-backend`. It is designed to be used with the companion frontend at `D33pakGanesh/heatgpt-frontend`.

## Stack

- Node.js
- Express
- TypeScript
- PostgreSQL with PostGIS
- Google Earth Engine
- Google Gemini through `@google/generative-ai`
- Zod for chat request validation
- PM2-compatible ecosystem file

## Architecture

```text
Frontend
  |
  | HTTP /api requests
  v
Express API
  |         |          |
  |         |          +-- Gemini chat responses
  |         +------------- Google Earth Engine metrics and raster tiles
  +----------------------- PostgreSQL/PostGIS cache and LGA storage
```

## Important Endpoints

- `GET /api/health`
- `GET /api/lgas`
- `GET /api/lga/:id/heat`
- `GET /api/lga/:id/tiles`
- `GET /api/lga/:id/tile-image`
- `GET /api/lga/:id/lst-trend`
- `GET /api/lga/:id/ndvi-trend`
- `GET /api/lga/:id/saved-layers`
- `DELETE /api/lga/:id/saved-layers/:layerId`
- `GET /api/lga/:id/suhi`
- `GET /api/lga/:id/suhi-tiles`
- `GET /api/lga/:id/suhi-tile-image`
- `GET /api/lga/:id/suhi-monthly`
- `POST /api/chat`

`POST /api/lga/:id/export` is retained only for backward compatibility and returns `410 Gone`.

## Configuration

Copy `.env.example` to `.env` and fill in local values:

```bash
PORT=3001
FRONTEND_ORIGIN=http://localhost:5173

PGHOST=localhost
PGPORT=5432
PGDATABASE=heatgpt
PGUSER=heatgpt
PGPASSWORD=replace-me

EE_KEY_FILE=/absolute/path/to/earth-engine-service-account.json
GEMINI_API_KEY=replace-me
```

Do not commit `.env`, Earth Engine key files, database dumps, logs, or production credentials.

## Database

The backend expects PostgreSQL with PostGIS enabled. The schema is in `src/db/schema.sql` and includes:

- `lgas`
- `heat_stats`
- `gee_layers`
- `suhi_stats_cache`
- `suhi_monthly_cache`

For a local database, create a database and user, enable PostGIS, then apply the schema:

```bash
psql "$DATABASE_URL" -f src/db/schema.sql
```

The schema does not include production LGA seed data or database contents. Use synthetic or licensed public data for local development.

## Development

```bash
npm ci
npm run dev
```

The dev command starts `src/index.ts`, which attempts to initialise Earth Engine. For tests that do not need Earth Engine, import `src/app.ts`.

## Verification

```bash
npm run typecheck
npm test
npm run build
```

Current verification on October 10, 2026:

- `npm run typecheck` passes.
- `npm test` passes one health endpoint test without requiring Earth Engine or a database.
- `npm run build` passes.
- `npm audit` reports 0 vulnerabilities. This uses a package-lock override that keeps `@google/earthengine` on its current release while resolving its Google API dependency chain to patched Node 20-compatible versions.
