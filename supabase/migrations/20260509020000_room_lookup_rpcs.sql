-- ============================================================================
-- Room lookup RPCs for the join flow.
--
-- Problem: RLS on `rooms` only allows host + members to SELECT, which 404s
-- friends who visit /play/[code] before they've joined. Same for the color
-- picker — non-members can't read the players list to know what's taken.
--
-- Fix: two SECURITY DEFINER functions that bypass RLS for the by-code
-- lookup. They take the code (or room_id) as required input, so there's
-- no enumeration risk — without the code you can't list rooms.
-- ============================================================================

-- Look up a room by its 4-char code. Returns the full row shape so
-- TypeScript callers can use the existing Database['public']['Tables']['rooms']
-- type without a separate generic.
create or replace function public.find_room_by_code(p_code text)
returns setof rooms
language sql
security definer
stable
set search_path = public
as $$
  select *
  from rooms
  where code = upper(p_code)
  limit 1;
$$;

grant execute on function public.find_room_by_code(text) to anon, authenticated;

-- List players in a room. Used by the JoinForm color picker (pre-join, when
-- the caller isn't a member yet) and by useRoomChannel as the source of
-- truth for the lobby grid. Realtime postgres_changes still respect RLS, so
-- non-member callers won't receive live updates — fine for the JoinForm
-- because the user becomes a member on submit anyway.
create or replace function public.list_room_players(p_room_id uuid)
returns setof players
language sql
security definer
stable
set search_path = public
as $$
  select *
  from players
  where room_id = p_room_id
  order by joined_at;
$$;

grant execute on function public.list_room_players(uuid) to anon, authenticated;
