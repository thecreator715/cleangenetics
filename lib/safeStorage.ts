// Some embedded/sandboxed contexts block localStorage. Fall back to memory so the app never crashes.
try {
  const k = '__cg_test__';
  window.localStorage.setItem(k, '1');
  window.localStorage.removeItem(k);
} catch {
  const mem: Record<string, string> = {};
  const shim = {
    getItem: (k: string) => (k in mem ? mem[k] : null),
    setItem: (k: string, v: string) => { mem[k] = String(v); },
    removeItem: (k: string) => { delete mem[k]; },
    clear: () => { Object.keys(mem).forEach((k) => delete mem[k]); },
    key: (i: number) => Object.keys(mem)[i] ?? null,
    get length() { return Object.keys(mem).length; },
  };
  try { Object.defineProperty(window, 'localStorage', { value: shim, configurable: true }); } catch {}
}
export {};
