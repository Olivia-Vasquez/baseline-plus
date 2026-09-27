# Baseline

Baseline is a personal recovery and activity dashboard. Daily records and their activity contributions are stored in PostgreSQL and served through the Next.js API.

## PostgreSQL Setup

1. Create a PostgreSQL database with your provider or local PostgreSQL installation.
2. Copy `.env.example` to `.env.local` and set `DATABASE_URL` to the database connection string. `BASELINE_USER_ID` must identify the user whose records this app instance will access; the example UUID matches the development seed.
3. Apply the schema, provider-integration foundation, webhook minimization, and development data once:

```bash
npm run db:migrate
npm run db:migrate:providers
npm run db:migrate:webhook-minimization
npm run db:seed
```

The seed moves the existing three dashboard records and their contribution details into PostgreSQL. No metric values are embedded in the running application.

4. Install dependencies and start the app:

```bash
npm install
npm run dev
```

PostgreSQL must be reachable before opening the dashboard. The app displays a connection/setup state if `DATABASE_URL`, `BASELINE_USER_ID`, the schema, or seeded user is missing. For local PostgreSQL without TLS, remove `?sslmode=require` from the example URL. Managed database providers generally require SSL and supply their own connection string.

## Data Model

`users` owns daily records. `daily_metrics` remains the dashboard projection, one row per user and local date, indexed by `(user_id, metric_date DESC)`. `metric_contributions` stores the existing detail-page contributions.

The provider foundation adds `provider_connections` for consent/scopes and encrypted-token fields, `provider_records` for external identity and normalization status, `activities` and `activity_sources` for cross-provider workout reconciliation, typed `metric_observations`, `daily_metric_aggregates`, and algorithm-versioned `recovery_scores`. `provider_sync_cursors` and `provider_sync_jobs` support backfill and incremental work; `provider_webhook_events` stores only event identifiers/status, not raw webhook payloads. Provider records can carry retention deadlines so provider-specific purge policies can be enforced.

These tables are foundation only: provider OAuth, webhook handlers, workers, device companions, and the new aggregate/score pipeline are not implemented yet. Strava is intentionally not connected: its June 2026 API policy appears to prohibit the persistent storage and cross-source analytics Baseline needs. Obtain written provider clarification and legal approval before implementing any Strava-derived storage or scoring. Garmin also requires program approval and may license specific commercial metrics; Oura requires app approval above 10 users.

Before building connectors, replace the demo `BASELINE_USER_ID` account selection with authenticated server sessions. Store provider tokens only encrypted at rest, never return credentials to the client, request minimal scopes, verify webhook signatures, enqueue event processing, and implement disconnect, provider revocation, user deletion, retention purges, and periodic reconciliation.

Chart queries read a bounded window of recent records; averages are computed in PostgreSQL across the user's full history. Imports are validated on the server and inserted in a transaction. If any date already exists, the whole batch is rejected. `DATABASE_POOL_MAX` tunes the application connection pool; serverless deployments should use a provider's pooled connection endpoint.

## Account Scoping

The account popup is still a demo and does not authenticate users. API queries use the server-side `BASELINE_USER_ID`; the browser cannot choose that ID. The schema is multi-user-ready, but a real authentication/session provider must be integrated before exposing multiple accounts through one deployment.

## CSV Import Format

The Import data page accepts CSV files with exactly these columns:

```text
date,steps,moveCalories,restMinutes,breatheMinutes,readinessScore
```

Dates must be real `YYYY-MM-DD` values. Metric values must be non-negative whole numbers; readiness must be from 0 to 100. Aggregate CSV rows are stored as imported daily summaries, not fabricated activity breakdowns.

## Development Checks

```bash
npm run lint
npm run build
```

Baseline is a personal software project and is not a medical device. It does not provide medical advice, diagnosis, or treatment recommendations.
