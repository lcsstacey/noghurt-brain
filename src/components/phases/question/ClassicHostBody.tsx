import { C } from '@/styles/palette';
import type { ClassicQuestion } from '@/data/questions';

const TAGS = ['A', 'B', 'C', 'D'];
const COLORS = [C.pink, C.cyan, C.green, C.yellow];

export function ClassicHostBody({ q }: { q: ClassicQuestion }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {q.options.map((opt, i) => (
        <div
          key={i}
          className="font-pixel text-xs sm:text-sm p-3 border-2 flex items-center gap-3"
          style={{ borderColor: COLORS[i] + '88', color: COLORS[i], background: '#000' }}
        >
          <div
            className="w-7 h-7 grid place-items-center font-pixel text-base"
            style={{ background: COLORS[i], color: '#000' }}
          >
            {TAGS[i]}
          </div>
          <span className="text-white text-glow-soft">{opt}</span>
        </div>
      ))}
    </div>
  );
}
