import { C } from '@/styles/palette';

type TimerBarProps = {
  time: number;
  total: number;
  ominous?: boolean;
};

export function TimerBar({ time, total, ominous = false }: TimerBarProps) {
  const pct = Math.max(0, Math.min(1, time / total));
  const color = pct > 0.5 ? C.green : pct > 0.25 ? C.yellow : C.red;

  return (
    <div className="relative w-full h-3 bg-black border-2 border-zinc-700 overflow-hidden">
      <div
        className="h-full transition-[width] duration-75 relative"
        style={{ width: `${pct * 100}%`, background: color, boxShadow: `0 0 12px ${color}` }}
      >
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              'repeating-linear-gradient(45deg, rgba(0,0,0,0.4), rgba(0,0,0,0.4) 4px, transparent 4px, transparent 8px)',
          }}
        />
      </div>
      {ominous && pct < 0.25 && <div className="absolute inset-0 bg-red-500/20 animate-pulse" />}
    </div>
  );
}
