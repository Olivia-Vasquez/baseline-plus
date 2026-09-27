# Baseline

Baseline is a personal recovery and activity dashboard. Daily records and their activity contributions are stored in PostgreSQL and served through the Next.js API.

## PostgreSQL Setup

1. Create a PostgreSQL database with your provider or local PostgreSQL installation.
2. Copy `.env.example` to `.env.local` and set `DATABASE_URL` to the database connection string. `BASELINE_USER_ID` must identify the user whose records this app instance will access; the example UUID matches the development seed.
3. Apply the schema and development data once:

```bash
npm run db:migrate
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

`users` owns daily records. `daily_metrics` stores one row per user and date, enforced by a unique constraint and indexed by `(user_id, metric_date DESC)`. `metric_contributions` stores activity, step, rest, and breathwork contributions, with cascading deletion and indexes for detail-page reads.

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
