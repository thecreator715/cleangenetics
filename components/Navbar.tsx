import React, { useLayoutEffect, useRef, useState, useEffect } from 'react';
import { Heart, ShoppingBag, Home, Sprout, ShoppingCart, Info, GitFork, Wind, Pill, Package, Search, Grid, X } from 'lucide-react';
import { ViewState } from '../types';
import HempLeaf from './HempLeaf';

interface NavbarProps {
  currentView: ViewState;
  setView: (view: ViewState) => void;
  cartCount: number;
  onOpenSearch: () => void;
  favCount?: number;
  onOpenFavorites?: () => void;
}

export const MarijuanaLeaf = ({ className, style }: { className?: string; style?: React.CSSProperties }) => (
  <HempLeaf className={className} style={style} />
);

const NAV_ITEMS: { view: ViewState; icon: React.ElementType; label: string }[] = [
  { view: 'HOME', icon: Home, label: 'Home' },
  { view: 'SHOP', icon: ShoppingBag, label: 'Seeds' },
  { view: 'CLONES', icon: GitFork, label: 'Clones' },
  { view: 'POLLEN', icon: Wind, label: 'Pollen' },
  { view: 'MEDICINES', icon: Pill, label: 'Meds' },
  { view: 'ASSISTANT', icon: Sprout, label: 'AI Grow' },
  { view: 'ORDERS', icon: Package, label: 'Orders' },
  { view: 'ABOUT', icon: Info, label: 'About' },
];

const Logo: React.FC<{ onClick: () => void; compact?: boolean }> = ({ onClick, compact }) => (
  <button onClick={onClick} className="group flex items-center gap-2.5 pl-1.5 pr-2" aria-label="Clean Genetics home">
    <span className="relative w-9 h-9 rounded-xl flex items-center justify-center overflow-hidden bg-gradient-to-br from-emerald-300 to-teal-500 shadow-[0_0_24px_-4px_rgba(20,184,166,0.7)] transition-transform duration-500 group-hover:rotate-[14deg] group-hover:scale-105">
      <MarijuanaLeaf className="w-5 h-5 text-[#04140e]" />
    </span>
    {!compact && (
      <span className="leading-none text-left">
        <span className="block text-[13px] font-extrabold tracking-[0.18em] text-white">CLEAN</span>
        <span className="block text-[9px] font-semibold tracking-[0.34em] text-zinc-400 mt-0.5">GENETICS</span>
      </span>
    )}
  </button>
);

const CartButton: React.FC<{ count: number; active: boolean; onClick: () => void }> = ({ count, active, onClick }) => (
  <button
    onClick={onClick}
    aria-label={`Open stash, ${count} items`}
    className={`relative w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 border ${
      active ? 'bg-white/15 border-white/30 text-white' : 'bg-white/5 border-white/10 text-zinc-300 hover:text-white hover:bg-white/12'
    }`}
  >
    <ShoppingCart className="w-[18px] h-[18px]" />
    {count > 0 && (
      <span
        key={count}
        className="animate-pop absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-gradient-to-br from-emerald-300 to-teal-400 text-[#03140d] text-[10px] font-extrabold flex items-center justify-center shadow-[0_0_14px_rgba(20,184,166,0.7)]"
      >
        {count}
      </span>
    )}
  </button>
);

