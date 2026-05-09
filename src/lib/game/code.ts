/**
 * Per docs/ARCHITECTURE.md § 3: 4-char code from a 32-letter alphabet that
 * excludes visually confusable glyphs (O, 0, I, 1).
 *
 *   32^4 = 1,048,576 possible codes — collision retry handles overlap.
 */
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export function generateRoomCode(): string {
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  }
  return code;
}

/**
 * Per-character validity check used by the landing-page input filter and
 * server-side normalization.
 */
export function isValidCodeChar(c: string): boolean {
  return ALPHABET.includes(c.toUpperCase());
}

export function normalizeCode(raw: string): string {
  return raw
    .toUpperCase()
    .split('')
    .filter(isValidCodeChar)
    .slice(0, 4)
    .join('');
}
