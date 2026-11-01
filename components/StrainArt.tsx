import React, { useMemo } from 'react';
import { StrainType } from '../types';
import { hashId, packTheme } from '../lib/strainTheme';
import HempLeaf from './HempLeaf';

const Leaf = ({ className, style }: { className?: string; style?: React.CSSProperties }) => <HempLeaf className={className} style={style} veins />;

interface StrainArtProps {
  id: string;
  type: StrainType;
  className?: string;
  /** Size of the leaf glyph relative to the container (0-1) */
  glyph?: number;
  /** Disable the floating bokeh + leaf drift (use in dense lists) */
  still?: boolean;
  /** Hide the leaf glyph (use when a seed pack sits on top) */
  noGlyph?: boolean;
  children?: React.ReactNode;
}

/**
 * Procedural, per-strain generative artwork: a mesh gradient seeded from the product id,
 * a luminous leaf glyph, bokeh orbs and film grain. Colour family follows strain type.
 */
const StrainArt: React.FC<StrainArtProps> = ({ id, type, className = '', glyph = 0.5, still, noGlyph, children }) => {
  const art = useMemo(() => {
    const t = packTheme(id, type);
    const h = hashId(id);
    const p = (n: number, m = 100) => (Math.floor(h / (n * 7 + 1)) % m);
    const [c1, c2, c3, c4] = t.mesh;
    const bg = [
      `radial-gradient(55% 65% at ${12 + p(1, 40)}% ${10 + p(2, 40)}%, ${c4}cc 0%, transparent 62%)`,
      `radial-gradient(60% 70% at ${60 + p(3, 38)}% ${55 + p(4, 40)}%, ${c2} 0%, transparent 66%)`,
      `radial-gradient(70% 80% at ${p(5, 30)}% ${70 + p(6, 30)}%, ${c3} 0%, transparent 70%)`,
      `radial-gradient(80% 90% at 90% 5%, ${c1} 0%, transparent 65%)`,
      `linear-gradient(160deg, ${c1}, #030807 85%)`,
    ].join(',');
    const rot = (p(7, 40) - 20) | 0;
    const orbs = [0, 1, 2].map((i) => ({
      x: 10 + ((h >> (i * 5)) % 78),
      y: 8 + ((h >> (i * 4 + 2)) % 74),
      s: 22 + ((h >> (i * 3)) % 46),
      d: 5 + ((h >> (i + 3)) % 6),
    }));
    return { bg, rot, orbs, accent: t.accent };
  }, [id, type]);

  return (
    <div className={`${/\b(absolute|fixed|sticky)\b/.test(className) ? '' : 'relative'} overflow-hidden ${className}`} style={{ background: art.bg }}>
      {/* bokeh */}
      {!still &&
        art.orbs.map((o, i) => (
          <span
            key={i}
            className="art-bokeh absolute rounded-full animate-floaty"
            style={{
              left: `${o.x}%`,
              top: `${o.y}%`,
              width: o.s,
              height: o.s,
              background: `radial-gradient(circle at 30% 30%, rgba(255,255,255,0.55), ${art.accent}33 55%, transparent 70%)`,
              filter: 'blur(1.5px)',
              opacity: 0.55,
              animationDuration: `${o.d + 4}s`,
              animationDelay: `${-i * 1.7}s`,
            }}
          />
        ))}

      {/* glyph */}
      {!noGlyph && <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative" style={{ width: `${glyph * 100}%`, aspectRatio: '1', transform: `rotate(${art.rot}deg)` }}>
          <Leaf
            className={`absolute inset-0 w-full h-full ${still ? '' : 'animate-floaty'}`}
            style={{ color: 'rgba(255,255,255,0.16)', filter: `drop-shadow(0 0 28px ${art.accent}aa)`, mixBlendMode: 'overlay' }}
          />
          <Leaf
            className="absolute inset-0 w-full h-full"
            style={{ color: 'rgba(255,255,255,0.06)', transform: 'scale(1.18)', filter: 'blur(6px)' }}
          />
        </div>
      </div>}

      {/* sheen + vignette + grain */}
      <div className="absolute inset-0" style={{ background: 'linear-gradient(115deg, rgba(255,255,255,0.22) 0%, transparent 38%)', mixBlendMode: 'soft-light' }} />
      <div className="absolute inset-0" style={{ boxShadow: 'inset 0 0 90px rgba(3,4,12,0.55)' }} />
      <div
        className="art-grain absolute inset-0 opacity-[0.16] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='2'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
        }}
      />
      {children}
    </div>
  );
};

export default StrainArt;
