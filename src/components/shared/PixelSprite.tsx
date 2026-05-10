import { SPRITES } from '@/lib/game/sprites';

type Props = {
  /** Sprite id from SPRITES (mage / hacker / bard / paladin / oracle). */
  id: string;
  /** Pixel scale per sprite cell. Default 4 → 48×48 image for a 12×12 sprite. */
  scale?: number;
  /** Drop-shadow glow color (hex). */
  glowColor?: string;
  className?: string;
};

/**
 * Renders a pixel-art sprite as inline SVG <rect>s. Self-contained — no
 * external image asset, no animation. Optional glow via SVG drop-shadow
 * filter.
 *
 * Ported from prototypes/noghurt-brain-quest-mode-v1_1.jsx lines 194-218.
 */
export function PixelSprite({ id, scale = 4, glowColor, className = '' }: Props) {
  const sprite = SPRITES[id];
  if (!sprite) return null;
  const rows = sprite.grid.length;
  const cols = sprite.grid[0].length;
  const w = cols * scale;
  const h = rows * scale;

  return (
    <svg
      width={w}
      height={h}
      viewBox={`0 0 ${cols} ${rows}`}
      shapeRendering="crispEdges"
      className={className}
      style={{ filter: glowColor ? `drop-shadow(0 0 4px ${glowColor})` : 'none' }}
    >
      {sprite.grid.map((row, y) =>
        row.split('').map((ch, x) => {
          const fill = sprite.palette[ch];
          if (!fill) return null;
          return <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill={fill} />;
        }),
      )}
    </svg>
  );
}
