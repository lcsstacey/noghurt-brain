-- ============================================================================
-- Fix RLS infinite recursion on rooms ↔ players policies.
--
-- The original (verbatim from docs/ARCHITECTURE.md § 4) had cross-table
-- subqueries — rooms policy queried players (which fired players RLS),
-- which queried rooms (firing rooms RLS), forever.
--
-- Canonical Supabase fix: a SECURITY DEFINER helper that runs as the
-- definer (postgres role) and therefore bypasses RLS while it computes
-- membership.
-- ============================================================================

-- Helper used by both rooms_select_* and players_select_* policies.
-- SECURITY DEFINER + STABLE so the planner can cache results.
create or replace function public.is_room_member(p_room_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1
    from players
    where room_id = p_room_id
      and user_id = auth.uid()
  );
$$;

-- Room hosts always have access too — small dedicated check, also bypasses RLS.
create or replace function public.is_room_host(p_room_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from rooms where id = p_room_id and host_id = auth.uid()
  );
$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- Drop the recursive policies and replace with non-recursive equivalents.
-- ─────────────────────────────────────────────────────────────────────────────

drop policy if exists "rooms_select_member" on rooms;
drop policy if exists "players_select_room_member" on players;

create policy "rooms_select_member" on rooms for select using (
  auth.uid() = host_id
  or public.is_room_member(id)
);

create policy "players_select_room_member" on players for select using (
  auth.uid() = user_id
  or public.is_room_host(room_id)
  or public.is_room_member(room_id)
);
