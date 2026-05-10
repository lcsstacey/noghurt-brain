'use server';

import { createClient } from '@/lib/supabase/server';
import { getUser } from '@/lib/auth/getUser';
import { pickRoundQuestions } from '@/data/questions';
import { DEFAULT_ROOM_SETTINGS, type RoomSettings } from '@/lib/types';

export type StartGameResult = { ok: true } | { ok: false; error: string };

/**
 * Host clicks INITIATE BROADCAST. Reads the host-chosen settings from
 * rooms.settings, picks questions deterministically from the room id
 * filtered by category, writes them to rooms.questions /
 * rooms.mainframe_question_id, and advances the phase to `intro`.
 */
export async function startGame(code: string): Promise<StartGameResult> {
  try {
    const user = await getUser();
    if (!user) return { ok: false, error: 'not signed in' };

    const supabase = await createClient();

    const { data: room } = await supabase
      .from('rooms')
      .select('id, host_id, phase, settings')
      .eq('code', code.toUpperCase())
      .single();

    if (!room) return { ok: false, error: 'room not found' };
    if (room.host_id !== user.id) return { ok: false, error: 'only the host can start the game' };
    if (room.phase !== 'lobby') return { ok: false, error: 'game already started' };

    const settings = (room.settings as RoomSettings | null) ?? DEFAULT_ROOM_SETTINGS;
    if (!settings.categories || settings.categories.length === 0) {
      return { ok: false, error: 'pick at least 1 category before starting' };
    }

    const { count } = await supabase
      .from('players')
      .select('id', { count: 'exact', head: true })
      .eq('room_id', room.id);

    if ((count ?? 0) < 2) return { ok: false, error: 'need at least 2 players to start' };

    // Deterministic pick — same room id always picks the same set
    // (given the same settings).
    const { questions, mainframe } = pickRoundQuestions(room.id, {
      categories: settings.categories,
      rounds_count: settings.rounds_count,
    });

    const { error: updateErr } = await supabase
      .from('rooms')
      .update({
        questions: questions.map((q) => q.id),
        mainframe_question_id: mainframe.id,
      })
      .eq('id', room.id);

    if (updateErr) return { ok: false, error: updateErr.message };

    const { error: rpcErr } = await supabase.rpc('advance_phase', { p_room_id: room.id });
    if (rpcErr) return { ok: false, error: rpcErr.message };

    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'unknown error' };
  }
}
