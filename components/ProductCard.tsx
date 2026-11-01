import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Product } from '../types';
import { Plus, Zap, Clock, Droplets, X, ArrowUpRight, Activity, Minus, Leaf, Check, Dna, Heart, Sprout, FlaskConical, CalendarDays } from 'lucide-react';
import StrainArt from './StrainArt';
import SeedPack from './SeedPack';
import { useTilt } from './Motion';
import { formatPotency, isGrowable, packTheme, weeksOf } from '../lib/strainTheme';
import { ui } from '../lib/ui';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product, quantity: number) => void;
  viewMode?: 'GRID' | 'LIST';
  favorite?: boolean;
  onToggleFavorite?: (id: string) => void;
  /** When provided, clicking a card opens the full product page instead of the quick-view popup */
  onOpen?: (p: Product) => void;
}

const plain = (t: string) => t.replace(/\*\*/g, '').replace(/\s+/g, ' ').trim();
const rich = (t: string) => t.split(/(\*\*[^*]+\*\*)/g).map((part, i) => (part.startsWith('**') ? <strong key={i} className="text-white font-semibold">{part.slice(2, -2)}</strong> : <React.Fragment key={i}>{part}</React.Fragment>));

const DIFFICULTY_LEVEL: Record<Product['difficulty'], number> = { Easy: 1, Moderate: 2, Expert: 3 };

