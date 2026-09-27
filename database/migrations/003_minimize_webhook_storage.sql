BEGIN;

ALTER TABLE provider_webhook_events
    ADD COLUMN provider_user_id TEXT,
    ADD COLUMN provider_event_at TIMESTAMPTZ;

UPDATE provider_webhook_events
   SET provider_user_id = COALESCE(provider_connection_id::TEXT, 'unresolved')
 WHERE provider_user_id IS NULL;

ALTER TABLE provider_webhook_events
    ALTER COLUMN provider_user_id SET NOT NULL,
    DROP COLUMN payload;

DROP INDEX provider_webhook_events_provider_event_uq;

CREATE UNIQUE INDEX provider_webhook_events_provider_user_event_uq
    ON provider_webhook_events (provider, provider_user_id, provider_event_id)
    WHERE provider_event_id IS NOT NULL;

CREATE INDEX provider_webhook_events_connection_received_idx
    ON provider_webhook_events (provider_connection_id, received_at DESC)
    WHERE provider_connection_id IS NOT NULL;

COMMIT;