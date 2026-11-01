import React, { useEffect, useMemo, useState } from 'react';
import { Bell, BellRing, ChevronDown, Search, Dna, ArrowUpRight, Wind, GitFork, Info } from 'lucide-react';
import { Product, StrainType, ViewState } from '../types';
import { CountUp, Reveal } from './Motion';
import HempLeaf from './HempLeaf';
import { themeFor } from '../lib/strainTheme';
import { ui } from '../lib/ui';

type Mode = 'POLLEN' | 'CLONES';

interface Entry {
  key: string;
  breeder: string;
  name: string;
  crosses: Product[];
}

/** Split "BREEDER – LINE" (or "BREEDER (CREW) LINE") into its parts. */
const parse = (raw: string) => {
  if (raw.includes('–')) {
    const [b, ...rest] = raw.split('–');
    return { breeder: b.trim(), name: rest.join('–').trim() };
  }
  const m = raw.match(/^(.*?\))\s+(.*)$/);
  return m ? { breeder: m[1].trim(), name: m[2].trim() } : { breeder: 'Independent', name: raw.trim() };
};

const COPY: Record<Mode, { icon: React.ElementType; eyebrow: string; title: string; accent: string; sub: string; unit: string; role: string; note: string }> = {
  POLLEN: {
    icon: Wind,
    eyebrow: 'Breeding stock',
    title: 'Pollen Library',
    accent: 'donors',
    sub: 'Every male line used across our catalog, with the exact crosses it fathered. Pollen sales open soon: watch a donor to flag your interest.',
    unit: 'donor',
    role: 'Male pollen donor',
    note: 'Pollen is a breeding product. Availability, pricing and shipping regions are announced per donor.',
  },
  CLONES: {
    icon: GitFork,
    eyebrow: 'Elite verified cuts',
    title: 'Mother Library',
    accent: 'mothers',
    sub: 'The female mothers behind our seeds, and every cross each one anchors. Verified cuts are coming; watch a mother to flag your interest.',
    unit: 'mother',
    role: 'Female mother plant',
    note: 'Clones and live plants are USA-only due to agricultural restrictions.',
  },
};

const STORE = 'clean_genetics_watchlist';
const readWatch = (): string[] => {
  try {
    return JSON.parse(localStorage.getItem(STORE) || '[]');
  } catch {
    return [];
  }
};

interface Props {
  mode: Mode;
  catalog: Product[];
  onNavigate: (v: ViewState) => void;
  onOpenStrain: (name: string) => void;
}

