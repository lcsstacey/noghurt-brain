'use client';

import { useEffect, useRef, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Database } from '@/lib/database.types';

export type Room = Database['public']['Tables']['rooms']['Row'];
export type PlayerRow = Database['public']['Tables']['players']['Row'];

export type RoomChannelStatus = 'loading' | 'subscribed' | 'error' | 'closed';

export type UseRoomChannelResult = {
  room: Room | null;
  players: PlayerRow[];
  status: RoomChannelStatus;
  error: string | null;
};

/**
 * Subscribes to a room by code. Returns the live room row and its players,
 * refreshed on any postgres change. Handles reconnect via Supabase Realtime.
 *
 * Both LobbyHost and LobbyPhone consume this; the difference is only which
 * surface they render. RLS hides answers/wagers from peers pre-reveal.
 */
export function useRoomChannel(code: string): UseRoomChannelResult {
  const [room, setRoom] = useState<Room | null>(null);
  const [players, setPlayers] = useState<PlayerRow[]>([]);
  const [status, setStatus] = useState<RoomChannelStatus>('loading');
  const [error, setError] = useState<string | null>(null);
  const supabaseRef = useRef<ReturnType<typeof createClient> | null>(null);

  useEffect(() => {
    if (!supabaseRef.current) supabaseRef.current = createClient();
    const supabase = supabaseRef.current;
    let cancelled = false;

    async function fetchRoom() {
      const { data, error } = await supabase
        .from('rooms')
        .select('*')
        .eq('code', code.toUpperCase())
        .single();
      if (cancelled) return null;
      if (error) {
        setError(error.message);
        setStatus('error');
        return null;
      }
      setRoom(data);
      return data;
    }

    async function fetchPlayers(roomId: string) {
      const { data, error } = await supabase
        .from('players')
        .select('*')
        .eq('room_id', roomId)
        .order('joined_at', { ascending: true });
      if (cancelled) return;
      if (error) {
        setError(error.message);
        return;
      }
      setPlayers(data ?? []);
    }

    let channel: ReturnType<typeof supabase.channel> | null = null;

    (async () => {
      const r = await fetchRoom();
      if (!r) return;
      await fetchPlayers(r.id);

      channel = supabase
        .channel(`room:${r.id}`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'rooms', filter: `id=eq.${r.id}` },
          () => {
            void fetchRoom();
          },
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'players', filter: `room_id=eq.${r.id}` },
          () => {
            void fetchPlayers(r.id);
          },
        )
        .subscribe((s) => {
          if (s === 'SUBSCRIBED') setStatus('subscribed');
          else if (s === 'CHANNEL_ERROR' || s === 'TIMED_OUT') setStatus('error');
          else if (s === 'CLOSED') setStatus('closed');
        });
    })();

    return () => {
      cancelled = true;
      if (channel) supabase.removeChannel(channel);
    };
  }, [code]);

  return { room, players, status, error };
}
