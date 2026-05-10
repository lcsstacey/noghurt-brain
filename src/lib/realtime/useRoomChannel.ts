'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
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
  /** Force-refresh room + players immediately (skip the poll wait). */
  refetch: () => void;
};

const POLL_MS = 600;

/**
 * Subscribes to a room by code. Returns the live room row and its players,
 * refreshed on any postgres change. Handles reconnect via Supabase Realtime.
 *
 * Both LobbyHost and LobbyPhone consume this; the difference is only which
 * surface they render. RLS hides answers/wagers from peers pre-reveal.
 *
 * Realtime postgres_changes is the primary signal. Polling at POLL_MS is
 * a safety net for cases where realtime drops events (RLS race, JWT
 * timing, mobile-tab-suspended quirks, connection limit). The interval
 * is short enough that joins/setting changes feel near-instant even if
 * realtime is silent. Both RPCs are tiny SECURITY DEFINER lookups so
 * the load stays cheap.
 */
export function useRoomChannel(code: string): UseRoomChannelResult {
  const [room, setRoom] = useState<Room | null>(null);
  const [players, setPlayers] = useState<PlayerRow[]>([]);
  const [status, setStatus] = useState<RoomChannelStatus>('loading');
  const [error, setError] = useState<string | null>(null);
  const supabaseRef = useRef<ReturnType<typeof createClient> | null>(null);
  const refetchRef = useRef<() => void>(() => {});

  useEffect(() => {
    if (!supabaseRef.current) supabaseRef.current = createClient();
    const supabase = supabaseRef.current;
    let cancelled = false;
    let currentRoomId: string | null = null;

    async function fetchRoom() {
      const { data, error } = await supabase.rpc('find_room_by_code', {
        p_code: code.toUpperCase(),
      });
      if (cancelled) return null;
      if (error) {
        setError(error.message);
        setStatus('error');
        return null;
      }
      const r = data?.[0] ?? null;
      setRoom(r);
      return r;
    }

    async function fetchPlayers(roomId: string) {
      const { data, error } = await supabase.rpc('list_room_players', {
        p_room_id: roomId,
      });
      if (cancelled) return;
      if (error) {
        setError(error.message);
        return;
      }
      setPlayers(data ?? []);
    }

    refetchRef.current = () => {
      void fetchRoom();
      if (currentRoomId) void fetchPlayers(currentRoomId);
    };

    let channel: ReturnType<typeof supabase.channel> | null = null;
    let pollHandle: ReturnType<typeof setInterval> | null = null;

    (async () => {
      const r = await fetchRoom();
      if (!r) return;
      currentRoomId = r.id;
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

      pollHandle = setInterval(() => {
        if (cancelled) return;
        void fetchRoom();
        void fetchPlayers(r.id);
      }, POLL_MS);
    })();

    return () => {
      cancelled = true;
      if (channel) supabase.removeChannel(channel);
      if (pollHandle) clearInterval(pollHandle);
    };
  }, [code]);

  const refetch = useCallback(() => refetchRef.current(), []);

  return { room, players, status, error, refetch };
}
