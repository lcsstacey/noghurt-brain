export const C = {
  pink: '#ff2e88',
  cyan: '#00f0ff',
  green: '#39ff14',
  yellow: '#ffe600',
  red: '#ff0040',
  purple: '#b829ff',
  bg: '#05050a',
  panel: '#0d0d18',
} as const;

export type PaletteKey = keyof typeof C;
