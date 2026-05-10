import type { ReactNode } from 'react';

type HostFrameProps = {
  children: ReactNode;
  shake?: boolean;
  className?: string;
};

/**
 * CRT TV chrome wrapper. Includes scanlines, vignette, traversing scan-line,
 * neon glow boxShadow, and the bg-grid pattern.
 *
 * Sizing strategy:
 *   - Mobile: at least 560px tall so phase content has breathing room.
 *   - Desktop: callers wrap us in a flex parent and pass `flex-1` /
 *     `h-full` via className so we fill the viewport vertically. The
 *     min-h ceiling is then no-op because flex stretching dominates.
 */
export function HostFrame({ children, shake = false, className = '' }: HostFrameProps) {
  return (
    <div
      className={`relative bg-black border-4 border-zinc-800 rounded-lg overflow-hidden scanlines vignette flex flex-col ${shake ? 'shake' : ''} ${className}`}
      style={{
        boxShadow: '0 0 0 2px #000, 0 0 40px rgba(0,240,255,0.18), inset 0 0 60px rgba(0,0,0,0.8)',
        minHeight: 560,
      }}
    >
      <div className="scan-line" />
      <div className="bg-grid absolute inset-0 opacity-50" />
      <div className="relative z-10 p-5 sm:p-7 flex-1 flex flex-col">{children}</div>
    </div>
  );
}
