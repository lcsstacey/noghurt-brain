import type { ReactNode } from 'react';

type HostFrameProps = {
  children: ReactNode;
  shake?: boolean;
  className?: string;
};

export function HostFrame({ children, shake = false, className = '' }: HostFrameProps) {
  return (
    <div
      className={`relative bg-black border-4 border-zinc-800 rounded-lg overflow-hidden scanlines vignette ${shake ? 'shake' : ''} ${className}`}
      style={{
        boxShadow: '0 0 0 2px #000, 0 0 40px rgba(0,240,255,0.18), inset 0 0 60px rgba(0,0,0,0.8)',
        minHeight: 560,
      }}
    >
      <div className="scan-line" />
      <div className="bg-grid absolute inset-0 opacity-50" />
      <div className="relative z-10 p-5 sm:p-7 h-full">{children}</div>
    </div>
  );
}