const Navbar: React.FC<NavbarProps> = ({ currentView, setView, cartCount, onOpenSearch, favCount = 0, onOpenFavorites }) => {
  const rail = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [pill, setPill] = useState<{ x: number; w: number } | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);

  // Sliding active indicator
  const measure = () => {
    const el = itemRefs.current[currentView];
    const parent = rail.current;
    if (!el || !parent) return setPill(null);
    setPill({ x: el.offsetLeft, w: el.offsetWidth });
  };
  useLayoutEffect(measure, [currentView]);
  useEffect(() => {
    window.addEventListener('resize', measure);
    const t = setTimeout(measure, 350); // after label expand transition
    return () => {
      window.removeEventListener('resize', measure);
      clearTimeout(t);
    };
  }, [currentView]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const go = (v: ViewState) => {
    setMoreOpen(false);
    setView(v);
  };

  const moreItems = NAV_ITEMS.filter((i) => ['CLONES', 'POLLEN', 'MEDICINES', 'ORDERS', 'ABOUT'].includes(i.view));
  const moreActive = moreItems.some((i) => i.view === currentView);

  return (
    <>
      {/* ───────── Desktop / tablet: floating glass pill ───────── */}
      <header className="hidden md:flex fixed top-4 inset-x-0 z-50 justify-center px-4 pointer-events-none">
        <nav
          className={`glass-bar pointer-events-auto rounded-full flex items-center gap-2 pl-2 pr-2 py-2 transition-all duration-500 ${
            scrolled ? 'shadow-[0_24px_60px_-16px_rgba(0,0,0,0.9)] bg-[rgba(3,9,8,0.72)]' : ''
          }`}
        >
          <Logo onClick={() => go('HOME')} />
          <span className="w-px h-6 bg-white/10 mx-1" />

          <div ref={rail} className="relative flex items-center gap-0.5">
            {pill && (
              <span
                aria-hidden
                className="absolute top-0 bottom-0 rounded-full bg-gradient-to-b from-white/20 to-white/[0.07] border border-white/20 shadow-[0_0_22px_-4px_rgba(20,184,166,0.55),0_1px_0_rgba(255,255,255,0.3)_inset] transition-all duration-500 ease-[cubic-bezier(.34,1.3,.5,1)]"
                style={{ left: pill.x, width: pill.w }}
              />
            )}
            {NAV_ITEMS.map((item) => {
              const active = currentView === item.view;
              return (
                <button
                  key={item.view}
                  ref={(el) => { itemRefs.current[item.view] = el; }}
                  onClick={() => go(item.view)}
                  title={item.label}
                  aria-current={active ? 'page' : undefined}
                  className={`relative z-10 h-10 px-3 rounded-full flex items-center gap-2 text-[13px] font-semibold transition-colors duration-300 ${
                    active ? 'text-white' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <item.icon className={`w-4 h-4 transition-colors ${active ? 'text-emerald-300' : ''}`} />
                  <span className={`${active ? 'inline' : 'hidden xl:inline'} whitespace-nowrap`}>{item.label}</span>
                </button>
              );
            })}
          </div>

          <span className="w-px h-6 bg-white/10 mx-1" />
          <button
            onClick={onOpenSearch}
            className="hidden lg:flex h-10 items-center gap-2 pl-3 pr-2 rounded-full bg-white/5 border border-white/10 text-zinc-400 hover:text-white hover:bg-white/10 transition-colors text-[13px]"
            aria-label="Search and jump (Command K)"
          >
            <Search className="w-4 h-4" />
            <span>Search</span>
            <kbd className="ml-3 px-1.5 py-0.5 rounded-md bg-white/10 text-[10px] font-mono text-zinc-300">⌘K</kbd>
          </button>
          <button
            onClick={onOpenSearch}
            className="lg:hidden w-10 h-10 rounded-full bg-white/5 border border-white/10 text-zinc-300 hover:text-white flex items-center justify-center"
            aria-label="Search"
          >
            <Search className="w-4 h-4" />
          </button>
          <button
            onClick={onOpenFavorites}
            aria-label={`Favorites, ${favCount} saved`}
            className="relative w-10 h-10 rounded-full bg-white/5 border border-white/10 text-zinc-300 hover:text-white hover:bg-white/12 flex items-center justify-center transition-colors"
          >
            <Heart className={`w-[18px] h-[18px] ${favCount ? 'fill-teal-300 text-teal-300' : ''}`} />
            {favCount > 0 && <span key={favCount} className="animate-pop absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-teal-300 text-[#03140d] text-[10px] font-extrabold flex items-center justify-center">{favCount}</span>}
          </button>
          <CartButton count={cartCount} active={currentView === 'CART'} onClick={() => go('CART')} />
        </nav>
      </header>

      {/* ───────── Mobile: top bar ───────── */}
      <header className="md:hidden fixed top-0 inset-x-0 z-50 px-3 pt-[max(env(safe-area-inset-top),0.6rem)] pointer-events-none">
        <div className="glass-bar pointer-events-auto rounded-full h-14 flex items-center justify-between pl-2 pr-2">
          <Logo onClick={() => go('HOME')} />
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenSearch}
              className="w-10 h-10 rounded-full bg-white/5 border border-white/10 text-zinc-300 flex items-center justify-center"
              aria-label="Search"
            >
              <Search className="w-[18px] h-[18px]" />
            </button>
            <CartButton count={cartCount} active={currentView === 'CART'} onClick={() => go('CART')} />
          </div>
        </div>
      </header>

      {/* ───────── Mobile: "More" sheet ───────── */}
      {moreOpen && (
        <div className="md:hidden fixed inset-0 z-[55]" onClick={() => setMoreOpen(false)}>
          <div className="absolute inset-0 bg-black/60 animate-in fade-in duration-200" />
          <div
            className="absolute inset-x-3 bottom-[5.9rem] glass-strong rounded-[2rem] p-3 animate-in slide-in-from-bottom-6 fade-in duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-3 pt-2 pb-3">
              <span className="eyebrow">Explore</span>
              <button onClick={() => setMoreOpen(false)} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center" aria-label="Close">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {moreItems.map((item) => (
                <button
                  key={item.view}
                  onClick={() => go(item.view)}
                  className={`flex flex-col items-center gap-2 py-4 rounded-2xl border transition-colors ${
                    currentView === item.view ? 'bg-white/15 border-white/25 text-white' : 'bg-white/5 border-white/10 text-zinc-300'
                  }`}
                >
                  <item.icon className="w-6 h-6 text-emerald-300" />
                  <span className="text-xs font-semibold">{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ───────── Mobile: floating dock ───────── */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-[56] px-3 pb-[max(env(safe-area-inset-bottom),0.75rem)] pointer-events-none">
        <div className="glass-bar pointer-events-auto rounded-[2rem] grid grid-cols-5 p-1.5">
          {[
            { v: 'HOME' as ViewState, icon: Home, label: 'Home' },
            { v: 'SHOP' as ViewState, icon: ShoppingBag, label: 'Seeds' },
            { v: 'ASSISTANT' as ViewState, icon: Sprout, label: 'AI Grow' },
            { v: 'CART' as ViewState, icon: ShoppingCart, label: 'Stash', badge: cartCount },
          ].map((it) => {
            const active = currentView === it.v;
            return (
              <button
                key={it.v}
                onClick={() => go(it.v)}
                className={`relative flex flex-col items-center justify-center gap-1 h-14 rounded-[1.5rem] transition-all duration-300 ${
                  active ? 'bg-gradient-to-b from-white/20 to-white/[0.06] text-white shadow-[0_0_20px_-6px_rgba(20,184,166,0.7)]' : 'text-zinc-400'
                }`}
              >
                <span className="relative">
                  <it.icon className={`w-5 h-5 ${active ? 'text-emerald-300' : ''}`} />
                  {!!it.badge && (
                    <span className="absolute -top-2 -right-3 min-w-[16px] h-4 px-1 rounded-full bg-gradient-to-br from-emerald-300 to-teal-400 text-[#03140d] text-[9px] font-extrabold flex items-center justify-center">
                      {it.badge}
                    </span>
                  )}
                </span>
                <span className="text-[10px] font-semibold">{it.label}</span>
              </button>
            );
          })}
          <button
            onClick={() => setMoreOpen((o) => !o)}
            className={`flex flex-col items-center justify-center gap-1 h-14 rounded-[1.5rem] transition-all duration-300 ${
              moreActive || moreOpen ? 'bg-gradient-to-b from-white/20 to-white/[0.06] text-white' : 'text-zinc-400'
            }`}
          >
            <Grid className={`w-5 h-5 ${moreActive ? 'text-emerald-300' : ''}`} />
            <span className="text-[10px] font-semibold">More</span>
          </button>
        </div>
      </nav>
    </>
  );
};

export default Navbar;
