BEGIN;

INSERT INTO users (id, email, display_name)
VALUES (
    '00000000-0000-4000-8000-000000000001',
    'demo@baseline.example',
    'Baseline Demo'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO daily_metrics (
    id, user_id, metric_date, steps, move_calories, rest_minutes,
    breathwork_minutes, readiness_score, source
)
VALUES
    ('00000000-0000-0000-0001-000000000029', '00000000-0000-4000-8000-000000000001', '2026-07-29', 10245, 560, 492, 6, 65, 'demo'),
    ('00000000-0000-0000-0001-000000000805', '00000000-0000-4000-8000-000000000001', '2026-08-05', 5601, 398, 674, 12, 86, 'demo'),
    ('00000000-0000-0000-0001-000000000825', '00000000-0000-4000-8000-000000000001', '2026-08-25', 8240, 465, 492, 10, 78, 'demo')
ON CONFLICT (user_id, metric_date) DO NOTHING;

DELETE FROM metric_contributions contribution
USING daily_metrics metric
WHERE contribution.daily_metric_id = metric.id
    AND metric.user_id = '00000000-0000-4000-8000-000000000001'
  AND metric.source = 'demo';

INSERT INTO metric_contributions (id, daily_metric_id, metric_type, name, duration_minutes, quantity)
SELECT seed.id, metric.id, seed.metric_type, seed.name, seed.duration_minutes, seed.quantity
FROM (
    VALUES
        ('00000000-0000-0000-0002-000000000001'::UUID, '2026-07-29'::DATE, 'move_calories', 'Trail hike', 70, 420),
        ('00000000-0000-0000-0002-000000000002'::UUID, '2026-07-29'::DATE, 'move_calories', 'Interval run', 24, 100),
        ('00000000-0000-0000-0002-000000000003'::UUID, '2026-07-29'::DATE, 'move_calories', 'Recovery walk', 16, 40),
        ('00000000-0000-0000-0002-000000000004'::UUID, '2026-07-29'::DATE, 'steps', 'Trail hike', 70, 7245),
        ('00000000-0000-0000-0002-000000000005'::UUID, '2026-07-29'::DATE, 'steps', 'Daily walking', 36, 3000),
        ('00000000-0000-0000-0002-000000000006'::UUID, '2026-07-29'::DATE, 'rest', 'Overnight sleep', 492, 492),
        ('00000000-0000-0000-0002-000000000007'::UUID, '2026-07-29'::DATE, 'breathwork', 'Guided breathing', 6, 6),
        ('00000000-0000-0000-0002-000000000008'::UUID, '2026-08-05'::DATE, 'move_calories', 'Indoor cycling', 42, 246),
        ('00000000-0000-0000-0002-000000000009'::UUID, '2026-08-05'::DATE, 'move_calories', 'Brisk walk', 24, 92),
        ('00000000-0000-0000-0002-000000000010'::UUID, '2026-08-05'::DATE, 'move_calories', 'Core training', 20, 60),
        ('00000000-0000-0000-0002-000000000011'::UUID, '2026-08-05'::DATE, 'steps', 'Brisk walk', 24, 3100),
        ('00000000-0000-0000-0002-000000000012'::UUID, '2026-08-05'::DATE, 'steps', 'Daily walking', 38, 2501),
        ('00000000-0000-0000-0002-000000000013'::UUID, '2026-08-05'::DATE, 'rest', 'Overnight sleep', 614, 614),
        ('00000000-0000-0000-0002-000000000014'::UUID, '2026-08-05'::DATE, 'rest', 'Quiet rest', 60, 60),
        ('00000000-0000-0000-0002-000000000015'::UUID, '2026-08-05'::DATE, 'breathwork', 'Guided breathing', 8, 8),
        ('00000000-0000-0000-0002-000000000016'::UUID, '2026-08-05'::DATE, 'breathwork', 'Box breathing', 4, 4),
        ('00000000-0000-0000-0002-000000000017'::UUID, '2026-08-25'::DATE, 'move_calories', 'Outdoor run', 28, 315),
        ('00000000-0000-0000-0002-000000000018'::UUID, '2026-08-25'::DATE, 'move_calories', 'Strength training', 35, 100),
        ('00000000-0000-0000-0002-000000000019'::UUID, '2026-08-25'::DATE, 'move_calories', 'Evening walk', 15, 50),
        ('00000000-0000-0000-0002-000000000020'::UUID, '2026-08-25'::DATE, 'steps', 'Outdoor run', 28, 3240),
        ('00000000-0000-0000-0002-000000000021'::UUID, '2026-08-25'::DATE, 'steps', 'Walks', 49, 5000),
        ('00000000-0000-0000-0002-000000000022'::UUID, '2026-08-25'::DATE, 'rest', 'Overnight sleep', 452, 452),
        ('00000000-0000-0000-0002-000000000023'::UUID, '2026-08-25'::DATE, 'rest', 'Afternoon rest', 40, 40),
        ('00000000-0000-0000-0002-000000000024'::UUID, '2026-08-25'::DATE, 'breathwork', 'Box breathing', 6, 6),
        ('00000000-0000-0000-0002-000000000025'::UUID, '2026-08-25'::DATE, 'breathwork', 'Guided breathing', 4, 4)
) AS seed(id, metric_date, metric_type, name, duration_minutes, quantity)
JOIN daily_metrics metric
    ON metric.user_id = '00000000-0000-4000-8000-000000000001'
 AND metric.metric_date = seed.metric_date
ON CONFLICT (id) DO NOTHING;

COMMIT;