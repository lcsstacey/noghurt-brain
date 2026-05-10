-- ============================================================================
-- Phase 3 — game loop schema and full advance_phase state machine.
--
-- Adds:
--   - answers table (one row per (player, question)) with RLS that hides
--     other players' answers until reveal
--   - wagers table (one row per (player, room)) with RLS hiding peers'
--     wagers until final_reveal
--   - Realtime publication for both
--   - Full advance_phase state machine replacing the Phase 2 stub
--   - reset_room RPC for the "RUN IT BACK" button
--   - apply_grading RPC: host-only batched update of answers + players in
--     a single transaction (called before advance_phase on question →
--     reveal and final_question → final_reveal)
-- ============================================================================

-- ─────────────────────────────────────────────────────────────────────────────
-- ANSWERS
-- ─────────────────────────────────────────────────────────────────────────────
create table answers (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references rooms(id) on delete cascade,
  player_id uuid not null references players(id) on delete cascade,
  question_id text not null,
  answer jsonb not null,
  locked_at timestamptz not null default now(),
  is_correct boolean,
  points_awarded int,
  unique (player_id, question_id)
);
create index answers_room_idx on answers (room_id);
alter table answers enable row level security;

-- A SECURITY DEFINER view of "is the room past the question phase?" used by
-- the answers SELECT policy. Bypasses RLS during the lookup.
create or replace function public.room_past_question(p_room_id uuid)
returns boolean
language sql security definer stable set search_path = public
as $$
  select exists (
    select 1 from rooms
    where id = p_room_id
      and phase in ('reveal','mainframe_intro','wager','final_question','final_reveal','game_over')
  );
$$;

grant execute on function public.room_past_question(uuid) to anon, authenticated;

-- A SECURITY DEFINER lookup: which player rows belong to me in a room?
create or replace function public.my_player_id(p_room_id uuid)
returns uuid
language sql security definer stable set search_path = public
as $$
  select id from players where room_id = p_room_id and user_id = auth.uid() limit 1;
$$;

grant execute on function public.my_player_id(uuid) to anon, authenticated;

-- own answers always visible; peers' answers visible from reveal onward
create policy "answers_select_visibility" on answers for select using (
  player_id = public.my_player_id(room_id)
  or public.room_past_question(room_id)
  or public.is_room_host(room_id)
);

-- self-insert: caller's player_id only
create policy "answers_insert_self" on answers for insert with check (
  player_id = public.my_player_id(room_id)
);

-- update is performed by the host (during grading) via apply_grading RPC
-- which uses SECURITY DEFINER, so no separate policy needed for app code.

-- ─────────────────────────────────────────────────────────────────────────────
-- WAGERS
-- ─────────────────────────────────────────────────────────────────────────────
create table wagers (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references rooms(id) on delete cascade,
  player_id uuid not null references players(id) on delete cascade,
  pct int not null check (pct between 0 and 100),
  amount int not null check (amount >= 0),
  locked_at timestamptz not null default now(),
  unique (player_id, room_id)
);
create index wagers_room_idx on wagers (room_id);
alter table wagers enable row level security;

create or replace function public.room_at_or_past_final_reveal(p_room_id uuid)
returns boolean
language sql security definer stable set search_path = public
as $$
  select exists (
    select 1 from rooms
    where id = p_room_id and phase in ('final_reveal','game_over')
  );
$$;

grant execute on function public.room_at_or_past_final_reveal(uuid) to anon, authenticated;

create policy "wagers_select_visibility" on wagers for select using (
  player_id = public.my_player_id(room_id)
  or public.room_at_or_past_final_reveal(room_id)
  or public.is_room_host(room_id)
);

create policy "wagers_insert_self" on wagers for insert with check (
  player_id = public.my_player_id(room_id)
);

-- ─────────────────────────────────────────────────────────────────────────────
-- Realtime publication
-- ─────────────────────────────────────────────────────────────────────────────
alter publication supabase_realtime add table answers;
alter publication supabase_realtime add table wagers;

