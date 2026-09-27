BEGIN;

CREATE TABLE provider_connections (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    provider TEXT NOT NULL CHECK (provider IN (
        'apple_health', 'health_connect', 'garmin', 'whoop', 'oura', 'strava'
    )),
    provider_user_id TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
        'pending', 'connected', 'reauthorization_required', 'disconnected', 'error'
    )),
    granted_scopes TEXT[] NOT NULL DEFAULT '{}',
    access_token_ciphertext BYTEA,
    refresh_token_ciphertext BYTEA,
    token_expires_at TIMESTAMPTZ,
    encryption_key_version SMALLINT,
    connected_at TIMESTAMPTZ,
    disconnected_at TIMESTAMPTZ,
    last_webhook_at TIMESTAMPTZ,
    last_successful_sync_at TIMESTAMPTZ,
    last_error_code TEXT,
    last_error_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT provider_connections_user_provider_identity_uq
        UNIQUE (user_id, provider, provider_user_id),
    CONSTRAINT provider_connections_id_user_uq UNIQUE (id, user_id),
    CONSTRAINT provider_connections_token_key_version_ck
        CHECK (
            (access_token_ciphertext IS NULL AND refresh_token_ciphertext IS NULL)
            OR encryption_key_version IS NOT NULL
        )
);

CREATE INDEX provider_connections_user_status_idx
    ON provider_connections (user_id, status, provider);

CREATE TABLE provider_sync_cursors (
    id UUID PRIMARY KEY,
    provider_connection_id UUID NOT NULL REFERENCES provider_connections(id) ON DELETE CASCADE,
    data_type TEXT NOT NULL,
    cursor_value TEXT,
    backfill_from TIMESTAMPTZ,
    backfill_until TIMESTAMPTZ,
    last_successful_sync_at TIMESTAMPTZ,
    last_attempted_sync_at TIMESTAMPTZ,
    next_sync_at TIMESTAMPTZ,
    consecutive_failures INTEGER NOT NULL DEFAULT 0 CHECK (consecutive_failures >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT provider_sync_cursors_connection_type_uq
        UNIQUE (provider_connection_id, data_type)
);

CREATE INDEX provider_sync_cursors_due_idx
    ON provider_sync_cursors (next_sync_at, provider_connection_id)
    WHERE next_sync_at IS NOT NULL;

CREATE TABLE provider_sync_jobs (
    id UUID PRIMARY KEY,
    provider_connection_id UUID NOT NULL REFERENCES provider_connections(id) ON DELETE CASCADE,
    data_type TEXT NOT NULL,
    job_type TEXT NOT NULL CHECK (job_type IN ('backfill', 'incremental', 'fetch_record', 'reconcile')),
    status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN (
        'queued', 'running', 'retry', 'succeeded', 'failed', 'cancelled'
    )),
    window_start TIMESTAMPTZ,
    window_end TIMESTAMPTZ,
    cursor_value TEXT,
    idempotency_key TEXT NOT NULL,
    attempt_count INTEGER NOT NULL DEFAULT 0 CHECK (attempt_count >= 0),
    available_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    locked_at TIMESTAMPTZ,
    locked_by TEXT,
    completed_at TIMESTAMPTZ,
    last_error_code TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT provider_sync_jobs_connection_idempotency_uq
        UNIQUE (provider_connection_id, idempotency_key),
    CONSTRAINT provider_sync_jobs_window_ck
        CHECK (window_start IS NULL OR window_end IS NULL OR window_start < window_end)
);

CREATE INDEX provider_sync_jobs_queue_idx
    ON provider_sync_jobs (available_at, created_at)
    WHERE status IN ('queued', 'retry');

CREATE INDEX provider_sync_jobs_connection_created_idx
    ON provider_sync_jobs (provider_connection_id, created_at DESC);

