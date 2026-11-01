import React, { useMemo, useState } from 'react';
import {
  ArrowLeft, ArrowRight, ChevronLeft, ChevronRight, Heart, Plus, Minus, Check, Zap, Activity, Clock, Droplets, Dna, Sprout, ShieldCheck,
  CalendarDays, Bot, Truck, FlaskConical, Leaf, Gift, ChevronDown, Microscope, Sparkles, Layers,
} from 'lucide-react';
import { Product } from '../types';
import SeedPack from './SeedPack';
import StrainArt from './StrainArt';
import HempLeaf from './HempLeaf';
import { Reveal, useTilt } from './Motion';
import { formatPotency, isGrowable, packTheme } from '../lib/strainTheme';
import { ui } from '../lib/ui';

interface Props {
  product: Product;
  all: Product[];
  favorites: string[];
  onToggleFavorite: (id: string) => void;
  onAddToCart: (p: Product, q: number) => void;
  onBack: () => void;
  backLabel: string;
  onOpen: (p: Product) => void;
  onAskGene: () => void;
  onGoCart: () => void;
  paidSeeds: number;
}

const rich = (t: string) =>
  t.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.startsWith('**') ? <strong key={i} className="text-white font-semibold">{part.slice(2, -2)}</strong> : <React.Fragment key={i}>{part}</React.Fragment>,
  );

const meter = (v: string) => {
  const u = v.toUpperCase();
  if (u === 'HIGH') return 88;
  if (u === 'MED' || u === 'MEDIUM') return 58;
  if (u === 'LOW') return 24;
  const n = parseFloat(v);
  return Number.isNaN(n) ? 0 : Math.min(100, n * 3.4);
};

const TIPS: Record<Product['difficulty'], { title: string; body: string }[]> = {
  Easy: [
    { title: 'Forgiving growth', body: 'Tolerates small feeding and watering mistakes. A good first run.' },
    { title: 'Keep it simple', body: 'Stable light, moderate humidity and a light touch on nutrients are enough.' },
    { title: 'Watch the finish', body: 'Dense flowers like airflow. Keep humidity down in the last two weeks.' },
  ],
  Moderate: [
    { title: 'Train early', body: 'Topping or a screen keeps the canopy even and lets light reach every site.' },
    { title: 'Dial the feed', body: 'Ramp nutrients gradually and track runoff pH so lockout never sneaks up.' },
    { title: 'Mind the canopy', body: 'Defoliate lightly and prop heavy branches as flowers bulk up.' },
  ],
  Expert: [
    { title: 'Long, stretchy flower', body: 'Expect vertical growth after the flip. Plan height and support in advance.' },
    { title: 'Tight environment', body: 'Hold temperature and VPD steady. Swings show up in the final result.' },
    { title: 'Patience pays', body: 'Late finishers reward a slow dry and a long cure.' },
  ],
};

const CLEAN_STANDARD = [
  'No synthetic pesticides, ever',
  'No salt-based nutrients during flower',
  'Full-panel HLVd testing on every mother',
  '30-day cure minimum before the seeds are packed',
];

const FAQ = [
  { q: 'What is the germination guarantee?', a: 'Every pack is covered by our germination guarantee. If seeds fail to pop, send a photo of your method and we will make it right. The full terms are on the About page.' },
  { q: 'Do you ship everywhere?', a: 'Seeds ship worldwide. Clones and live plants are USA-only due to agricultural restrictions. Please check the laws where you live before you order.' },
  { q: 'How does ordering work?', a: 'You submit an order request from your stash. We verify inventory, then email a PayPal payment request, and ship once it is paid. Nothing is charged on the website.' },
];

const Section: React.FC<{ id?: string; eyebrow: string; title: React.ReactNode; children: React.ReactNode }> = ({ id, eyebrow, title, children }) => (
  <Reveal>
    <section id={id} className="scroll-mt-28">
      <div className="eyebrow mb-3">{eyebrow}</div>
      <h2 className="text-3xl md:text-5xl font-extrabold tracking-tighter text-gradient-silver leading-[1.04] mb-8 text-balance">{title}</h2>
      {children}
    </section>
  </Reveal>
);

