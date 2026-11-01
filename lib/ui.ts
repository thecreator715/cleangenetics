/**
 * Tiny imperative UI bus: lets any module (even non-React helpers) raise a toast
 * or ask the user a question with a beautiful in-app dialog instead of the
 * browser's native alert/prompt/confirm. <UiHost/> renders them.
 */
export type ToastKind = 'success' | 'error' | 'info';

export interface ToastEvent {
  type: 'toast';
  id: number;
  text: string;
  kind: ToastKind;
}
export interface PromptEvent {
  type: 'prompt';
  id: number;
  title: string;
  description?: string;
  defaultValue: string;
  placeholder?: string;
  confirmLabel: string;
  resolve: (v: string | null) => void;
}
export interface ConfirmEvent {
  type: 'confirm';
  id: number;
  title: string;
  description?: string;
  confirmLabel: string;
  danger: boolean;
  resolve: (v: boolean) => void;
}
export type UiEvent = ToastEvent | PromptEvent | ConfirmEvent;

const EVT = 'cg:ui';
let seq = 1;
const emit = (e: UiEvent) => window.dispatchEvent(new CustomEvent(EVT, { detail: e }));

export const UI_EVENT = EVT;

export const ui = {
  toast(text: string, kind: ToastKind = 'info') {
    emit({ type: 'toast', id: seq++, text, kind });
  },
  prompt(title: string, opts: { defaultValue?: string; placeholder?: string; description?: string; confirmLabel?: string } = {}) {
    return new Promise<string | null>((resolve) =>
      emit({
        type: 'prompt',
        id: seq++,
        title,
        description: opts.description,
        defaultValue: opts.defaultValue ?? '',
        placeholder: opts.placeholder,
        confirmLabel: opts.confirmLabel ?? 'Save',
        resolve,
      }),
    );
  },
  confirm(title: string, opts: { description?: string; confirmLabel?: string; danger?: boolean } = {}) {
    return new Promise<boolean>((resolve) =>
      emit({
        type: 'confirm',
        id: seq++,
        title,
        description: opts.description,
        confirmLabel: opts.confirmLabel ?? 'Confirm',
        danger: opts.danger ?? false,
        resolve,
      }),
    );
  },
};