CREATE TABLE provider_webhook_events (
    id UUID PRIMARY KEY,
    provider TEXT NOT NULL CHECK (provider IN (
        'apple_health', 'health_connect', 'garmin', 'whoop', 'oura', 'strava'
    )),
    provider_connection_id UUID,
    provider_event_id TEXT,
    event_type TEXT NOT NULL,
    external_record_id TEXT,
    payload JSONB NOT NULL DEFAULT '{}'::JSONB,
    signature_verified BOOLEAN NOT NULL DEFAULT false,
    status TEXT NOT NULL DEFAULT 'received' CHECK (status IN (
        'received', 'queued', 'processed', 'ignored', 'retry', 'failed'
    )),
    received_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    processed_at TIMESTAMPTZ,
    retention_expires_at TIMESTAMPTZ,
    attempt_count SMALLINT NOT NULL DEFAULT 0 CHECK (attempt_count >= 0),
    last_error_code TEXT
);

CREATE UNIQUE INDEX provider_webhook_events_provider_event_uq
    ON provider_webhook_events (provider, provider_event_id)
    WHERE provider_event_id IS NOT NULL;

CREATE INDEX provider_webhook_events_pending_idx
    ON provider_webhook_events (received_at, id)
    WHERE status IN ('received', 'queued', 'retry');

CREATE INDEX provider_webhook_events_retention_idx
    ON provider_webhook_events (retention_expires_at)
    WHERE retention_expires_at IS NOT NULL;

CREATE TABLE provider_records (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    provider_connection_id UUID NOT NULL,
    record_type TEXT NOT NULL,
    external_record_id TEXT NOT NULL,
    external_updated_at TIMESTAMPTZ,
    started_at TIMESTAMPTZ,
    ended_at TIMESTAMPTZ,
    source_timezone TEXT,
    local_date DATE,
    deleted_at TIMESTAMPTZ,
    normalized_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    normalizer_version SMALLINT NOT NULL DEFAULT 1 CHECK (normalizer_version > 0),
    retention_expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT provider_records_connection_identity_uq
        UNIQUE (provider_connection_id, record_type, external_record_id),
    CONSTRAINT provider_records_id_user_uq UNIQUE (id, user_id),
    CONSTRAINT provider_records_connection_user_fk
        FOREIGN KEY (provider_connection_id, user_id)
        REFERENCES provider_connections(id, user_id) ON DELETE CASCADE,
    CONSTRAINT provider_records_time_order_ck
        CHECK (started_at IS NULL OR ended_at IS NULL OR started_at <= ended_at)
);

CREATE INDEX provider_records_user_local_date_idx
    ON provider_records (user_id, local_date DESC, id)
    WHERE deleted_at IS NULL;

CREATE INDEX provider_records_connection_updated_idx
    ON provider_records (provider_connection_id, external_updated_at DESC);

CREATE INDEX provider_records_retention_idx
    ON provider_records (retention_expires_at)
    WHERE retention_expires_at IS NOT NULL;

CREATE TABLE activities (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    activity_type TEXT NOT NULL,
    title TEXT,
    started_at TIMESTAMPTZ NOT NULL,
    ended_at TIMESTAMPTZ,
    source_timezone TEXT,
    local_date DATE NOT NULL,
    duration_seconds INTEGER CHECK (duration_seconds IS NULL OR duration_seconds >= 0),
    distance_meters NUMERIC(14, 3) CHECK (distance_meters IS NULL OR distance_meters >= 0),
    elevation_gain_meters NUMERIC(12, 3) CHECK (elevation_gain_meters IS NULL OR elevation_gain_meters >= 0),
    active_energy_kcal NUMERIC(12, 3) CHECK (active_energy_kcal IS NULL OR active_energy_kcal >= 0),
    total_energy_kcal NUMERIC(12, 3) CHECK (total_energy_kcal IS NULL OR total_energy_kcal >= 0),
    average_heart_rate_bpm NUMERIC(7, 3),
    max_heart_rate_bpm NUMERIC(7, 3),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT activities_id_user_uq UNIQUE (id, user_id),
    CONSTRAINT activities_time_order_ck CHECK (started_at <= ended_at OR ended_at IS NULL)
);

