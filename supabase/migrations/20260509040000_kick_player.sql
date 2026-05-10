-- ============================================================================
-- Host can kick a player from the lobby.
--
-- Lobby-only for v1 — mid-game kicks could leave the question count off.
-- Easy to relax later.
-- ============================================================================

create or replace function kick_player(p_room_id uuid, p_player_id uuid)
returns void
language plpgsql security definer set search_path = public
as $$
begin
  if not exists (select 1 from rooms where id = p_room_id and host_id = auth.uid()) then
    raise exception 'host only';
  end if;
  if not exists (select 1 from rooms where id = p_room_id and phase = 'lobby') then
    raise exception 'can only kick during lobby';
  end if;
  -- Don't let the host kick themselves (would leave room with no host).
  if exists (
    select 1 from players where id = p_player_id and user_id = auth.uid()
  ) then
    raise exception 'cannot kick yourself';
  end if;
  delete from players where id = p_player_id and room_id = p_room_id;
end;
$$;

grant execute on function kick_player(uuid, uuid) to authenticated;