const GeneticsLibrary: React.FC<Props> = ({ mode, catalog, onNavigate, onOpenStrain }) => {
  const c = COPY[mode];
  const [q, setQ] = useState('');
  const [breeder, setBreeder] = useState('All');
  const [sort, setSort] = useState<'USED' | 'AZ'>('USED');
  const [open, setOpen] = useState<string | null>(null);
  const [watch, setWatch] = useState<string[]>(readWatch);

  useEffect(() => {
    try {
      localStorage.setItem(STORE, JSON.stringify(watch));
    } catch {}
  }, [watch]);

  const entries = useMemo<Entry[]>(() => {
    const map = new Map<string, Entry>();
    catalog.forEach((p) => {
      const raw = mode === 'POLLEN' ? p.malePollen : p.femalePlant;
      if (!raw) return;
      const { breeder, name } = parse(raw);
      const key = `${mode}:${raw}`;
      if (!map.has(key)) map.set(key, { key, breeder, name, crosses: [] });
      map.get(key)!.crosses.push(p);
    });
    return [...map.values()];
  }, [catalog, mode]);

  const breeders = useMemo(() => ['All', ...Array.from(new Set(entries.map((e) => e.breeder))).sort()], [entries]);

  const shown = useMemo(() => {
    let list = entries.filter((e) => (breeder === 'All' || e.breeder === breeder) && (e.name + e.breeder).toLowerCase().includes(q.toLowerCase()));
    list = [...list].sort((a, b) => (sort === 'USED' ? b.crosses.length - a.crosses.length || a.name.localeCompare(b.name) : a.name.localeCompare(b.name)));
    return list;
  }, [entries, breeder, q, sort]);

  const toggleWatch = (e: Entry) => {
    setWatch((w) => {
      const on = w.includes(e.key);
      ui.toast(on ? `Stopped watching ${e.name}` : `Watching ${e.name}`, on ? 'info' : 'success');
      return on ? w.filter((k) => k !== e.key) : [...w, e.key];
    });
  };

  const mostUsed = entries.reduce((m, e) => Math.max(m, e.crosses.length), 1);
  const watched = entries.filter((e) => watch.includes(e.key)).length;
  const Icon = c.icon;

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-10 pb-24">
      {/* ───── hero ───── */}
      <section className="relative glass rounded-[2.5rem] overflow-hidden mb-8 p-7 md:p-12">
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(60% 90% at 100% 0%, rgba(16,185,129,0.28), transparent 65%), radial-gradient(50% 80% at 0% 100%, rgba(18,210,143,0.22), transparent 65%)' }} />
        <HempLeaf className="absolute -right-10 -top-10 w-[22rem] md:w-[30rem] opacity-[0.07] rotate-12 animate-floaty" veins />
        <div className="relative grid lg:grid-cols-[1.3fr_1fr] gap-10 items-end">
          <div>
            <span className="chip mb-5 text-teal-200"><Icon className="w-3.5 h-3.5" /> {c.eyebrow}</span>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter leading-[0.95] text-gradient-silver">
              {c.title.split(' ')[0]} <span className="font-display italic font-normal text-gradient">{c.title.split(' ')[1]}</span>
            </h1>
            <p className="text-zinc-300 text-lg mt-5 max-w-xl">{c.sub}</p>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              { n: entries.length, l: c.accent },
              { n: breeders.length - 1, l: 'breeders' },
              { n: catalog.filter((p) => (mode === 'POLLEN' ? p.malePollen : p.femalePlant)).length, l: 'crosses' },
            ].map((s) => (
              <div key={s.l} className="rounded-2xl bg-black/25 border border-white/10 p-4 text-center">
                <div className="text-3xl md:text-4xl font-extrabold tracking-tighter text-gradient"><CountUp to={s.n} /></div>
                <div className="text-[10px] uppercase tracking-[0.2em] text-zinc-400 font-semibold mt-1">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───── controls ───── */}
      <div className="glass rounded-[1.75rem] p-3 mb-8 flex flex-col lg:flex-row gap-3 lg:items-center">
        <div className="relative lg:w-64 shrink-0">
          <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={`Search ${c.accent}…`} className="w-full bg-white/[0.06] border border-white/10 rounded-full pl-11 pr-4 h-12 text-sm text-white" />
        </div>
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar flex-1 min-w-0">
          {breeders.map((b) => (
            <button key={b} onClick={() => setBreeder(b)} className={`h-12 px-4 rounded-full text-[13px] font-semibold whitespace-nowrap border transition-all ${breeder === b ? 'bg-white/15 border-white/30 text-white' : 'bg-white/[0.04] border-white/10 text-zinc-400 hover:text-white'}`}>
              {b === 'All' ? 'All breeders' : b}
            </button>
          ))}
        </div>
        <div className="relative">
          <select value={sort} onChange={(e) => setSort(e.target.value as any)} aria-label="Sort" className="appearance-none bg-white/[0.06] border border-white/10 rounded-full pl-5 pr-9 h-12 text-sm text-white w-full">
            <option value="USED">Most crosses</option>
            <option value="AZ">A → Z</option>
          </select>
          <ChevronDown className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
        </div>
      </div>

      {/* ───── cards ───── */}
      {shown.length === 0 ? (
        <div className="glass rounded-[2rem] text-center py-20 text-zinc-400">No {c.accent} match your search.</div>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5 items-start">
          {shown.map((e, i) => {
            const isOpen = open === e.key;
            const on = watch.includes(e.key);
            const pct = (e.crosses.length / mostUsed) * 100;
            const types = Array.from(new Set(e.crosses.map((p) => p.type)));
            const accent = themeFor(types[0] ?? StrainType.HYBRID).accent;
            return (
              <Reveal key={e.key} delay={Math.min(i, 8) * 60}>
                <article className="spot glass rounded-[2rem] p-6 overflow-hidden">
                  <div className="relative z-10">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="eyebrow !text-[10px] !text-zinc-400 mb-2 truncate">{e.breeder}</div>
                        <h3 className="text-2xl font-extrabold tracking-tight text-white uppercase leading-tight">{e.name}</h3>
                        <div className="text-xs text-zinc-500 mt-1">{c.role}</div>
                      </div>
                      {/* usage ring */}
                      <div className="relative w-16 h-16 shrink-0">
                        <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                          <circle cx="18" cy="18" r="15.5" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="3" />
                          <circle cx="18" cy="18" r="15.5" fill="none" stroke={accent} strokeWidth="3" strokeLinecap="round" strokeDasharray={`${(pct / 100) * 97.4} 97.4`} style={{ filter: `drop-shadow(0 0 4px ${accent})` }} />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center leading-none">
                          <span className="text-xl font-extrabold text-white" title={`${e.crosses.length} cross${e.crosses.length > 1 ? 'es' : ''}`}>{e.crosses.length}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1.5 mt-5">
                      {types.map((t) => (
                        <span key={t} className="chip !text-[9px]" style={{ color: themeFor(t).tint, background: `${themeFor(t).accent}1f`, borderColor: `${themeFor(t).accent}55` }}>{t}</span>
                      ))}
                    </div>

                    <div className="flex gap-2 mt-5">
                      <button onClick={() => toggleWatch(e)} aria-pressed={on} className={`flex-1 h-11 rounded-full text-[13px] ${on ? 'btn-primary' : 'btn-glass'}`}>
                        {on ? <BellRing className="w-4 h-4" /> : <Bell className="w-4 h-4" />} {on ? 'Watching' : 'Watch'}
                      </button>
                      <button onClick={() => setOpen(isOpen ? null : e.key)} aria-expanded={isOpen} className="btn-glass h-11 px-4 text-[13px]">
                        Crosses <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                      </button>
                    </div>

                    <div className={`grid transition-all duration-500 ease-out ${isOpen ? 'grid-rows-[1fr] opacity-100 mt-4' : 'grid-rows-[0fr] opacity-0'}`}>
                      <div className="overflow-hidden">
                        <ul className="space-y-1.5">
                          {e.crosses.map((p) => (
                            <li key={p.id}>
                              <button onClick={() => onOpenStrain(p.name)} className="w-full flex items-center gap-3 text-left rounded-2xl bg-black/25 border border-white/[0.07] hover:bg-white/10 px-3 py-2.5 transition-colors group">
                                <span className="w-2 h-2 rounded-full shrink-0" style={{ background: themeFor(p.type).accent, boxShadow: `0 0 8px ${themeFor(p.type).accent}` }} />
                                <span className="flex-1 text-sm font-semibold text-white truncate">{p.name}</span>
                                <ArrowUpRight className="w-4 h-4 text-zinc-500 group-hover:text-white transition-colors" />
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </article>
              </Reveal>
            );
          })}
        </div>
      )}

      {/* ───── footer strip ───── */}
      <Reveal>
        <div className="mt-10 grid md:grid-cols-[1fr_auto] gap-4 items-center glass rounded-[2rem] p-6">
          <div className="flex items-start gap-4">
            <span className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center shrink-0"><Info className="w-5 h-5 text-teal-200" /></span>
            <div>
              <div className="font-bold text-white">{watched ? `You're watching ${watched} ${c.unit}${watched > 1 ? 's' : ''}` : 'Nothing on your watchlist yet'}</div>
              <p className="text-sm text-zinc-400 mt-0.5">{c.note} Your watchlist is saved in this browser.</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => onNavigate('SHOP')} className="btn-primary h-12 px-6 text-sm"><Dna className="w-4 h-4" /> Browse seeds</button>
            <button onClick={() => onNavigate('ASSISTANT')} className="btn-glass h-12 px-6 text-sm">Ask Gene</button>
          </div>
        </div>
      </Reveal>
    </div>
  );
};

export default GeneticsLibrary;
