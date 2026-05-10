'use client';

import { useState } from 'react';
import { Lock } from 'lucide-react';
import { C } from '@/styles/palette';

type Props = {
  onLock: (answer: string) => void;
  disabled?: boolean;
};

export function DecryptorPhoneBody({ onLock, disabled }: Props) {
  const [val, setVal] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!val.trim() || disabled || submitting) return;
    setSubmitting(true);
    onLock(val);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="font-pixel text-[8px] text-zinc-500">▸ TYPE YOUR DECRYPTION</div>
      <input
        value={val}
        onChange={(e) => setVal(e.target.value)}
        autoFocus
        disabled={disabled || submitting}
        placeholder="ENTER ANSWER…"
        className="retro-input w-full p-3 bg-black border-2 font-pixel text-sm uppercase disabled:opacity-50"
        style={{ borderColor: C.green, color: C.green, caretColor: C.green }}
      />
      <button
        type="submit"
        disabled={!val.trim() || disabled || submitting}
        className="btn-3d font-pixel text-xs w-full py-3 disabled:opacity-30"
        style={{ color: C.pink, background: '#0a0a0a' }}
      >
        <span className="flex items-center justify-center gap-2">
          <Lock size={14} />
          {submitting ? 'LOCKING…' : 'LOCK IN'}
        </span>
      </button>
      <div className="font-crt text-base text-zinc-500 text-center">⚡ Faster lock = more points</div>
    </form>
  );
}
