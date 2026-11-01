import React, { useMemo } from 'react';
import { Product } from '../types';
import { hashId, packTheme, packTypeStyle } from '../lib/strainTheme';
import HempLeaf from './HempLeaf';

/** Crimped foil-pouch silhouette (zig-zag heat-seal top and bottom). */
const crimp = (() => {
  const steps = 22;
  const top: string[] = [];
  const bot: string[] = [];
  for (let i = 0; i <= steps; i++) {
    const x = (i / steps) * 100;
    top.push(`${x.toFixed(2)}% ${i % 2 ? 2.6 : 0}%`);
    bot.push(`${(100 - x).toFixed(2)}% ${i % 2 ? 97.4 : 100}%`);
  }
  return `polygon(${top.join(',')},${bot.join(',')})`;
})();

interface Props {
  product: Product;
  className?: string;
  side?: 'front' | 'back';
}

/**
 * Seed pack mock-up: foil pouch whose colourway follows the strain family,
 * with the hemp-leaf emblem, strain name and lineage on the front label.
 */
const SeedPack: React.FC<Props> = ({ product, className = '', side = 'front' }) => {
  const t = packTheme(product.id, product.type);
  const voice = packTypeStyle(product.id);
  const rot = useMemo(() => (hashId(product.id) % 60) + 20, [product.id]);
  const [c1, c2, c3, c4] = t.mesh;
  const foil = `radial-gradient(90% 60% at 20% 8%, ${c4}dd, transparent 60%), radial-gradient(80% 70% at 90% 55%, ${c2}, transparent 65%), radial-gradient(90% 80% at 10% 100%, ${c3}, transparent 70%), linear-gradient(${rot + 120}deg, ${c1}, #030807 95%)`;
  const male = product.malePollen?.split('–').pop()?.trim();
  const female = product.femalePlant?.split('–').pop()?.trim();

  return (
    <div className={`seedpack relative ${className}`} style={{ aspectRatio: '3 / 4.15', containerType: 'inline-size', filter: 'drop-shadow(0 28px 34px rgba(0,0,0,0.55))' }}>
      <div className="absolute inset-0" style={{ clipPath: crimp, background: foil }}>
        {/* heat-seal ridges */}
        <div className="absolute inset-x-0 top-0 h-[8%]" style={{ background: 'repeating-linear-gradient(90deg, rgba(255,255,255,0.18) 0 1px, rgba(0,0,0,0.22) 1px 3px)', opacity: 0.55 }} />
        <div className="absolute inset-x-0 bottom-0 h-[6%]" style={{ background: 'repeating-linear-gradient(90deg, rgba(255,255,255,0.18) 0 1px, rgba(0,0,0,0.22) 1px 3px)', opacity: 0.55 }} />
        {/* foil sheen */}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(115deg, rgba(255,255,255,0.0) 25%, rgba(255,255,255,0.38) 42%, rgba(255,255,255,0.0) 58%)', mixBlendMode: 'soft-light' }} />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.18), transparent 22%, transparent 78%, rgba(0,0,0,0.35))' }} />

        {/* big watermark leaf */}
        <HempLeaf className="absolute left-1/2 top-[34%] -translate-x-1/2 -translate-y-1/2 w-[120%]" style={{ color: 'rgba(255,255,255,0.09)', transform: 'translate(-50%,-50%) rotate(-8deg)' }} veins />

        {side === 'front' && (
          <>
        {/* label */}
        <div className="absolute inset-x-[9%] top-[13%] bottom-[11%] flex flex-col items-center text-center" style={{ color: '#fff' }}>
          <div style={{ fontSize: '4.2cqw', letterSpacing: '0.42em', fontWeight: 700, opacity: 0.85 }}>CLEAN GENETICS</div>
          <div className="relative mt-[5%] flex items-center justify-center" style={{ width: '58cqw', height: '58cqw' }}>
            <div className="absolute inset-0 rounded-full" style={{ background: `radial-gradient(circle, ${t.accent}66, transparent 68%)`, filter: 'blur(8px)' }} />
            <div className="absolute inset-[6%] rounded-full" style={{ border: '1px solid rgba(255,255,255,0.28)', background: 'linear-gradient(160deg, rgba(255,255,255,0.18), rgba(255,255,255,0.03))', backdropFilter: 'blur(6px)' }} />
            <HempLeaf className="relative w-[64%]" style={{ color: '#fff', filter: `drop-shadow(0 0 10px ${t.accent})` }} veins />
          </div>
          <div
            className="mt-[6%] w-full leading-[1.05]"
            style={
              voice === 1
                ? { fontFamily: "'Instrument Serif', serif", fontStyle: 'italic', fontSize: '12.5cqw', lineHeight: 0.98, textShadow: '0 2px 14px rgba(0,0,0,0.45)', textWrap: 'balance' as any }
                : voice === 2
                ? { fontFamily: "'JetBrains Mono Variable', monospace", fontWeight: 600, textTransform: 'uppercase', fontSize: '7cqw', letterSpacing: '0.12em', textShadow: '0 2px 14px rgba(0,0,0,0.45)', textWrap: 'balance' as any }
                : { fontWeight: 800, textTransform: 'uppercase', fontSize: '9.2cqw', letterSpacing: '-0.01em', textShadow: '0 2px 14px rgba(0,0,0,0.45)', textWrap: 'balance' as any }
            }
          >
            {product.name}
          </div>
          <div className="mt-[4%] h-px w-[40%]" style={{ background: `linear-gradient(90deg, transparent, ${t.tint}, transparent)` }} />
          {male && female && (
            <div className="mt-[4%] font-mono uppercase opacity-80" style={{ fontSize: '3.3cqw', letterSpacing: '0.08em', lineHeight: 1.5 }}>
              {male}
              <br />× {female}
            </div>
          )}
          <div className="mt-auto flex items-center gap-[3cqw]" style={{ fontSize: '3.4cqw', letterSpacing: '0.24em', fontWeight: 700 }}>
            <span className="rounded-full px-[3.2cqw] py-[1cqw]" style={{ background: `${t.accent}33`, border: `1px solid ${t.accent}88`, color: t.tint }}>{product.type.toUpperCase()}</span>
            <span style={{ opacity: 0.75 }}>EST. 2026</span>
          </div>
        </div>
          </>
        )}
        {side === 'back' && (
          <div className="absolute inset-x-[9%] top-[13%] bottom-[11%] flex flex-col text-white">
            <div className="text-center" style={{ fontSize: '4.2cqw', letterSpacing: '0.42em', fontWeight: 700, opacity: 0.85 }}>CLEAN GENETICS</div>
            <div className="mt-[7%] rounded-[4cqw] p-[5cqw]" style={{ background: 'rgba(0,0,0,0.28)', border: '1px solid rgba(255,255,255,0.16)', backdropFilter: 'blur(6px)' }}>
              <div className="uppercase font-extrabold" style={{ fontSize: '6.4cqw', lineHeight: 1.05 }}>{product.name}</div>
              <div className="font-mono uppercase opacity-80" style={{ fontSize: '3.2cqw', letterSpacing: '0.1em', marginTop: '3cqw', lineHeight: 1.7 }}>
                {male && <div>♂ {male}</div>}
                {female && <div>♀ {female}</div>}
                <div>{product.type} · {product.floweringTime}</div>
                {product.harvestDate && <div>Lot {product.harvestDate}</div>}
              </div>
            </div>
            <div className="mt-[6%] text-center opacity-80" style={{ fontSize: '3.2cqw', letterSpacing: '0.18em', lineHeight: 1.8 }}>
              SMALL BATCH · ORGANIC
              <br />PHENO-HUNTED
              <br />STORE COOL · DRY · DARK
            </div>
            <div className="mt-auto flex items-end justify-between">
              <div className="flex items-end gap-[0.6cqw]" style={{ height: '13cqw' }} aria-hidden>
                {Array.from({ length: 34 }, (_, i) => (
                  <span key={i} style={{ width: `${0.7 + ((hashId(product.id + i) % 3) * 0.5)}cqw`, height: `${70 + (hashId(product.id + 'h' + i) % 30)}%`, background: 'rgba(255,255,255,0.85)' }} />
                ))}
              </div>
              <HempLeaf className="w-[13cqw]" style={{ color: 'rgba(255,255,255,0.9)', filter: `drop-shadow(0 0 8px ${t.accent})` }} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SeedPack;
