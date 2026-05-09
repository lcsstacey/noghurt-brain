-- ============================================================================
-- Noghurt Brain — Phase 2 init migration
--
-- Tables:    rooms, players
-- RLS:       enabled with policies per docs/ARCHITECTURE.md § 4
-- Realtime:  rooms + players added to supabase_realtime publication
-- RPCs:      advance_phase (Phase 2 stub: only handles lobby → intro)
--
-- Phase 3 will add: answers, wagers, grade_question, grade_mainframe,
-- and the full advance_phase state machine.
-- ============================================================================

-- ─────────────────────────────────────────────────────────────────────────────
-- ROOMS
-- ─────────────────────────────────────────────────────────────────────────────
create table rooms (
  id uuid primary key default gen_random_uuid(),
  code text unique not null check (char_length(code) = 4),
  host_id uuid not null references auth.users(id) on delete cascade,
  phase text not null default 'lobby'
    check (phase in (
      'lobby', 'intro', 'question', 'reveal',
      'mainframe_intro', 'wager', 'final_question', 'final_reveal',
      'game_over'
    )),
  current_question_idx int not null default 0,
  questions jsonb not null default '[]'::jsonb,
  mainframe_question_id text,
  question_started_at timestamptz,
  created_at timestamptz not null default now()
);
create index rooms_code_idx on rooms (code);

-- ─────────────────────────────────────────────────────────────────────────────
-- PLAYERS
-- ─────────────────────────────────────────────────────────────────────────────
create table players (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references rooms(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  name text not null check (char_length(name) between 1 and 12),
  color text not null check (color in ('pink','cyan','green','yellow','red','purple')),
  is_host boolean not null default false,
  score int not null default 0,
  streak int not null default 0,
  joined_at timestamptz not null default now(),
  unique (room_id, user_id),
  unique (room_id, color)
);
create index players_room_idx on players (room_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- RLS — rooms
-- ─────────────────────────────────────────────────────────────────────────────
alter table rooms enable row level security;

create policy "rooms_select_member" on rooms for select using (
  auth.uid() = host_id
  or auth.uid() in (select user_id from players where players.room_id = rooms.id)
);

create policy "rooms_update_host" on rooms for update using (auth.uid() = host_id);

create policy "rooms_insert_authed" on rooms for insert with check (auth.uid() = host_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- RLS — players
-- ─────────────────────────────────────────────────────────────────────────────
alter table players enable row level security;

create policy "players_select_room_member" on players for select using (
  room_id in (select id from rooms where host_id = auth.uid())
  or auth.uid() in (select p2.user_id from players p2 where p2.room_id = players.room_id)
);

create policy "players_insert_self" on players for insert with check (auth.uid() = user_id);

create policy "players_update_self" on players for update using (auth.uid() = user_id);

-- A player can delete their own row (leave room).
create policy "players_delete_self" on players for delete using (auth.uid() = user_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- Realtime — broadcast changes on rooms + players to subscribed clients
-- ─────────────────────────────────────────────────────────────────────────────
alter publication supabase_realtime add table rooms;
alter publication supabase_realtime add table players;

-- ─────────────────────────────────────────────────────────────────────────────
-- advance_phase RPC (Phase 2 stub)
--
-- Only handles lobby → intro. Phase 3 fills in the remaining transitions
-- per docs/ARCHITECTURE.md § 7.
-- ─────────────────────────────────────────────────────────────────────────────
create or replace function advance_phase(p_room_id uuid)
returns rooms
language plpgsql
security definer
set search_path = public
as $$
declare
  v_room rooms;
begin
  select * into v_room from rooms where id = p_room_id and host_id = auth.uid();
  if v_room is null then
    raise exception 'not authorized';
  end if;

  case v_room.phase
    when 'lobby' then
      update rooms set phase = 'intro' where id = p_room_id returning * into v_room;
    else
      raise exception 'phase % not implemented in Phase 2', v_room.phase;
  end case;

  return v_room;
end;
$$;
