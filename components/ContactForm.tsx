'use client';

import { useActionState, useEffect, useRef, useState } from 'react';
import { sendEnquiry, type ContactState } from '@/app/(frontend)/actions';
import { SERVICE_EVENT } from './motion/ServiceLink';

const ERR = 'contact-error';

export function ContactForm({ services }: { services: string[] }) {
  const [state, action, pending] = useActionState<ContactState, FormData>(sendEnquiry, null);
  const [service, setService] = useState('');
  const form = useRef<HTMLFormElement>(null);
  const done = useRef<HTMLParagraphElement>(null);

  // A service card's "Start a project" button pre-selects that service here.
  useEffect(() => {
    const onPick = (e: Event) => { const s = (e as CustomEvent<string>).detail; if (services.includes(s)) setService(s); };
    window.addEventListener(SERVICE_EVENT, onPick);
    return () => window.removeEventListener(SERVICE_EVENT, onPick);
  }, [services]);

  // After a reply: focus the field to fix, or the thank-you note (the form it replaces had focus).
  useEffect(() => {
    if (state?.ok) done.current?.focus();
    else if (state?.field) (form.current?.elements.namedItem(state.field) as HTMLElement | null)?.focus();
  }, [state]);

  const v = state?.values;
  const bad = (name: 'name' | 'email' | 'message') => (state?.field === name ? { 'aria-invalid': true, 'aria-describedby': ERR } : {});

  return (
    <div>
      {state?.ok ? (
        <div className="form-done">
          <p className="h-sm" ref={done} tabIndex={-1}>Thanks, message received.</p>
          <p className="muted">I usually reply within one working day.</p>
        </div>
      ) : (
        <form ref={form} className="form" action={action} aria-describedby={state?.error ? ERR : undefined}>
          <div className="form-row">
            <label>Name<input name="name" required aria-required="true" autoComplete="name" defaultValue={v?.name} {...bad('name')} /></label>
            <label>Email<input name="email" type="email" required aria-required="true" autoComplete="email" defaultValue={v?.email} {...bad('email')} /></label>
          </div>
          <div className="form-row">
            <label>What do you need?
              <select name="service" value={service || v?.service || ''} onChange={(e) => setService(e.target.value)}>
                <option value="" disabled>Choose one</option>
                {services.map((s) => <option key={s}>{s}</option>)}
                <option>Something else</option>
              </select>
            </label>
            <label>Budget (optional)<input name="budget" placeholder="e.g. KES 50,000" defaultValue={v?.budget} /></label>
          </div>
          <label>Tell me about the project<textarea name="message" rows={5} required aria-required="true" defaultValue={v?.message} {...bad('message')} /></label>
          <label className="hp" aria-hidden="true">Company<input name="company" tabIndex={-1} autoComplete="off" /></label>
          {state?.error && <p className="form-error" id={ERR} role="alert">{state.error}</p>}
          <button className="btn btn-dark" type="submit" disabled={pending}>{pending ? 'Sending…' : 'Send message'}</button>
        </form>
      )}
    </div>
  );
}
