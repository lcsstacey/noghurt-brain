import type { ReactNode } from 'react';

type PhoneFrameProps = {
  children: ReactNode;
};

export function PhoneFrame({ children }: PhoneFrameProps) {
  return (
    <div className="mx-auto w-[280px] shrink-0">
      <div
        className="rounded-[2.2rem] p-2.5 bg-zinc-900 border-[3px] border-zinc-700"
        style={{
          boxShadow:
            '0 0 0 1px #000, 10px 14px 0 rgba(0,0,0,0.5), 0 0 30px rgba(255,46,136,0.15)',
        }}
      >
        <div className="flex justify-center mb-1">
          <div className="h-1.5 w-16 bg-zinc-800 rounded-full" />
        </div>
        <div
          className="bg-black rounded-2xl overflow-hidden relative"
          style={{ aspectRatio: '9/19', height: 520 }}
        >
          <div className="scanlines absolute inset-0 z-30 pointer-events-none" />
          <div className="relative z-10 h-full overflow-y-auto no-scrollbar">{children}</div>
        </div>
        <div className="flex justify-center mt-2">
          <div className="h-1 w-20 bg-zinc-800 rounded-full" />
        </div>
      </div>
    </div>
  );
}
