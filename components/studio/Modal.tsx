'use client';

import { createContext, useCallback, useContext, useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { Icon } from '@/components/ui/Icon';

/**
 * Studio modals: a native <dialog> (focus trap, Esc to close, inert page behind it) with
 * a short, interruptible CSS transition. Every create / edit / delete that needs a pop-up
 * uses this, plus the promise-based `confirm()` below for destructive actions.
 */
export function Modal({ open, onClose, title, description, size = 'md', children, footer, className }: {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  description?: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  children?: ReactNode;
  footer?: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const [shown, setShown] = useState(open);
  const id = useId();

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open) {
      // A fresh open commits the hidden state first (forced reflow) so the entrance transitions;
      // reopening mid-exit just reverses the running transition, as the pending close was cancelled.
      if (!d.open) { d.showModal(); void d.offsetWidth; }
      // syncing with the native <dialog>: the class must flip after showModal() for the transition
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setShown(true);
      return;
    }
    if (d.open) {
      setShown(false);
      const t = window.setTimeout(() => d.close(), 150);
      return () => window.clearTimeout(t);
    }
  }, [open]);

  return (
    <dialog
      ref={ref}
      className={`st-modal st-modal-${size}${shown ? ' is-open' : ''}${className ? ` ${className}` : ''}`}
      onCancel={(e) => { e.preventDefault(); onClose(); }}
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
      aria-labelledby={`${id}-title`}
      aria-describedby={description ? `${id}-desc` : undefined}
    >
      <div className="st-modal-card">
        <header className="st-modal-head">
          <div>
            <h2 id={`${id}-title`}>{title}</h2>
            {description && <p id={`${id}-desc`}>{description}</p>}
          </div>
          <button type="button" className="st-icon-btn" onClick={onClose} aria-label="Close">
            <Icon name="close" size={18} />
          </button>
        </header>
        {open && children != null && <div className="st-modal-body">{children}</div>}
        {footer && <footer className="st-modal-foot">{footer}</footer>}
      </div>
    </dialog>
  );
}

type ConfirmOpts = { title: string; body?: ReactNode; confirmLabel?: string; danger?: boolean };
const ConfirmContext = createContext<(o: ConfirmOpts) => Promise<boolean>>(async () => false);
export const useConfirm = () => useContext(ConfirmContext);

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [opts, setOpts] = useState<ConfirmOpts | null>(null);
  const resolver = useRef<(v: boolean) => void>(() => {});
  const confirm = useCallback((o: ConfirmOpts) => new Promise<boolean>((res) => { resolver.current = res; setOpts(o); }), []);
  const done = (v: boolean) => { resolver.current(v); setOpts(null); };
  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <Modal
        open={!!opts}
        onClose={() => done(false)}
        title={opts?.title ?? ''}
        description={opts?.body}
        size="sm"
        footer={
          <>
            <button type="button" className="st-btn" onClick={() => done(false)}>Cancel</button>
            <button type="button" className={`st-btn ${opts?.danger ? 'st-btn-danger' : 'st-btn-primary'}`} onClick={() => done(true)} autoFocus>{opts?.confirmLabel ?? 'Confirm'}</button>
          </>
        }
      />
    </ConfirmContext.Provider>
  );
}