-- ─────────────────────────────────────────────────────────────────────────────
-- Full advance_phase state machine (replaces Phase 2 stub)
-- ─────────────────────────────────────────────────────────────────────────────
create or replace function advance_phase(p_room_id uuid)
returns rooms
language plpgsql security definer set search_path = public
as $$
declare v_room rooms;
begin
  select * into v_room from rooms where id = p_room_id and host_id = auth.uid();
  if v_room is null then raise exception 'not authorized'; end if;

  case v_room.phase
    when 'lobby' then
      update rooms set phase = 'intro' where id = p_room_id returning * into v_room;
    when 'intro' then
      update rooms set phase = 'question', question_started_at = now()
        where id = p_room_id returning * into v_room;
    when 'question' then
      update rooms set phase = 'reveal' where id = p_room_id returning * into v_room;
    when 'reveal' then
      if v_room.current_question_idx + 1 >= jsonb_array_length(v_room.questions) then
        update rooms set phase = 'mainframe_intro'
          where id = p_room_id returning * into v_room;
      else
        update rooms set
          phase = 'intro',
          current_question_idx = current_question_idx + 1
          where id = p_room_id returning * into v_room;
      end if;
    when 'mainframe_intro' then
      update rooms set phase = 'wager', question_started_at = now()
        where id = p_room_id returning * into v_room;
    when 'wager' then
      update rooms set phase = 'final_question', question_started_at = now()
        where id = p_room_id returning * into v_room;
    when 'final_question' then
      update rooms set phase = 'final_reveal'
        where id = p_room_id returning * into v_room;
    when 'final_reveal' then
      update rooms set phase = 'game_over' where id = p_room_id returning * into v_room;
    else null;
  end case;

  return v_room;
end;
$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- apply_grading: host-only batched update of answers + players
--
-- Input: array of objects { player_id, is_correct, points_awarded,
--                          new_score, new_streak, question_id }
-- ─────────────────────────────────────────────────────────────────────────────
create or replace function apply_grading(p_room_id uuid, p_grading jsonb)
returns void
language plpgsql security definer set search_path = public
as $$
declare g jsonb;
begin
  if not exists (select 1 from rooms where id = p_room_id and host_id = auth.uid()) then
    raise exception 'not authorized';
  end if;

  for g in select * from jsonb_array_elements(p_grading)
  loop
    update answers set
      is_correct = (g->>'is_correct')::boolean,
      points_awarded = (g->>'points_awarded')::int
    where room_id = p_room_id
      and player_id = (g->>'player_id')::uuid
      and question_id = g->>'question_id';

    update players set
      score = (g->>'new_score')::int,
      streak = (g->>'new_streak')::int
    where id = (g->>'player_id')::uuid
      and room_id = p_room_id;
  end loop;
end;
$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- reset_room: host-only "RUN IT BACK" — wipes answers/wagers, zeros scores,
-- returns to lobby with the same players
-- ─────────────────────────────────────────────────────────────────────────────
create or replace function reset_room(p_room_id uuid)
returns rooms
language plpgsql security definer set search_path = public
as $$
declare v_room rooms;
begin
  if not exists (select 1 from rooms where id = p_room_id and host_id = auth.uid()) then
    raise exception 'not authorized';
  end if;

  delete from answers where room_id = p_room_id;
  delete from wagers where room_id = p_room_id;
  update players set score = 0, streak = 0 where room_id = p_room_id;
  update rooms set
    phase = 'lobby',
    current_question_idx = 0,
    questions = '[]'::jsonb,
    mainframe_question_id = null,
    question_started_at = null
    where id = p_room_id returning * into v_room;
  return v_room;
end;
$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- list_room_answers: SECURITY DEFINER lookup so the host can fetch all
-- answers for the current question regardless of the SELECT policy
-- ─────────────────────────────────────────────────────────────────────────────
create or replace function public.list_room_answers(p_room_id uuid, p_question_id text)
returns setof answers
language sql security definer stable set search_path = public
as $$
  select * from answers
  where room_id = p_room_id and question_id = p_question_id;
$$;

grant execute on function public.list_room_answers(uuid, text) to authenticated;

-- list_room_wagers: SECURITY DEFINER lookup so the host can fetch all
-- wagers when grading the mainframe round
create or replace function public.list_room_wagers(p_room_id uuid)
returns setof wagers
language sql security definer stable set search_path = public
as $$
  select * from wagers where room_id = p_room_id;
$$;

grant execute on function public.list_room_wagers(uuid) to authenticated;
