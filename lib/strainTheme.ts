import { Product, StrainType } from '../types';

/** Colour language: every strain family owns a spectrum so the catalog reads at a glance. */
export interface StrainTheme {
  /** Primary accent, used for chips / glows / bars */
  accent: string;
  /** Soft text-safe tint of the accent */
  tint: string;
  /** Mesh gradient stops used by <StrainArt/> */
  mesh: [string, string, string, string];
  /** Tailwind-free css gradient for buttons / bars */
  bar: string;
  label: string;
}

const THEMES: Record<StrainType, StrainTheme> = {
  [StrainType.INDICA]: {
    accent: '#a78bfa',
    tint: '#ddd6fe',
    mesh: ['#5b21b6', '#c026d3', '#312e81', '#f0abfc'],
    bar: 'linear-gradient(90deg,#7c3aed,#d946ef)',
    label: 'Indica',
  },
  [StrainType.SATIVA]: {
    accent: '#fbbf24',
    tint: '#fde68a',
    mesh: ['#d97706', '#f43f5e', '#ea580c', '#fde047'],
    bar: 'linear-gradient(90deg,#f59e0b,#fb7185)',
    label: 'Sativa',
  },
  [StrainType.HYBRID]: {
    accent: '#34d399',
    tint: '#a7f3d0',
    mesh: ['#047857', '#0891b2', '#10b981', '#67e8f9'],
    bar: 'linear-gradient(90deg,#10b981,#22d3ee)',
    label: 'Hybrid',
  },
};

export const themeFor = (type: StrainType): StrainTheme => THEMES[type] ?? THEMES[StrainType.HYBRID];

export const hashId = (id: string): number => {
  let h = 2166136261;
  for (let i = 0; i < id.length; i++) {
    h ^= id.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
};

/** Potency strings are sometimes words ("HIGH"), sometimes numbers ("22"). Only numbers get a % sign. */
export const formatPotency = (val: string): string => {
  if (!val || val === 'N/A') return 'N/A';
  return /^\d+(\.\d+)?$/.test(val.trim()) ? `${val}%` : val.toUpperCase();
};

export const isGrowable = (p: Product): boolean => !!p.floweringTime && p.floweringTime !== 'N/A';

export const weeksOf = (p: Product): string => {
  const m = p.floweringTime.match(/\d+/);
  return m ? `${m[0]}w` : '—';
};

/** Distinct pack colourways. Each strain gets its own, picked from its id, so every pack looks different. */
const WAYS: { accent: string; tint: string; mesh: [string, string, string, string] }[] = [
  { accent: '#34d399', tint: '#a7f3d0', mesh: ['#047857', '#0891b2', '#10b981', '#67e8f9'] }, // emerald / teal
  { accent: '#a78bfa', tint: '#ddd6fe', mesh: ['#5b21b6', '#c026d3', '#312e81', '#f0abfc'] }, // violet / orchid
  { accent: '#fbbf24', tint: '#fde68a', mesh: ['#d97706', '#f43f5e', '#ea580c', '#fde047'] }, // amber / sunset
  { accent: '#22d3ee', tint: '#a5f3fc', mesh: ['#0e7490', '#2563eb', '#0891b2', '#93c5fd'] }, // glacier blue
  { accent: '#a3e635', tint: '#d9f99d', mesh: ['#4d7c0f', '#ca8a04', '#65a30d', '#fef08a'] }, // lime / gold
  { accent: '#fb7185', tint: '#fecdd3', mesh: ['#be123c', '#9333ea', '#e11d48', '#fda4af'] }, // rose / ruby
  { accent: '#818cf8', tint: '#c7d2fe', mesh: ['#3730a3', '#0ea5e9', '#4f46e5', '#a5b4fc'] }, // indigo / sky
  { accent: '#fb923c', tint: '#fed7aa', mesh: ['#c2410c', '#db2777', '#ea580c', '#fdba74'] }, // ember / magenta
  { accent: '#2dd4bf', tint: '#99f6e4', mesh: ['#0f766e', '#7c3aed', '#14b8a6', '#5eead4'] }, // teal / ultraviolet
  { accent: '#f0abfc', tint: '#fae8ff', mesh: ['#a21caf', '#f97316', '#d946ef', '#fbcfe8'] }, // fuchsia / peach
];

export const packTheme = (id: string, type: StrainType): StrainTheme => {
  const base = themeFor(type);
  const w = WAYS[hashId(id) % WAYS.length];
  return { ...base, accent: w.accent, tint: w.tint, mesh: w.mesh };
};

/** 0 = bold sans, 1 = italic serif, 2 = spaced mono-caps: gives each pack its own typographic voice. */
export const packTypeStyle = (id: string): 0 | 1 | 2 => (Math.floor(hashId(id) / 7) % 3) as 0 | 1 | 2;
