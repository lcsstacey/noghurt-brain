'use server';

import { createClient } from '@/lib/supabase/server';
import { getUser } from '@/lib/auth/getUser';

export type SubmitWagerResult = { ok: true } | { ok: false; error: string };

/**
 * Player locks in their mainframe wager. Amount is constrained 0 ≤ amount
 * ≤ player.score (server enforces). Pct is computed from amount/max(score,100).
 */
export async function submitWager(code: string, amount: number): Promise<SubmitWagerResult> {
  try {
    if (!Number.isFinite(amount) || amount < 0) {
      return { ok: false, error: 'invalid wager amount' };
    }

    const user = await getUser();
    if (!user) return { ok: false, error: 'not signed in' };

    const supabase = await createClient();

    const { data: rooms } = await supabase.rpc('find_room_by_code', {
      p_code: code.toUpperCase(),
    });
    const room = rooms?.[0];
    if (!room) return { ok: false, error: 'room not found' };
    if (room.phase !== 'wager') return { ok: false, error: 'not accepting wagers' };

    const { data: player } = await supabase
      .from('players')
      .select('id, score')
      .eq('room_id', room.id)
      .eq('user_id', user.id)
      .maybeSingle();
    if (!player) return { ok: false, error: 'you are not a player in this room' };

    const cappedAmount = Math.min(Math.floor(amount), player.score);
    const denom = Math.max(player.score, 100);
    const pct = Math.min(100, Math.max(0, Math.floor((cappedAmount / denom) * 100)));

    const { error } = await supabase.from('wagers').insert({
      room_id: room.id,
      player_id: player.id,
      amount: cappedAmount,
      pct,
    });

    if (error) {
      if (error.code === '23505') return { ok: false, error: 'already wagered' };
      return { ok: false, error: error.message };
    }

    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'unknown error' };
  }
}