const ProductPage: React.FC<Props> = ({ product, all, favorites, onToggleFavorite, onAddToCart, onBack, backLabel, onOpen, onAskGene, onGoCart, paidSeeds }) => {
  const theme = packTheme(product.id, product.type);
  const growable = isGrowable(product);
  const fav = favorites.includes(product.id);
  const [qty, setQty] = useState(1);
  const [view, setView] = useState<'FRONT' | 'BACK' | 'CLOSE'>('FRONT');
  const [added, setAdded] = useState(false);
  const [faq, setFaq] = useState<number | null>(0);
  const tilt = useTilt(9);

  const male = product.malePollen?.split('–').pop()?.trim();
  const female = product.femalePlant?.split('–').pop()?.trim();
  const maleBreeder = product.malePollen?.includes('–') ? product.malePollen.split('–')[0].trim() : undefined;
  const femaleBreeder = product.femalePlant?.includes('–') ? product.femalePlant.split('–')[0].trim() : undefined;

  const weeks = useMemo(() => {
    const m = product.floweringTime.match(/(\d+)\D+(\d+)?/);
    if (!m) return null;
    const lo = parseInt(m[1], 10);
    const hi = m[2] ? parseInt(m[2], 10) : lo;
    return { lo, hi };
  }, [product.floweringTime]);

  const catalog = all.filter((p) => isGrowable(p) === growable);
  const idx = catalog.findIndex((p) => p.id === product.id);
  const prev = catalog[(idx - 1 + catalog.length) % catalog.length];
  const next = catalog[(idx + 1) % catalog.length];

  const sameDonor = all.filter((p) => p.id !== product.id && product.malePollen && p.malePollen === product.malePollen);
  const sameMother = all.filter((p) => p.id !== product.id && product.femalePlant && p.femalePlant === product.femalePlant);
  const sameType = all.filter((p) => p.id !== product.id && p.type === product.type && growable && isGrowable(p));
  const others = !growable ? all.filter((p) => p.id !== product.id && !isGrowable(p)) : [];

  const toFree = growable ? 4 - (paidSeeds % 4) : 0;

  const add = () => {
    onAddToCart(product, qty);
    ui.toast(`${qty > 1 ? `${qty}× ` : ''}${product.name} added to your stash`, 'success');
    setAdded(true);
    setQty(1);
    setTimeout(() => setAdded(false), 1500);
  };

  const timeline = weeks
    ? [
        { l: 'Germination', w: 1, d: '3–7 days', c: '#5eead4' },
        { l: 'Seedling', w: 2.5, d: '2–3 wks', c: '#34d399' },
        { l: 'Vegetative', w: 5, d: '4–8 wks', c: '#10b981' },
        { l: 'Flowering', w: (weeks.lo + weeks.hi) / 2, d: product.floweringTime, c: theme.accent },
        { l: 'Dry & cure', w: 4.5, d: '30+ days', c: '#99f6e4' },
      ]
    : [];
  const totalW = timeline.reduce((a, b) => a + b.w, 0);

  return (
    <div className="relative">
      {/* pack-coloured atmosphere behind the hero */}
      <div className="absolute inset-x-0 -top-28 h-[900px] pointer-events-none overflow-hidden -z-10" aria-hidden>
        <div className="absolute -left-[10%] top-0 w-[70%] h-full opacity-50 blur-3xl" style={{ background: `radial-gradient(50% 50% at 40% 40%, ${theme.mesh[1]}88, transparent 70%)` }} />
        <div className="absolute right-[-10%] top-10 w-[55%] h-4/5 opacity-30 blur-3xl" style={{ background: `radial-gradient(50% 50% at 60% 40%, ${theme.mesh[3]}77, transparent 70%)` }} />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#020605]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-10 pb-40 lg:pb-24">
        {/* ───── top bar ───── */}
        <div className="flex items-center justify-between gap-3 mb-6">
          <button onClick={onBack} className="btn-glass h-11 pl-4 pr-5 text-sm">
            <ArrowLeft className="w-4 h-4" /> {backLabel}
          </button>
          <div className="hidden md:flex items-center gap-2 text-xs text-zinc-500">
            <span>{growable ? 'Seed Bank' : 'Medicines'}</span>
            <ChevronRight className="w-3 h-3" />
            <span style={{ color: theme.tint }}>{product.type}</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-zinc-300 font-semibold">{product.name}</span>
          </div>
          <div className="flex gap-2">
            <button onClick={() => onOpen(prev)} aria-label={`Previous: ${prev.name}`} className="btn-glass w-11 h-11"><ChevronLeft className="w-4 h-4" /></button>
            <button onClick={() => onOpen(next)} aria-label={`Next: ${next.name}`} className="btn-glass w-11 h-11"><ChevronRight className="w-4 h-4" /></button>
          </div>
        </div>

        {/* ───── hero ───── */}
        <div className="grid lg:grid-cols-[1.05fr_1fr] gap-8 lg:gap-14 items-start">
          {/* stage */}
          <div className="lg:sticky lg:top-28">
            <div
              className="edge-glow relative rounded-[2.5rem] overflow-hidden h-[460px] md:h-[620px]"
              onPointerMove={tilt.onPointerMove}
              onPointerLeave={tilt.onPointerLeave}
            >
              <StrainArt id={product.id} type={product.type} noGlyph className="absolute inset-0" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
              {view === 'CLOSE' ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <HempLeaf className="w-[78%] animate-floaty" style={{ color: 'rgba(255,255,255,0.92)', filter: `drop-shadow(0 0 40px ${theme.accent})` }} veins />
                </div>
              ) : (
                <>
                  <div className="absolute inset-x-0 bottom-[5%] flex justify-center pointer-events-none"><div className="w-1/2 h-8 rounded-[50%] blur-2xl opacity-80" style={{ background: theme.accent }} /></div>
                  <div className="absolute inset-0 flex items-center justify-center py-8 md:py-10">
                    <div ref={tilt.ref} className="tilt h-full">
                      <SeedPack key={view} product={product} side={view === 'BACK' ? 'back' : 'front'} className="h-full animate-in fade-in zoom-in-95 duration-500" />
                    </div>
                  </div>
                </>
              )}
              <div className="absolute left-5 top-5 flex gap-2">
                <span className="chip" style={{ color: theme.tint, borderColor: `${theme.accent}66`, background: `${theme.accent}22` }}>
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: theme.accent, boxShadow: `0 0 8px ${theme.accent}` }} /> {product.type}
                </span>
                {product.harvestDate && <span className="chip text-zinc-200 !text-[9px]"><CalendarDays className="w-3 h-3" /> Lot {product.harvestDate}</span>}
              </div>
            </div>
            {/* gallery */}
            <div className="grid grid-cols-3 gap-3 mt-3">
              {([['FRONT', 'Front'], ['BACK', 'Back label'], ['CLOSE', 'Emblem']] as const).map(([k, l]) => (
                <button
                  key={k}
                  onClick={() => setView(k)}
                  aria-pressed={view === k}
                  className={`relative h-20 rounded-2xl overflow-hidden border transition-all duration-300 ${view === k ? 'border-white/50 scale-[1.02]' : 'border-white/10 opacity-70 hover:opacity-100'}`}
                  style={view === k ? { boxShadow: `0 0 28px -6px ${theme.accent}` } : undefined}
                >
                  <StrainArt id={product.id} type={product.type} still noGlyph className="absolute inset-0" />
                  <span className="absolute inset-0 bg-black/45" />
                  <span className="relative z-10 text-[11px] font-bold uppercase tracking-[0.2em] text-white">{l}</span>
                </button>
              ))}
            </div>
          </div>

          {/* details + buy */}
          <div>
            <div className="flex items-start gap-3">
              <h1 className="flex-1 text-5xl md:text-7xl font-extrabold tracking-tighter leading-[0.95] text-gradient-silver text-balance">{product.name}</h1>
              <button
                onClick={() => {
                  onToggleFavorite(product.id);
                  ui.toast(fav ? 'Removed from favorites' : 'Saved to favorites', fav ? 'info' : 'success');
                }}
                aria-pressed={fav}
                aria-label={fav ? 'Remove from favorites' : 'Save to favorites'}
                className={`mt-2 w-12 h-12 rounded-full border flex items-center justify-center transition-all active:scale-90 shrink-0 ${fav ? 'bg-teal-300/20 border-teal-200/50 text-teal-200 shadow-[0_0_24px_-2px_rgba(45,212,191,0.8)]' : 'bg-white/5 border-white/15 text-zinc-300 hover:text-white'}`}
              >
                <Heart className={`w-5 h-5 ${fav ? 'fill-current' : ''}`} />
              </button>
            </div>

            {male && female && (
              <p className="mt-4 font-mono text-sm uppercase tracking-wider text-zinc-400">
                {male} <span style={{ color: theme.accent }}>×</span> {female}
              </p>
            )}

            <p className="mt-6 text-lg text-zinc-300/90 leading-relaxed whitespace-pre-line">{rich(product.description.split('\n\n')[0])}</p>

            {/* stat strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8">
              {[
                { i: Zap, l: 'THC', v: formatPotency(product.thc) },
                { i: Activity, l: 'CBD', v: formatPotency(product.cbd) },
                ...(growable
                  ? [
                      { i: Clock, l: 'Flower', v: product.floweringTime.replace(' weeks', 'w') },
                      { i: Droplets, l: 'Level', v: product.difficulty },
                    ]
                  : [{ i: Leaf, l: 'Type', v: 'Natural' }]),
              ].map((x) => (
                <div key={x.l} className="spot glass rounded-2xl p-4">
                  <div className="relative z-10">
                    <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.18em] font-bold text-zinc-500 mb-1.5"><x.i className="w-3.5 h-3.5" style={{ color: theme.accent }} /> {x.l}</div>
                    <div className="font-mono font-semibold text-white uppercase text-[15px]">{x.v}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* buy panel */}
            <div className="hidden lg:block glass-strong rounded-[2rem] p-6 mt-8">
              <div className="flex items-end justify-between mb-5">
                <div>
                  <div className="text-[10px] uppercase tracking-[0.22em] text-zinc-500 mb-1">{growable ? 'Per seed' : 'Price'}</div>
                  <div className="text-5xl font-extrabold tracking-tighter text-white"><span className="text-xl align-top text-zinc-400 mr-1">$</span>{product.price}</div>
                </div>
                <div className="flex items-center rounded-full bg-white/[0.06] border border-white/10 h-14">
                  <button aria-label="Decrease" onClick={() => setQty(Math.max(1, qty - 1))} className="w-12 h-full flex items-center justify-center text-zinc-400 hover:text-white"><Minus className="w-4 h-4" /></button>
                  <span className="w-8 text-center font-mono font-bold text-white tabular-nums">{qty}</span>
                  <button aria-label="Increase" onClick={() => setQty(qty + 1)} className="w-12 h-full flex items-center justify-center text-zinc-400 hover:text-white"><Plus className="w-4 h-4" /></button>
                </div>
              </div>
              <button onClick={add} className="btn-primary w-full h-14 text-base">
                {added ? <><Check className="w-5 h-5" strokeWidth={3} /> Added to stash</> : <><Plus className="w-5 h-5" strokeWidth={3} /> Add {qty > 1 ? `${qty} ` : ''}to stash · ${(product.price * qty).toFixed(2)}</>}
              </button>
              {growable && (
                <div className="mt-5 rounded-2xl bg-black/25 border border-white/[0.08] p-4">
                  <div className="flex items-center justify-between text-xs mb-2.5">
                    <span className="flex items-center gap-2 text-zinc-300"><Gift className="w-4 h-4 text-teal-300" /> Buy 4, get 1 free</span>
                    <span className="text-zinc-500 font-mono">{4 - toFree}/4</span>
                  </div>
                  <div className="grid grid-cols-4 gap-1.5">
                    {[0, 1, 2, 3].map((n) => (
                      <div key={n} className="h-1.5 rounded-full" style={{ background: n < 4 - toFree ? 'linear-gradient(90deg,#6ff3c1,#14b8a6)' : 'rgba(255,255,255,0.12)' }} />
                    ))}
                  </div>
                  <div className="text-[11px] text-zinc-500 mt-2.5">
                    {paidSeeds === 0 ? 'Add four seeds and pick a free one.' : `${toFree} more seed${toFree > 1 ? 's' : ''} in your stash for a free one.`}
                  </div>
                </div>
              )}
              <div className="grid grid-cols-2 gap-2 mt-4">
                <button onClick={onAskGene} className="btn-glass h-12 text-sm"><Bot className="w-4 h-4 text-teal-300" /> Ask Gene</button>
                <button onClick={onGoCart} className="btn-glass h-12 text-sm">View stash <ArrowRight className="w-4 h-4" /></button>
              </div>
            </div>

            <div className="flex flex-wrap gap-x-6 gap-y-2 mt-6 text-sm text-zinc-400">
              <span className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-teal-300" /> Germination guarantee</span>
              <span className="flex items-center gap-2"><Truck className="w-4 h-4 text-teal-300" /> Free shipping over $100</span>
            </div>
          </div>
        </div>

        {/* ───── body sections ───── */}
        <div className="mt-24 md:mt-36 space-y-24 md:space-y-36">
          {/* About */}
          <Section eyebrow="01 / The genetic" title={<>About <span className="font-display italic font-normal text-gradient">{product.name.split(' ')[0].toLowerCase()}</span></>}>
            <div className="grid lg:grid-cols-[1.3fr_1fr] gap-8">
              <div className="glass rounded-[2rem] p-7 md:p-9">
                <p className="relative z-10 text-zinc-300/90 text-[17px] leading-[1.8] whitespace-pre-line">{rich(product.description)}</p>
                <dl className="relative z-10 mt-8 pt-6 border-t border-white/10 grid grid-cols-2 gap-x-6 gap-y-5">
                  {[
                    ['Type', product.type],
                    growable ? ['Flowering', product.floweringTime] : null,
                    growable ? ['Difficulty', product.difficulty] : null,
                    ['Harvest lot', product.harvestDate || '—'],
                    male ? ['Pollen donor', male] : null,
                    female ? ['Mother', female] : null,
                  ].filter(Boolean).map((r) => (
                    <div key={(r as string[])[0]}>
                      <dt className="text-[10px] uppercase tracking-[0.2em] font-bold text-zinc-500">{(r as string[])[0]}</dt>
                      <dd className="text-white font-semibold mt-1 uppercase text-sm">{(r as string[])[1]}</dd>
                    </div>
                  ))}
                </dl>
              </div>
              <div className="space-y-4">
                {[{ l: 'THC', v: product.thc }, { l: 'CBD', v: product.cbd }].map((m) => (
                  <div key={m.l} className="glass rounded-[1.75rem] p-6">
                    <div className="relative z-10">
                      <div className="flex justify-between items-baseline mb-3">
                        <span className="eyebrow !text-zinc-400">{m.l} profile</span>
                        <span className="font-mono text-2xl font-semibold text-white">{formatPotency(m.v)}</span>
                      </div>
                      <div className="h-2.5 rounded-full bg-white/10 overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${meter(m.v)}%`, background: `linear-gradient(90deg, ${theme.accent}, #6ff3c1)`, boxShadow: `0 0 16px ${theme.accent}` }} />
                      </div>
                      <div className="flex justify-between text-[10px] text-zinc-600 mt-2 font-mono uppercase"><span>Low</span><span>Med</span><span>High</span></div>
                    </div>
                  </div>
                ))}
                <div className="glass rounded-[1.75rem] p-6">
                  <div className="relative z-10 flex items-center gap-4">
                    <span className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0" style={{ background: `${theme.accent}26`, color: theme.tint }}><Layers className="w-6 h-6" /></span>
                    <div>
                      <div className="text-white font-bold">{product.type} family</div>
                      <div className="text-sm text-zinc-400">{sameType.length ? `${sameType.length} more ${product.type.toLowerCase()} genetics in the bank` : 'Unique in its family'}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Section>

          {/* Lineage */}
          {growable && male && female && (
            <Section id="lineage" eyebrow="02 / Lineage" title={<>The <span className="font-display italic font-normal text-gradient">family tree</span></>}>
              <div className="glass rounded-[2.5rem] p-6 md:p-12 relative overflow-hidden">
                <HempLeaf className="absolute -right-12 -bottom-12 w-80 opacity-[0.05] rotate-[-14deg]" veins />
                <div className="relative z-10 grid md:grid-cols-2 gap-5 md:gap-24">
                  {[
                    { icon: '♂', role: 'Male pollen donor', name: male, breeder: maleBreeder, others: sameDonor },
                    { icon: '♀', role: 'Female mother', name: female, breeder: femaleBreeder, others: sameMother },
                  ].map((p) => (
                    <div key={p.role} className="rounded-3xl bg-black/30 border border-white/10 p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <span className="w-9 h-9 rounded-full flex items-center justify-center text-lg font-bold" style={{ background: `${theme.accent}30`, color: theme.tint }}>{p.icon}</span>
                        <span className="text-[11px] uppercase tracking-[0.2em] font-bold text-zinc-400">{p.role}</span>
                      </div>
                      <div className="text-2xl font-extrabold text-white uppercase tracking-tight leading-tight">{p.name}</div>
                      {p.breeder && <div className="text-xs text-zinc-500 mt-1 uppercase tracking-widest">{p.breeder}</div>}
                      <div className="text-xs text-zinc-400 mt-4">
                        {p.others.length ? <>Also behind <b className="text-white">{p.others.length}</b> other genetic{p.others.length > 1 ? 's' : ''} in our bank</> : 'Used exclusively in this cross'}
                      </div>
                    </div>
                  ))}
                </div>
                <svg viewBox="0 0 100 30" preserveAspectRatio="none" className="relative z-10 hidden md:block w-full h-24 -my-1" aria-hidden>
                  <defs>
                    <linearGradient id="treegrad" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0" stopColor={theme.accent} stopOpacity="0.1" />
                      <stop offset="1" stopColor={theme.accent} />
                    </linearGradient>
                  </defs>
                  <path d="M25 0 C25 16, 50 12, 50 30" fill="none" stroke="url(#treegrad)" strokeWidth="1.2" vectorEffect="non-scaling-stroke" strokeDasharray="4 4" />
                  <path d="M75 0 C75 16, 50 12, 50 30" fill="none" stroke="url(#treegrad)" strokeWidth="1.2" vectorEffect="non-scaling-stroke" strokeDasharray="4 4" />
                </svg>
                <div className="relative z-10 mt-5 md:mt-0 mx-auto w-fit max-w-full rounded-3xl px-8 py-5 text-center border" style={{ borderColor: `${theme.accent}88`, background: `${theme.accent}1c`, boxShadow: `0 0 60px -14px ${theme.accent}` }}>
                  <div className="text-[10px] uppercase tracking-[0.28em] font-bold" style={{ color: theme.tint }}>The cross</div>
                  <div className="text-2xl md:text-3xl font-extrabold text-white uppercase tracking-tight">{product.name}</div>
                </div>
              </div>
            </Section>
          )}

          {/* Grow guide */}
          {growable && weeks && (
            <Section id="grow" eyebrow="03 / Grow guide" title={<>Seed to <span className="font-display italic font-normal text-gradient">harvest</span></>}>
              <div className="glass rounded-[2.5rem] p-6 md:p-10 mb-5">
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-5">
                    <span className="eyebrow !text-zinc-400">Typical indoor timeline</span>
                    <span className="text-xs text-zinc-500 font-mono">≈ {Math.round(totalW)} weeks end to end</span>
                  </div>
                  <div className="flex gap-1.5 h-5">
                    {timeline.map((t) => (
                      <div key={t.l} className="rounded-full" style={{ flex: t.w, background: `linear-gradient(90deg, ${t.c}, ${t.c}aa)`, boxShadow: t.l === 'Flowering' ? `0 0 20px ${t.c}` : 'none', opacity: t.l === 'Flowering' ? 1 : 0.75 }} />
                    ))}
                  </div>
                  <div className="flex gap-1.5 mt-4">
                    {timeline.map((t) => (
                      <div key={t.l} style={{ flex: t.w }} className="min-w-0">
                        <div className={`text-[11px] md:text-xs font-bold truncate ${t.l === 'Flowering' ? 'text-white' : 'text-zinc-300'}`}>{t.l}</div>
                        <div className="text-[10px] md:text-[11px] font-mono text-zinc-500 truncate">{t.d}</div>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-zinc-500 mt-6">Flowering time is specific to this genetic. Other phases are typical indoor averages and vary with your setup.</p>
                </div>
              </div>
              <div className="grid md:grid-cols-3 gap-4">
                {TIPS[product.difficulty].map((t, i) => (
                  <div key={t.title} className="spot glass rounded-[1.75rem] p-6">
                    <div className="relative z-10">
                      <span className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-black mb-4" style={{ background: `${theme.accent}26`, color: theme.tint }}>{i + 1}</span>
                      <div className="text-lg font-bold text-white mb-1.5">{t.title}</div>
                      <p className="text-sm text-zinc-400 leading-relaxed">{t.body}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* Clean standard */}
          <Section eyebrow={growable ? '04 / The standard' : '02 / The standard'} title={<>Grown the <span className="font-display italic font-normal text-gradient">clean</span> way</>}>
            <div className="grid lg:grid-cols-[1fr_1.1fr] gap-5">
              <div className="glass rounded-[2rem] p-7">
                <div className="relative z-10 grid grid-cols-2 gap-4">
                  {[
                    { i: FlaskConical, l: 'Harvest lot', v: product.harvestDate || '—' },
                    { i: Microscope, l: 'Testing', v: 'HLVd-tested mothers' },
                    { i: Sprout, l: 'Method', v: 'Organic, living soil' },
                    { i: Sparkles, l: 'Batch', v: 'Small, pheno-hunted' },
                  ].map((x) => (
                    <div key={x.l} className="rounded-2xl bg-black/25 border border-white/[0.07] p-4">
                      <x.i className="w-5 h-5 mb-3" style={{ color: theme.accent }} />
                      <div className="text-[10px] uppercase tracking-[0.18em] text-zinc-500 font-bold">{x.l}</div>
                      <div className="text-sm font-semibold text-white mt-1">{x.v}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="glass rounded-[2rem] p-7">
                <ul className="relative z-10 space-y-3.5">
                  {CLEAN_STANDARD.map((c) => (
                    <li key={c} className="flex items-center gap-3.5 text-zinc-200">
                      <span className="w-7 h-7 rounded-full bg-teal-300/15 text-teal-200 flex items-center justify-center shrink-0"><Check className="w-4 h-4" strokeWidth={3} /></span>
                      {c}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Section>

          {/* Related */}
          {[
            { t: 'From the same pollen donor', k: 'Pollen', list: sameDonor, sub: male },
            { t: 'From the same mother', k: 'Mother', list: sameMother, sub: female },
            { t: `More ${product.type.toLowerCase()} genetics`, k: product.type, list: sameType.filter((p) => !sameDonor.includes(p) && !sameMother.includes(p)).slice(0, 6), sub: undefined },
            { t: 'More from the medicine cabinet', k: 'Meds', list: others, sub: undefined },
          ]
            .filter((r) => r.list.length)
            .map((r) => (
              <Section key={r.t} eyebrow={r.k} title={r.t}>
                {r.sub && <div className="-mt-5 mb-7 font-mono text-sm uppercase tracking-wider text-zinc-500">{r.sub}</div>}
                <div className="flex gap-4 overflow-x-auto no-scrollbar pb-3 -mx-4 px-4 md:mx-0 md:px-0 snap-x">
                  {r.list.map((p) => {
                    const th = packTheme(p.id, p.type);
                    return (
                      <button key={p.id} onClick={() => onOpen(p)} className="spot glass group snap-start shrink-0 w-56 rounded-[1.75rem] overflow-hidden text-left transition-transform duration-500 hover:-translate-y-1.5">
                        <StrainArt id={p.id} type={p.type} noGlyph still className="h-64 w-full">
                          <div className="absolute inset-x-0 top-5 bottom-3 flex justify-center">
                            <SeedPack product={p} className="h-full transition-transform duration-500 group-hover:scale-105 group-hover:-rotate-2" />
                          </div>
                        </StrainArt>
                        <div className="p-4 relative z-10">
                          <div className="text-sm font-extrabold text-white leading-tight line-clamp-2 min-h-[2.4em]">{p.name}</div>
                          <div className="flex items-center justify-between mt-2 text-xs">
                            <span style={{ color: th.tint }}>{p.type}</span>
                            <span className="font-mono text-zinc-300">${p.price}</span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </Section>
            ))}

          {/* FAQ */}
          <Section eyebrow="Good to know" title="Questions, answered">
            <div className="grid gap-3 max-w-3xl">
              {FAQ.map((f, i) => (
                <div key={f.q} className="glass rounded-3xl overflow-hidden">
                  <button onClick={() => setFaq(faq === i ? null : i)} aria-expanded={faq === i} className="relative z-10 w-full flex items-center justify-between gap-4 text-left px-6 py-5">
                    <span className="font-bold text-white">{f.q}</span>
                    <ChevronDown className={`w-5 h-5 text-zinc-400 shrink-0 transition-transform duration-300 ${faq === i ? 'rotate-180' : ''}`} />
                  </button>
                  <div className={`grid transition-all duration-500 ease-out ${faq === i ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                    <div className="overflow-hidden"><p className="relative z-10 px-6 pb-6 text-sm text-zinc-400 leading-relaxed">{f.a}</p></div>
                  </div>
                </div>
              ))}
            </div>
          </Section>

          {/* prev / next */}
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { p: prev, dir: 'Previous', Icon: ArrowLeft },
              { p: next, dir: 'Next', Icon: ArrowRight },
            ].map(({ p, dir, Icon }) => (
              <button key={dir} onClick={() => onOpen(p)} className="spot glass group rounded-[2rem] p-6 flex items-center gap-5 text-left transition-transform duration-500 hover:-translate-y-1" style={{ flexDirection: dir === 'Next' ? 'row-reverse' : 'row' }}>
                <StrainArt id={p.id} type={p.type} still noGlyph className="w-20 h-24 rounded-2xl shrink-0">
                  <div className="absolute inset-1 flex justify-center"><SeedPack product={p} className="h-full" /></div>
                </StrainArt>
                <div className="relative z-10 flex-1" style={{ textAlign: dir === 'Next' ? 'right' : 'left' }}>
                  <div className="eyebrow !text-zinc-500 !text-[10px] flex items-center gap-2" style={{ justifyContent: dir === 'Next' ? 'flex-end' : 'flex-start' }}>
                    {dir === 'Previous' && <Icon className="w-3 h-3" />} {dir} {dir === 'Next' && <Icon className="w-3 h-3" />}
                  </div>
                  <div className="text-xl font-extrabold text-white tracking-tight mt-1">{p.name}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* mobile / tablet sticky buy bar */}
      <div className="lg:hidden fixed inset-x-0 bottom-[5.6rem] md:bottom-4 z-40 px-3 pointer-events-none">
        <div className="glass-bar pointer-events-auto rounded-full p-2 pl-5 flex items-center gap-3 max-w-xl mx-auto">
          <div className="leading-none">
            <div className="text-[9px] uppercase tracking-widest text-zinc-500">Total</div>
            <div className="text-xl font-extrabold text-white">${(product.price * qty).toFixed(2)}</div>
          </div>
          <div className="flex items-center rounded-full bg-white/[0.07] border border-white/10 h-11 ml-auto">
            <button aria-label="Decrease" onClick={() => setQty(Math.max(1, qty - 1))} className="w-9 h-full flex items-center justify-center text-zinc-300"><Minus className="w-3.5 h-3.5" /></button>
            <span className="w-5 text-center font-mono font-bold text-white text-sm">{qty}</span>
            <button aria-label="Increase" onClick={() => setQty(qty + 1)} className="w-9 h-full flex items-center justify-center text-zinc-300"><Plus className="w-3.5 h-3.5" /></button>
          </div>
          <button onClick={add} className="btn-primary h-11 px-5 text-sm">{added ? <Check className="w-4 h-4" strokeWidth={3} /> : <Plus className="w-4 h-4" strokeWidth={3} />} {added ? 'Added' : 'Add'}</button>
        </div>
      </div>
    </div>
  );
};

export default ProductPage;
