import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import SeedPack from './SeedPack';
import { Heart, Search, CornerDownLeft, ArrowUp, ArrowDown, Home, ShoppingBag, GitFork, Wind, Pill, Sprout, Package, Info, ShoppingCart, Dna } from 'lucide-react';
import { Product, ViewState } from '../types';
import { themeFor } from '../lib/strainTheme';

interface Props {
  open: boolean;
  onClose: () => void;
  products: Product[];
  favorites?: string[];
  onNavigate: (v: ViewState) => void;
  onPickProduct: (p: Product) => void;
}

type Item = { id: string; group: 'Jump to' | 'Favorites' | 'Genetics'; product?: Product; label: string; hint?: string; icon: React.ElementType; color?: string; run: () => void };

const CommandPalette: React.FC<Props> = ({ open, onClose, products, favorites = [], onNavigate, onPickProduct }) => {
  const [q, setQ] = useState('');
  const [idx, setIdx] = useState(0);
  const input = useRef<HTMLInputElement>(null);
  const list = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      setQ('');
      setIdx(0);
      setTimeout(() => input.current?.focus(), 30);
    }
  }, [open]);

  const items = useMemo<Item[]>(() => {
    const nav: Item[] = [
      { id: 'n-home', group: 'Jump to', label: 'Home', icon: Home, run: () => onNavigate('HOME') },
      { id: 'n-shop', group: 'Jump to', label: 'Seed Bank', hint: 'Browse all seeds', icon: ShoppingBag, run: () => onNavigate('SHOP') },
      { id: 'n-clones', group: 'Jump to', label: 'Clones', icon: GitFork, run: () => onNavigate('CLONES') },
      { id: 'n-pollen', group: 'Jump to', label: 'Pollen', icon: Wind, run: () => onNavigate('POLLEN') },
      { id: 'n-meds', group: 'Jump to', label: 'Natural Medicines', icon: Pill, run: () => onNavigate('MEDICINES') },
      { id: 'n-ai', group: 'Jump to', label: 'AI Grow Assistant', hint: 'Tents, plants & Gene', icon: Sprout, run: () => onNavigate('ASSISTANT') },
      { id: 'n-cart', group: 'Jump to', label: 'Your Stash', hint: 'Cart & checkout', icon: ShoppingCart, run: () => onNavigate('CART') },
      { id: 'n-orders', group: 'Jump to', label: 'Order History', icon: Package, run: () => onNavigate('ORDERS') },
      { id: 'n-about', group: 'Jump to', label: 'About Clean Genetics', icon: Info, run: () => onNavigate('ABOUT') },
    ];
    const gen: Item[] = products.map((p) => ({
      id: `p-${p.id}`,
      product: p,
      group: favorites.includes(p.id) ? 'Favorites' : 'Genetics',
      label: p.name,
      hint: `${p.type} · ${p.floweringTime}`,
      icon: Dna,
      color: themeFor(p.type).accent,
      run: () => onPickProduct(p),
    }));
    const needle = q.trim().toLowerCase();
    const order = (list: Item[]) => [...list.filter((i) => i.group === 'Favorites'), ...list.filter((i) => i.group !== 'Favorites')];
    if (!needle) return [...order(gen).slice(0, 6), ...nav];
    return [...order(gen), ...nav].filter((i) => i.label.toLowerCase().includes(needle) || (i.hint || '').toLowerCase().includes(needle));
  }, [q, products, favorites, onNavigate, onPickProduct]);

  useEffect(() => setIdx(0), [q]);

  useEffect(() => {
    list.current?.querySelector<HTMLElement>(`[data-idx="${idx}"]`)?.scrollIntoView({ block: 'nearest' });
  }, [idx]);

  if (!open) return null;

  const choose = (i?: Item) => {
    if (!i) return;
    onClose();
    i.run();
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setIdx((i) => Math.min(items.length - 1, i + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setIdx((i) => Math.max(0, i - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      choose(items[idx]);
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  let lastGroup = '';
  return createPortal(
    <div className="fixed inset-0 z-[250] flex items-start justify-center px-4 pt-[12vh]" onKeyDown={onKey}>
      <div className="absolute inset-0 bg-black/60 animate-in fade-in duration-200" onClick={onClose} />
      <div className="glass-strong edge-glow relative w-full max-w-3xl rounded-3xl overflow-hidden animate-pop" role="dialog" aria-label="Command palette">
        <div className="flex items-center gap-3 px-5 border-b border-white/10">
          <Search className="w-5 h-5 text-zinc-400" />
          <input
            ref={input}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search strains or jump to a page…"
            className="flex-1 bg-transparent py-5 text-base text-white !shadow-none !border-0"
          />
          <kbd className="px-2 py-1 rounded-md bg-white/10 text-[10px] font-mono text-zinc-400">ESC</kbd>
        </div>
        <div className="grid md:grid-cols-[1fr_15rem]">
        <div ref={list} className="max-h-[52vh] overflow-y-auto p-2 scrollbar-thin">
          {items.length === 0 && <div className="py-12 text-center text-zinc-500 text-sm">No matches for “{q}”.</div>}
          {items.map((it, i) => {
            const header = it.group !== lastGroup ? it.group : null;
            lastGroup = it.group;
            return (
              <React.Fragment key={it.id}>
                {header && <div className="eyebrow !text-zinc-500 px-3 pt-3 pb-1.5 !text-[10px] flex items-center gap-1.5">{header === 'Favorites' && <Heart className="w-3 h-3 fill-current text-teal-300" />}{header}</div>}
                <button
                  data-idx={i}
                  onMouseMove={() => setIdx(i)}
                  onClick={() => choose(it)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors ${
                    idx === i ? 'bg-white/12' : ''
                  }`}
                >
                  <span
                    className="w-9 h-9 rounded-xl flex items-center justify-center bg-white/8 border border-white/10"
                    style={{ color: it.color || '#6ff3c1' }}
                  >
                    <it.icon className="w-[18px] h-[18px]" />
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="block text-sm font-semibold text-white truncate">{it.label}</span>
                    {it.hint && <span className="block text-xs text-zinc-500 truncate">{it.hint}</span>}
                  </span>
                  {idx === i && <CornerDownLeft className="w-4 h-4 text-zinc-400" />}
                </button>
              </React.Fragment>
            );
          })}
        </div>
        {/* preview */}
        <div className="hidden md:flex flex-col items-center justify-center gap-4 border-l border-white/10 p-5 bg-black/20 relative overflow-hidden">
          {items[idx]?.product ? (
            <>
              <div className="absolute inset-0 opacity-60 pointer-events-none" style={{ background: `radial-gradient(70% 60% at 50% 35%, ${items[idx].color}44, transparent 70%)` }} />
              <SeedPack key={items[idx].product!.id} product={items[idx].product!} className="w-36 relative animate-pop" />
              <div className="relative text-center">
                <div className="text-sm font-bold text-white leading-tight">{items[idx].product!.name}</div>
                <div className="text-xs text-zinc-400 mt-1">{items[idx].product!.type} · ${items[idx].product!.price}</div>
              </div>
            </>
          ) : (
            <div className="text-center text-zinc-500 text-xs px-2">
              <Search className="w-6 h-6 mx-auto mb-3 text-zinc-600" />
              Highlight a strain to preview its pack
            </div>
          )}
        </div>
        </div>
        <div className="flex items-center gap-4 px-5 py-3 border-t border-white/10 text-[11px] text-zinc-500">
          <span className="flex items-center gap-1.5"><ArrowUp className="w-3 h-3" /><ArrowDown className="w-3 h-3" /> navigate</span>
          <span className="flex items-center gap-1.5"><CornerDownLeft className="w-3 h-3" /> select</span>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default CommandPalette;
