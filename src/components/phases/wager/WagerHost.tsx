'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { C } from '@/styles/palette';
import { PlayerAvatar } from '@/components/shared/PlayerAvatar';
import { TimerBar } from '@/components/shared/TimerBar';
import { CATEGORIES } from '@/lib/game/categories';
import { QUESTIONS_BY_ID } from '@/data/questions';
import { useRoomChannel } from '@/lib/realtime/useRoomChannel';
import { useQuestionTimer, PHASE_DURATION_SEC, PHASE_ADVANCE_MS } from '@/lib/game/useQuestionTimer';
import { hostAdvance } from '@/lib/actions/hostAdvance';
import { toPlayer } from '@/lib/game/colorIcon';
import { createClient } from '@/lib/supabase/client';
import type { Database } from '@/lib/database.types';

type WagerRow = Database['public']['Tables']['wagers']['Row'];

type Props = {
  code: string;
  isHost: boolean;
  mainframeQuestionId: string;
  startedAt: string | null;
};

export function WagerHost({ code, isHost, mainframeQuestionId, startedAt }: Props) {
  const router = useRouter();
  const advanced = useRef(false);
  const { players } = useRoomChannel(code);
  const totalSec = PHASE_DURATION_SEC.wager;
  const { secondsLeft, isExpired } = useQuestionTimer(startedAt, totalSec);
  const [wagers, setWagers] = useState<WagerRow[]>([]);
  const [supabase] = useState(() => createClient());

  // Live wager polling
  useEffect(() => {
    if (!startedAt) return;
    const sb = supabase;
    let cancelled = false;
    let channel: ReturnType<typeof sb.channel> | null = null;
    async function fetchWagers(roomId: string) {
      const { data } = await sb.rpc('list_room_wagers', { p_room_id: roomId });
      if (cancelled) return;
      setWagers(data ?? []);
    }
    (async () => {
      const { data: rooms } = await sb.rpc('find_room_by_code', { p_code: code.toUpperCase() });
      const room = rooms?.[0];
      if (!room) return;
      await fetchWagers(room.id);
      channel = sb
        .channel(`wagers:${room.id}`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'wagers', filter: `room_id=eq.${room.id}` },
          () => void fetchWagers(room.id),
        )
        .subscribe();
    })();
    return () => {
      cancelled = true;
      if (channel) sb.removeChannel(channel);
    };
  }, [code, startedAt, supabase]);

  // Auto-advance when timer expires OR all locked
  useEffect(() => {
    if (!isHost || advanced.current) return;
    const wageredIds = new Set(wagers.map((w) => w.player_id));
    const allWagered = players.length > 0 && players.every((p) => wageredIds.has(p.id));
    if (!isExpired && !allWagered) return;
    const id = setTimeout(async () => {
      if (advanced.current) return;
      advanced.current = true;
      const r = await hostAdvance(code);
      if (r.ok) router.refresh();
    }, PHASE_ADVANCE_MS.questionGrace);
    return () => clearTimeout(id);
  }, [code, isExpired, isHost, players, wagers, router]);

  const question = QUESTIONS_BY_ID[mainframeQuestionId];
  if (!question) return null;
  const cat = CATEGORIES[question.cat];
  const Icon = cat.Icon;
  const wagerByPlayer = new Map(wagers.map((w) => [w.player_id, w]));

  return (
    <div className="flex flex-col h-full gap-4">
      <div className="flex items-center gap-2">
        <div className="font-pixel text-xs px-3 py-1 mainframe-bg text-black">★ MAINFRAME ★</div>
      </div>

      <div className="flex items-center gap-3">
        <div
          className="font-pixel text-2xl tabular-nums"
          style={{ color: secondsLeft < 4 ? C.red : C.yellow }}
        >
          {Math.ceil(secondsLeft).toString().padStart(2, '0')}
        </div>
        <div className="flex-1">
          <TimerBar time={secondsLeft} total={totalSec} ominous />
        </div>
      </div>

      <div className="flex-1 grid place-items-center text-center">
        <div className="space-y-4">
          <div className="font-pixel text-xs text-zinc-400">▸ CATEGORY DETECTED</div>
          <div
            className="flex items-center justify-center gap-4 px-6 py-4 border-4"
            style={{
              borderColor: cat.color,
              background: `${cat.color}11`,
              boxShadow: `0 0 30px ${cat.color}55`,
            }}
          >
            <Icon
              size={48}
              style={{ color: cat.color, filter: `drop-shadow(0 0 10px ${cat.color})` }}
            />
            <div className="font-pixel text-xl sm:text-3xl" style={{ color: cat.color }}>
              {cat.name}
            </div>
          </div>
          <div className="font-crt text-2xl text-zinc-300">PLACE YOUR WAGERS — QUESTION INCOMING</div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {players.map((p) => {
          const player = toPlayer(p);
          const w = wagerByPlayer.get(p.id);
          return (
            <div
              key={p.id}
              className="border-2 p-3"
              style={{
                borderColor: C[player.color],
                background: '#000',
                boxShadow: w ? `0 0 16px ${C[player.color]}77` : 'none',
              }}
            >
              <div className="flex items-center gap-2 mb-1">
                <PlayerAvatar player={player} size={28} showName={false} glow={false} />
                <div className="font-pixel text-[10px]" style={{ color: C[player.color] }}>
                  {player.name}
                </div>
              </div>
              <div className="font-pixel text-[9px] text-zinc-500">SCORE: {p.score}</div>
              <div
                className="font-pixel text-base mt-1"
                style={{ color: w ? C.yellow : '#52525b' }}
              >
                {w ? (
                  <>
                    WAGER: <span className="text-glow">{w.amount}</span>
                  </>
                ) : (
                  '— PENDING —'
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
