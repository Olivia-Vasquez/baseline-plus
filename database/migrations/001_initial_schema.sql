CREATE TABLE users (
    id UUID PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    display_name TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE daily_metrics (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    metric_date DATE NOT NULL,
    steps INTEGER NOT NULL CHECK (steps >= 0),
    move_calories INTEGER NOT NULL CHECK (move_calories >= 0),
    rest_minutes INTEGER NOT NULL CHECK (rest_minutes >= 0),
    breathwork_minutes INTEGER NOT NULL CHECK (breathwork_minutes >= 0),
    readiness_score SMALLINT NOT NULL CHECK (readiness_score BETWEEN 0 AND 100),
    source TEXT NOT NULL DEFAULT 'import' CHECK (source IN ('demo', 'import', 'manual')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT daily_metrics_one_record_per_user_date UNIQUE (user_id, metric_date)
);

CREATE INDEX daily_metrics_user_date_desc_idx
    ON daily_metrics (user_id, metric_date DESC);

CREATE TABLE metric_contributions (
    id UUID PRIMARY KEY,
    daily_metric_id UUID NOT NULL REFERENCES daily_metrics(id) ON DELETE CASCADE,
    metric_type TEXT NOT NULL CHECK (metric_type IN ('move_calories', 'steps', 'rest', 'breathwork')),
    name VARCHAR(120) NOT NULL,
    duration_minutes INTEGER NOT NULL DEFAULT 0 CHECK (duration_minutes >= 0),
    quantity INTEGER NOT NULL CHECK (quantity >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX metric_contributions_daily_metric_idx
    ON metric_contributions (daily_metric_id, metric_type);

CREATE INDEX metric_contributions_type_daily_idx
    ON metric_contributions (metric_type, daily_metric_id);