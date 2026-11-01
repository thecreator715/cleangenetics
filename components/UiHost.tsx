import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Check, AlertTriangle, Info, X } from 'lucide-react';
import { UI_EVENT, UiEvent, ToastEvent, PromptEvent, ConfirmEvent } from '../lib/ui';

const KIND = {
  success: { icon: Check, ring: 'from-emerald-300 to-teal-400', text: 'text-emerald-300' },
  error: { icon: AlertTriangle, ring: 'from-rose-400 to-orange-300', text: 'text-rose-300' },
  info: { icon: Info, ring: 'from-teal-200 to-emerald-300', text: 'text-teal-200' },
} as const;

const Toast: React.FC<{ t: ToastEvent; onDone: () => void }> = ({ t, onDone }) => {
  useEffect(() => {
    const id = setTimeout(onDone, 2600);
    return () => clearTimeout(id);
  }, [onDone]);
  const k = KIND[t.kind];
  const Icon = k.icon;
  return (
    <div role="status" className="animate-pop glass-bar rounded-full pl-2 pr-5 py-2 flex items-center gap-3 max-w-[92vw] pointer-events-auto">
      <span className={`w-7 h-7 rounded-full bg-gradient-to-br ${k.ring} flex items-center justify-center shrink-0`}>
        <Icon className="w-4 h-4 text-black" strokeWidth={3} />
      </span>
      <span className="text-sm font-medium text-white/95">{t.text}</span>
    </div>
  );
};

const PromptDialog: React.FC<{ e: PromptEvent; onClose: () => void }> = ({ e, onClose }) => {
  const [val, setVal] = useState(e.defaultValue);
  const input = useRef<HTMLInputElement>(null);
  useEffect(() => {
    input.current?.focus();
    input.current?.select();
  }, []);
  const done = (v: string | null) => {
    e.resolve(v);
    onClose();
  };
  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 animate-in fade-in duration-200" onClick={() => done(null)} />
      <form
        onSubmit={(ev) => {
          ev.preventDefault();
          done(val.trim() || null);
        }}
        className="glass-strong rounded-3xl w-full max-w-sm p-6 animate-pop"
      >
        <h3 className="text-xl font-bold text-white tracking-tight">{e.title}</h3>
        {e.description && <p className="text-sm text-zinc-400 mt-1">{e.description}</p>}
        <input
          ref={input}
          value={val}
          onChange={(ev) => setVal(ev.target.value)}
          placeholder={e.placeholder}
          className="mt-5 w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white"
        />
        <div className="mt-5 flex gap-3">
          <button type="button" onClick={() => done(null)} className="btn-glass flex-1 py-3 text-sm">
            Cancel
          </button>
          <button type="submit" className="btn-primary flex-1 py-3 text-sm">
            {e.confirmLabel}
          </button>
        </div>
      </form>
    </div>
  );
};

const ConfirmDialog: React.FC<{ e: ConfirmEvent; onClose: () => void }> = ({ e, onClose }) => {
  const done = (v: boolean) => {
    e.resolve(v);
    onClose();
  };
  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 animate-in fade-in duration-200" onClick={() => done(false)} />
      <div className="glass-strong rounded-3xl w-full max-w-sm p-6 animate-pop text-center">
        <div
          className={`mx-auto w-14 h-14 rounded-2xl flex items-center justify-center mb-4 ${
            e.danger ? 'bg-rose-500/15 text-rose-300' : 'bg-teal-400/15 text-teal-200'
          }`}
        >
          {e.danger ? <AlertTriangle className="w-7 h-7" /> : <Info className="w-7 h-7" />}
        </div>
        <h3 className="text-xl font-bold text-white tracking-tight">{e.title}</h3>
        {e.description && <p className="text-sm text-zinc-400 mt-2 leading-relaxed">{e.description}</p>}
        <div className="mt-6 flex gap-3">
          <button onClick={() => done(false)} className="btn-glass flex-1 py-3 text-sm">
            Cancel
          </button>
          <button
            onClick={() => done(true)}
            className={`flex-1 py-3 text-sm font-bold rounded-full transition-transform active:scale-95 ${
              e.danger ? 'bg-gradient-to-r from-rose-500 to-orange-400 text-white shadow-lg shadow-rose-500/30' : 'btn-primary'
            }`}
          >
            {e.confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

const UiHost: React.FC = () => {
  const [toasts, setToasts] = useState<ToastEvent[]>([]);
  const [dialog, setDialog] = useState<PromptEvent | ConfirmEvent | null>(null);

  useEffect(() => {
    const handler = (ev: Event) => {
      const e = (ev as CustomEvent<UiEvent>).detail;
      if (e.type === 'toast') setToasts((t) => [...t.slice(-1), e]);
      else setDialog(e);
    };
    window.addEventListener(UI_EVENT, handler);
    return () => window.removeEventListener(UI_EVENT, handler);
  }, []);

  useEffect(() => {
    if (!dialog) return;
    const onKey = (ev: KeyboardEvent) => {
      if (ev.key === 'Escape') {
        if (dialog.type === 'prompt') dialog.resolve(null);
        else dialog.resolve(false);
        setDialog(null);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [dialog]);

  return createPortal(
    <>
      <div className="fixed z-[400] top-4 md:top-24 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 pointer-events-none">
        {toasts.map((t) => (
          <Toast key={t.id} t={t} onDone={() => setToasts((all) => all.filter((x) => x.id !== t.id))} />
        ))}
      </div>
      {dialog?.type === 'prompt' && <PromptDialog e={dialog} onClose={() => setDialog(null)} />}
      {dialog?.type === 'confirm' && <ConfirmDialog e={dialog} onClose={() => setDialog(null)} />}
    </>,
    document.body,
  );
};

export default UiHost;
