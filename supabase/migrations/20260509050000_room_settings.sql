-- ============================================================================
-- Room settings (host-controlled): which categories to draw from, difficulty,
-- and how many rounds. Defaults to "all categories, normal, 5 rounds" — what
-- v1 used implicitly.
-- ============================================================================

alter table rooms add column settings jsonb not null default
  '{"categories":["science","internet","geography","retro"],"difficulty":"normal","rounds_count":5}'::jsonb;

-- (no RLS changes needed — settings inherit the existing rooms_select_member /
-- rooms_update_host policies. Only the host can write; all members can read.)