const Stepper: React.FC<{ value: number; onChange: (n: number) => void; size?: 'sm' | 'lg' }> = ({ value, onChange, size = 'sm' }) => {
  const dim = size === 'lg' ? 'h-14' : 'h-11';
  return (
    <div
      className={`flex items-center rounded-full bg-white/[0.06] border border-white/10 ${dim} shrink-0`}
      onClick={(e) => e.stopPropagation()}
    >
      <button
        aria-label="Decrease quantity"
        onClick={(e) => {
          e.stopPropagation();
          onChange(Math.max(1, value - 1));
        }}
        className={`${dim} w-10 flex items-center justify-center text-zinc-400 hover:text-white rounded-l-full transition-colors`}
      >
        <Minus className="w-3.5 h-3.5" />
      </button>
      <span className="w-7 text-center font-mono font-bold text-white text-sm tabular-nums select-none">{value}</span>
      <button
        aria-label="Increase quantity"
        onClick={(e) => {
          e.stopPropagation();
          onChange(value + 1);
        }}
        className={`${dim} w-10 flex items-center justify-center text-zinc-400 hover:text-white rounded-r-full transition-colors`}
      >
        <Plus className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};

const DifficultyDots: React.FC<{ level: number; color: string }> = ({ level, color }) => (
  <span className="inline-flex gap-1" aria-hidden>
    {[1, 2, 3].map((n) => (
      <span key={n} className="w-1.5 h-1.5 rounded-full" style={{ background: n <= level ? color : 'rgba(255,255,255,0.15)', boxShadow: n <= level ? `0 0 8px ${color}` : 'none' }} />
    ))}
  </span>
);

const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart, viewMode = 'GRID', favorite = false, onToggleFavorite, onOpen }) => {
  const openDetails = () => (onOpen ? onOpen(product) : setShowDetails(true));
  const [showDetails, setShowDetails] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [tab, setTab] = useState<'OVERVIEW' | 'LINEAGE' | 'GROW'>('OVERVIEW');
  const stageTilt = useTilt(10);
  const tilt = useTilt(6);
  const theme = packTheme(product.id, product.type);
  const growable = isGrowable(product);

  useEffect(() => {
    if (!showDetails) return;
    setTab('OVERVIEW');
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setShowDetails(false);
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [showDetails]);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToCart(product, quantity);
    ui.toast(`${quantity > 1 ? `${quantity}× ` : ''}${product.name} added to your stash`, 'success');
    setQuantity(1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1400);
  };

  const AddButton: React.FC<{ className?: string; big?: boolean }> = ({ className = '', big }) => (
    <button onClick={handleAddToCart} className={`btn-primary ${big ? 'h-14 text-[15px]' : 'h-11 text-[13px]'} px-5 ${className}`}>
      {added ? (
        <>
          <Check className="w-4 h-4" strokeWidth={3} /> Added
        </>
      ) : (
        <>
          <Plus className="w-4 h-4" strokeWidth={3} /> Add to Stash
        </>
      )}
    </button>
  );

  const HeartBtn = ({ className = '' }: { className?: string }) =>
    onToggleFavorite ? (
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggleFavorite(product.id);
          ui.toast(favorite ? `Removed ${product.name} from favorites` : `Saved ${product.name} to favorites`, favorite ? 'info' : 'success');
        }}
        aria-pressed={favorite}
        aria-label={favorite ? 'Remove from favorites' : 'Save to favorites'}
        className={`w-10 h-10 rounded-full flex items-center justify-center border backdrop-blur-md transition-all duration-300 active:scale-90 ${
          favorite ? 'bg-teal-300/20 border-teal-200/50 text-teal-200 shadow-[0_0_20px_-2px_rgba(45,212,191,0.8)]' : 'bg-black/35 border-white/20 text-zinc-200 hover:text-white hover:bg-black/55'
        } ${className}`}
      >
        <Heart className={`w-[18px] h-[18px] transition-transform ${favorite ? 'fill-current scale-110' : ''}`} />
      </button>
    ) : null;

  const TypeChip = ({ className = '' }: { className?: string }) => (
    <span className={`chip ${className}`} style={{ color: theme.tint, borderColor: `${theme.accent}55`, background: `${theme.accent}1f` }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: theme.accent, boxShadow: `0 0 8px ${theme.accent}` }} />
      {product.type}
    </span>
  );

  const meter = (v: string) => {
    const u = v.toUpperCase();
    if (u === 'HIGH') return 88;
    if (u === 'MED' || u === 'MEDIUM') return 58;
    if (u === 'LOW') return 24;
    const n = parseFloat(v);
    return Number.isNaN(n) ? 0 : Math.min(100, n * 3.4);
  };

  const weeks = (() => {
    const m = product.floweringTime.match(/(\d+)\D+(\d+)?/);
    if (!m) return null;
    const lo = parseInt(m[1], 10);
    const hi = m[2] ? parseInt(m[2], 10) : lo;
    return { lo, hi };
  })();

  const renderDetailsModal = () => {
    if (!showDetails) return null;
    const tabs = growable
      ? ([['OVERVIEW', 'Overview', Leaf], ['LINEAGE', 'Lineage', Dna], ['GROW', 'Grow', Sprout]] as const)
      : ([['OVERVIEW', 'Overview', Leaf]] as const);
    const male = product.malePollen?.split('–').pop()?.trim();
    const female = product.femalePlant?.split('–').pop()?.trim();

    return createPortal(
      <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center md:p-6" role="dialog" aria-modal="true" aria-label={product.name}>
        <div className="absolute inset-0 bg-black/75 animate-in fade-in duration-300" onClick={() => setShowDetails(false)} />
        <div className="glass-strong edge-glow relative w-full max-w-5xl h-[94vh] md:h-[min(720px,90vh)] rounded-t-[2rem] md:rounded-[2rem] overflow-hidden flex flex-col md:flex-row animate-in slide-in-from-bottom-10 md:zoom-in-95 duration-500">
          {/* ── stage ── */}
          <div className="relative md:w-[44%] h-60 md:h-auto shrink-0 overflow-hidden" onPointerMove={stageTilt.onPointerMove} onPointerLeave={stageTilt.onPointerLeave}>
            <StrainArt id={product.id} type={product.type} noGlyph className="absolute inset-0" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#050c0b] via-transparent to-transparent md:bg-gradient-to-r md:from-transparent md:via-transparent md:to-[#050c0b]" />
            <div className="absolute inset-x-0 bottom-[8%] flex justify-center pointer-events-none">
              <div className="w-1/2 h-6 rounded-[50%] blur-xl opacity-70" style={{ background: theme.accent }} />
            </div>
            <div className="absolute inset-0 flex items-center justify-center py-6 md:py-10">
              <div ref={stageTilt.ref} className="tilt h-full">
                <SeedPack product={product} className="h-full animate-floaty" />
              </div>
            </div>
            <div className="absolute left-5 top-5 md:left-7 md:top-7 flex items-center gap-2 z-10">
              <TypeChip />
              {product.harvestDate && (
                <span className="chip !text-[9px] text-zinc-200"><CalendarDays className="w-3 h-3" /> Lot {product.harvestDate}</span>
              )}
            </div>
          </div>

          {/* ── content ── */}
          <div className="flex-1 min-h-0 flex flex-col">
            <div className="flex items-start gap-3 px-6 md:px-9 pt-6 md:pt-8">
              <h2 className="flex-1 text-3xl md:text-[2.4rem] font-extrabold text-white tracking-tight leading-[1.05] text-balance">{product.name}</h2>
              <HeartBtn />
              <button onClick={() => setShowDetails(false)} aria-label="Close" className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 border border-white/15 text-zinc-300 hover:text-white hover:bg-white/20 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* tabs */}
            <div className="px-6 md:px-9 mt-5">
              <div className="flex gap-1 p-1 rounded-full bg-black/30 border border-white/10 w-fit" role="tablist">
                {tabs.map(([k, label, Ic]) => (
                  <button
                    key={k}
                    role="tab"
                    aria-selected={tab === k}
                    onClick={() => setTab(k as any)}
                    className={`h-9 px-4 rounded-full text-[13px] font-semibold flex items-center gap-2 transition-all duration-300 ${
                      tab === k ? 'bg-gradient-to-b from-white/25 to-white/10 text-white shadow-[0_0_18px_-4px_var(--ac)]' : 'text-zinc-400 hover:text-white'
                    }`}
                    style={{ ['--ac' as any]: theme.accent }}
                  >
                    <Ic className="w-3.5 h-3.5" /> {label}
                  </button>
                ))}
              </div>
            </div>

            <div key={tab} className="flex-1 min-h-0 overflow-y-auto px-6 md:px-9 py-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              {tab === 'OVERVIEW' && (
                <>
                  <p className="text-zinc-300/90 leading-relaxed text-[15px] whitespace-pre-line mb-6">{rich(product.description)}</p>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { l: 'THC', v: product.thc, i: Zap, c: '#6ff3c1' },
                      { l: 'CBD', v: product.cbd, i: Activity, c: '#5eead4' },
                    ].map((m) => (
                      <div key={m.l} className="rounded-2xl bg-white/[0.05] border border-white/10 p-4">
                        <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-widest text-zinc-400 mb-2">
                          <span className="flex items-center gap-1.5"><m.i className="w-3.5 h-3.5" style={{ color: m.c }} /> {m.l}</span>
                          <span className="font-mono text-white text-sm">{formatPotency(m.v)}</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                          <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${meter(m.v)}%`, background: `linear-gradient(90deg, ${theme.accent}, ${m.c})`, boxShadow: `0 0 12px ${m.c}` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {tab === 'LINEAGE' && (
                <div>
                  <div className="eyebrow !text-zinc-500 !text-[10px] mb-4">Family tree</div>
                  <div className="grid grid-cols-2 gap-3 relative z-10">
                    {[
                      { role: 'Male pollen', icon: '♂', raw: product.malePollen, name: male },
                      { role: 'Female mother', icon: '♀', raw: product.femalePlant, name: female },
                    ].map((p) => (
                      <div key={p.role} className="rounded-2xl bg-white/[0.05] border border-white/10 p-4">
                        <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-zinc-400 mb-2">
                          <span className="w-5 h-5 rounded-full flex items-center justify-center text-[11px]" style={{ background: `${theme.accent}33`, color: theme.tint }}>{p.icon}</span> {p.role}
                        </div>
                        <div className="text-sm font-bold text-white uppercase leading-tight">{p.name || '—'}</div>
                        <div className="text-[10px] text-zinc-500 mt-1 uppercase tracking-wide">{p.raw?.split('–')[0]?.trim()}</div>
                      </div>
                    ))}
                  </div>
                  <svg viewBox="0 0 100 34" preserveAspectRatio="none" className="w-full h-16 -my-px" aria-hidden>
                    <defs>
                      <linearGradient id={`lg-${product.id}`} x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0" stopColor={theme.accent} stopOpacity="0.15" />
                        <stop offset="1" stopColor={theme.accent} stopOpacity="1" />
                      </linearGradient>
                    </defs>
                    <path d="M25 0 C25 18, 50 14, 50 34" fill="none" stroke={`url(#lg-${product.id})`} strokeWidth="0.7" vectorEffect="non-scaling-stroke" strokeDasharray="3 3" />
                    <path d="M75 0 C75 18, 50 14, 50 34" fill="none" stroke={`url(#lg-${product.id})`} strokeWidth="0.7" vectorEffect="non-scaling-stroke" strokeDasharray="3 3" />
                  </svg>
                  <div className="mx-auto w-fit max-w-full rounded-2xl px-5 py-3 text-center border" style={{ borderColor: `${theme.accent}77`, background: `${theme.accent}1a`, boxShadow: `0 0 36px -10px ${theme.accent}` }}>
                    <div className="text-[10px] uppercase tracking-widest font-bold" style={{ color: theme.tint }}>Result</div>
                    <div className="text-white font-extrabold uppercase tracking-tight">{product.name}</div>
                  </div>
                </div>
              )}

              {tab === 'GROW' && (
                <div className="space-y-5">
                  <div className="rounded-2xl bg-white/[0.05] border border-white/10 p-5">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-[11px] uppercase tracking-widest font-bold text-zinc-400 flex items-center gap-2"><Clock className="w-3.5 h-3.5 text-teal-300" /> Flowering window</span>
                      <span className="font-mono text-white text-sm">{product.floweringTime}</span>
                    </div>
                    {weeks && (
                      <div className="relative">
                        <div className="grid grid-cols-8 gap-1">
                          {[6, 7, 8, 9, 10, 11, 12, 13].map((w) => (
                            <div key={w} className="text-center">
                              <div className="h-3 rounded-full transition-all" style={{ background: w >= weeks.lo && w <= weeks.hi ? `linear-gradient(90deg, ${theme.accent}, #6ff3c1)` : 'rgba(255,255,255,0.09)', boxShadow: w >= weeks.lo && w <= weeks.hi ? `0 0 14px ${theme.accent}` : 'none' }} />
                              <div className="text-[9px] font-mono text-zinc-500 mt-1.5">{w}w</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-2xl bg-white/[0.05] border border-white/10 p-4">
                      <div className="text-[11px] uppercase tracking-widest font-bold text-zinc-400 mb-2 flex items-center gap-2"><Droplets className="w-3.5 h-3.5 text-teal-300" /> Difficulty</div>
                      <div className="flex items-center gap-3 text-white font-bold uppercase text-sm">{product.difficulty} <DifficultyDots level={DIFFICULTY_LEVEL[product.difficulty]} color={theme.accent} /></div>
                    </div>
                    <div className="rounded-2xl bg-white/[0.05] border border-white/10 p-4">
                      <div className="text-[11px] uppercase tracking-widest font-bold text-zinc-400 mb-2 flex items-center gap-2"><FlaskConical className="w-3.5 h-3.5 text-teal-300" /> Harvest lot</div>
                      <div className="text-white font-bold font-mono text-sm">{product.harvestDate || '—'}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* sticky buy bar */}
            <div className="px-6 md:px-9 py-5 border-t border-white/10 bg-black/25 flex items-center gap-4">
              <div className="leading-none">
                <div className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1">{growable ? 'Per seed' : 'Price'}</div>
                <div className="text-3xl font-extrabold text-white tracking-tight"><span className="text-base align-top text-zinc-400 mr-0.5">$</span>{product.price}</div>
              </div>
              <div className="flex-1" />
              <Stepper value={quantity} onChange={setQuantity} size="lg" />
              <AddButton big className="min-w-[10rem] hidden sm:inline-flex" />
              <AddButton big className="sm:hidden !px-4" />
            </div>
          </div>
        </div>
      </div>,
      document.body,
    );
  };

  /* ─────────────── LIST ─────────────── */
  if (viewMode === 'LIST') {
    return (
      <>
        <div
          onClick={openDetails}
          className="spot glass group rounded-3xl overflow-hidden flex flex-col md:flex-row cursor-pointer transition-transform duration-500 hover:-translate-y-0.5"
        >
          <StrainArt id={product.id} type={product.type} noGlyph still className="w-full md:w-64 h-72 md:h-auto md:min-h-[17rem] shrink-0">
            <div className="absolute inset-x-0 top-5 bottom-5 flex justify-center">
              <SeedPack product={product} className="h-full" />
            </div>
            <div className="absolute top-3 left-3 z-10">
              <TypeChip />
            </div>
            <div className="absolute top-3 right-3 z-10"><HeartBtn /></div>
          </StrainArt>
          <div className="flex-1 p-6 flex flex-col gap-4 relative z-10">
            <div className="flex justify-between items-start gap-4">
              <h3 className="text-xl font-extrabold text-white tracking-tight">{product.name}</h3>
              <span className="text-xl font-bold font-mono text-white">${product.price}</span>
            </div>
            <p className="text-zinc-400 text-sm line-clamp-2">{plain(product.description)}</p>
            <div className="flex flex-wrap gap-2">
              <span className="chip !normal-case !tracking-normal text-zinc-200"><Zap className="w-3 h-3 text-amber-300" />{formatPotency(product.thc)} THC</span>
              {growable && (
                <>
                  <span className="chip !normal-case !tracking-normal text-zinc-200"><Clock className="w-3 h-3 text-teal-300" />{product.floweringTime}</span>
                  <span className="chip !normal-case !tracking-normal text-zinc-200"><Droplets className="w-3 h-3" style={{ color: theme.accent }} />{product.difficulty}</span>
                </>
              )}
            </div>
            <div className="flex items-center gap-3 mt-auto">
              <Stepper value={quantity} onChange={setQuantity} />
              <AddButton />
            </div>
          </div>
        </div>
        {renderDetailsModal()}
      </>
    );
  }

  /* ─────────────── GRID ─────────────── */
  return (
    <>
      <div {...tilt} onClick={openDetails} className="tilt group h-full cursor-pointer">
        <div className="spot glass rounded-[1.75rem] overflow-hidden flex flex-col h-full transition-shadow duration-500 group-hover:shadow-[0_30px_80px_-24px_var(--glow)]" style={{ ['--glow' as any]: `${theme.accent}88` }}>
          <div className="relative h-80 overflow-hidden">
            <StrainArt id={product.id} type={product.type} noGlyph glyph={0.5} className="absolute inset-0 transition-transform duration-[900ms] ease-out group-hover:scale-110" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#050c0b]/80 via-transparent to-transparent z-10" />
            <div className="absolute inset-x-0 top-7 bottom-4 flex justify-center z-10 pointer-events-none">
              <SeedPack product={product} className="h-full transition-transform duration-700 ease-out group-hover:-translate-y-2 group-hover:rotate-[-2deg] group-hover:scale-[1.04]" />
            </div>

            <div className="absolute top-4 left-4 z-20">
              <TypeChip />
            </div>
            <div className="absolute top-[3.6rem] right-4 z-20">
              <HeartBtn />
            </div>
            <div className="absolute top-4 right-4 z-20">
              <span className="px-3.5 py-1.5 rounded-full bg-white text-[#07080f] text-[13px] font-extrabold shadow-[0_8px_24px_-6px_rgba(0,0,0,0.6)]">${product.price}</span>
            </div>

            <div className="absolute inset-x-0 bottom-4 z-20 flex justify-center opacity-0 translate-y-3 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500">
              <span className="chip !bg-black/45 !border-white/25 text-white">
                View details <ArrowUpRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>

          <div className="relative z-10 p-5 md:p-6 flex-1 flex flex-col">
            <h3 className="text-[1.35rem] leading-tight font-extrabold text-white tracking-tight line-clamp-2 md:min-h-[3.4rem]">{product.name}</h3>
            <p className="text-zinc-400 text-sm leading-relaxed line-clamp-2 mt-1.5 mb-5">{plain(product.description)}</p>

            <div className="grid grid-cols-3 rounded-2xl bg-black/25 border border-white/[0.07] mb-5 overflow-hidden">
              {[
                { icon: Zap, color: 'text-amber-300', label: 'THC', value: formatPotency(product.thc) },
                growable
                  ? { icon: Clock, color: 'text-teal-300', label: 'Flower', value: weeksOf(product) }
                  : { icon: Activity, color: 'text-fuchsia-300', label: 'CBD', value: formatPotency(product.cbd) },
                growable
                  ? { icon: Droplets, color: '', label: 'Level', value: product.difficulty, accent: theme.accent }
                  : { icon: Leaf, color: 'text-emerald-300', label: 'Type', value: 'Natural' },
              ].map((s, i) => (
                <div key={s.label} className={`py-3 px-1 text-center ${i > 0 ? 'border-l border-white/[0.07]' : ''}`}>
                  <div className="flex items-center justify-center gap-1 text-[9px] font-bold uppercase tracking-[0.16em] text-zinc-500 mb-1">
                    <s.icon className={`w-3 h-3 ${s.color}`} style={(s as any).accent ? { color: (s as any).accent } : undefined} /> {s.label}
                  </div>
                  <div className="font-mono font-semibold text-[13px] text-white uppercase">{s.value}</div>
                </div>
              ))}
            </div>

            <div className="mt-auto flex items-center gap-2.5">
              <Stepper value={quantity} onChange={setQuantity} />
              <AddButton className="flex-1 !px-3 whitespace-nowrap" />
            </div>
          </div>
        </div>
      </div>
      {renderDetailsModal()}
    </>
  );
};

export default ProductCard;