CREATE INDEX activities_user_local_date_idx
    ON activities (user_id, local_date DESC, started_at DESC);

CREATE TABLE activity_sources (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    activity_id UUID NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
    provider_record_id UUID NOT NULL REFERENCES provider_records(id) ON DELETE CASCADE,
    match_method TEXT NOT NULL CHECK (match_method IN ('exact_id', 'provider_link', 'heuristic', 'user_confirmed')),
    match_confidence NUMERIC(5, 4) CHECK (match_confidence IS NULL OR match_confidence BETWEEN 0 AND 1),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (user_id, activity_id, provider_record_id),
    CONSTRAINT activity_sources_activity_user_fk
        FOREIGN KEY (activity_id, user_id) REFERENCES activities(id, user_id) ON DELETE CASCADE,
    CONSTRAINT activity_sources_record_user_fk
        FOREIGN KEY (provider_record_id, user_id) REFERENCES provider_records(id, user_id) ON DELETE CASCADE,
    CONSTRAINT activity_sources_provider_record_uq UNIQUE (provider_record_id)
);

CREATE INDEX activity_sources_provider_record_idx
    ON activity_sources (provider_record_id);

CREATE TABLE metric_definitions (
    metric_key TEXT PRIMARY KEY,
    canonical_unit TEXT NOT NULL,
    value_kind TEXT NOT NULL CHECK (value_kind IN ('instant', 'interval', 'daily_summary', 'score')),
    description TEXT NOT NULL,
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO metric_definitions (metric_key, canonical_unit, value_kind, description)
VALUES
    ('step_count', 'count', 'interval', 'Steps accumulated during an interval'),
    ('active_energy', 'kcal', 'interval', 'Active energy expenditure'),
    ('total_energy', 'kcal', 'daily_summary', 'Total energy expenditure; do not add to active energy'),
    ('heart_rate', 'bpm', 'instant', 'Heart rate measurement'),
    ('resting_heart_rate', 'bpm', 'daily_summary', 'Provider-defined resting heart rate'),
    ('hrv_rmssd', 'ms', 'interval', 'Heart-rate variability measured using RMSSD'),
    ('hrv_sdnn', 'ms', 'interval', 'Heart-rate variability measured using SDNN'),
    ('respiratory_rate', 'breaths/min', 'interval', 'Respiratory rate'),
    ('skin_temperature_deviation', 'Cel', 'daily_summary', 'Deviation from provider/user temperature baseline'),
    ('sleep_duration', 's', 'interval', 'Sleep episode duration'),
    ('sleep_stage_duration', 's', 'interval', 'Duration in a sleep stage'),
    ('sleep_efficiency', 'ratio', 'daily_summary', 'Sleep efficiency as a ratio from 0 to 1'),
    ('workout_load', 'score', 'interval', 'Provider-specific exercise strain/load; not cross-provider comparable'),
    ('spo2', '%', 'interval', 'Blood oxygen saturation percentage'),
    ('readiness_score', 'score_0_100', 'score', 'Provider or Baseline readiness score; algorithm/source required')
ON CONFLICT (metric_key) DO NOTHING;

CREATE TABLE metric_observations (
    id UUID NOT NULL,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    provider_connection_id UUID,
    provider_record_id UUID,
    external_observation_id TEXT,
    metric_key TEXT NOT NULL REFERENCES metric_definitions(metric_key),
    observed_at TIMESTAMPTZ NOT NULL,
    interval_end TIMESTAMPTZ,
    local_date DATE NOT NULL,
    value NUMERIC(20, 8) NOT NULL,
    unit TEXT NOT NULL,
    measurement_method TEXT,
    quality_status TEXT NOT NULL DEFAULT 'unassessed' CHECK (quality_status IN (
        'unassessed', 'valid', 'questionable', 'invalid', 'vendor_flagged'
    )),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (id),
    CONSTRAINT metric_observations_connection_user_fk
        FOREIGN KEY (provider_connection_id, user_id)
        REFERENCES provider_connections(id, user_id) ON DELETE CASCADE,
    CONSTRAINT metric_observations_record_user_fk
        FOREIGN KEY (provider_record_id, user_id)
        REFERENCES provider_records(id, user_id) ON DELETE CASCADE,
    CONSTRAINT metric_observations_interval_ck
        CHECK (interval_end IS NULL OR observed_at <= interval_end),
    CONSTRAINT metric_observations_source_dedupe_uq
        UNIQUE NULLS DISTINCT (provider_record_id, metric_key, observed_at, interval_end, unit)
);

CREATE INDEX metric_observations_user_key_time_idx
    ON metric_observations (user_id, metric_key, observed_at DESC);

CREATE INDEX metric_observations_provider_connection_time_idx
    ON metric_observations (provider_connection_id, observed_at DESC)
    WHERE provider_connection_id IS NOT NULL;

CREATE UNIQUE INDEX metric_observations_external_id_uq
    ON metric_observations (provider_connection_id, external_observation_id)
    WHERE external_observation_id IS NOT NULL;

CREATE TABLE daily_metric_aggregates (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    local_date DATE NOT NULL,
    metric_key TEXT NOT NULL REFERENCES metric_definitions(metric_key),
    value NUMERIC(20, 8),
    unit TEXT NOT NULL,
    aggregation_method TEXT NOT NULL,
    selected_source_policy TEXT NOT NULL,
    coverage_ratio NUMERIC(5, 4) CHECK (coverage_ratio IS NULL OR coverage_ratio BETWEEN 0 AND 1),
    input_fingerprint TEXT NOT NULL,
    aggregation_version SMALLINT NOT NULL CHECK (aggregation_version > 0),
    computed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT daily_metric_aggregates_user_day_metric_version_uq
        UNIQUE (user_id, local_date, metric_key, aggregation_version)
);

CREATE INDEX daily_metric_aggregates_user_metric_date_idx
    ON daily_metric_aggregates (user_id, metric_key, local_date DESC);

CREATE TABLE recovery_scores (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    local_date DATE NOT NULL,
    score_kind TEXT NOT NULL CHECK (score_kind IN ('baseline', 'provider')),
    provider_connection_id UUID REFERENCES provider_connections(id) ON DELETE SET NULL,
    algorithm_version TEXT NOT NULL,
    score NUMERIC(5, 2) CHECK (score IS NULL OR score BETWEEN 0 AND 100),
    confidence NUMERIC(5, 4) CHECK (confidence IS NULL OR confidence BETWEEN 0 AND 1),
    status TEXT NOT NULL CHECK (status IN ('scored', 'insufficient_data', 'provisional', 'invalidated')),
    component_scores JSONB NOT NULL DEFAULT '{}'::JSONB,
    input_fingerprint TEXT NOT NULL,
    input_window_start DATE,
    input_window_end DATE NOT NULL,
    calculated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT recovery_scores_source_ck CHECK (
        (score_kind = 'baseline' AND provider_connection_id IS NULL)
        OR (score_kind = 'provider' AND provider_connection_id IS NOT NULL)
    ),
    CONSTRAINT recovery_scores_connection_user_fk
        FOREIGN KEY (provider_connection_id, user_id)
        REFERENCES provider_connections(id, user_id) ON DELETE CASCADE
);

CREATE UNIQUE INDEX recovery_scores_baseline_version_uq
    ON recovery_scores (user_id, local_date, algorithm_version)
    WHERE score_kind = 'baseline';

CREATE UNIQUE INDEX recovery_scores_provider_version_uq
    ON recovery_scores (user_id, local_date, provider_connection_id, algorithm_version)
    WHERE score_kind = 'provider';

CREATE INDEX recovery_scores_user_date_idx
    ON recovery_scores (user_id, local_date DESC, score_kind);

COMMIT;