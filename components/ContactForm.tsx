'use client';

import Link from 'next/link';
import { useActionState, useEffect, useId, useRef, useState } from 'react';
import { sendEnquiry, type ContactState } from '@/app/(frontend)/actions';
import { SERVICE_EVENT } from './motion/ServiceLink';

/**
 * The enquiry form, kept short: what you need (optional chips), name, email and a few lines.
 * Its wording comes from the Contact section (Pages → Contact form → Form). A service card's
 * "Start a project" button, or a service page's (via ?service=), picks its service for you.
 * The honeypot and rate limits live in the server action; a server error focuses its field.
 */

const ERR = 'contact-error';
export type FormCopy = { serviceLabel?: string | null; messagePlaceholder?: string | null; submitLabel?: string | null; successText?: string | null; privacyNote?: string | null; privacyUrl?: string | null };

export function ContactForm({ services, bookingUrl, chatUrl, copy = {} }: { services: string[]; bookingUrl?: string | null; chatUrl?: string | null; copy?: FormCopy }) {
  const [state, action, pending] = useActionState<ContactState, FormData>(sendEnquiry, null);
  const base = useId();
  const v = state?.values;
  const [service, setService] = useState(v?.service ?? '');
  const [hint, setHint] = useState<string | null>(null);
  const form = useRef<HTMLFormElement>(null);
  const done = useRef<HTMLParagraphElement>(null);
  const quick = chatUrl || bookingUrl;

  useEffect(() => {
    const pick = (s: string | null) => { if (s && services.includes(s)) setService(s); };
    pick(new URLSearchParams(window.location.search).get('service'));
    const onPick = (e: Event) => pick((e as CustomEvent<string>).detail);
    window.addEventListener(SERVICE_EVENT, onPick);
    return () => window.removeEventListener(SERVICE_EVENT, onPick);
  }, [services]);

  useEffect(() => {
    if (state?.ok) done.current?.focus();
    else if (state?.field) (form.current?.elements.namedItem(state.field) as HTMLElement | null)?.focus();
  }, [state]);

  if (state?.ok) {
    return (
      <div className="form-done">
        <p className="h-sm" ref={done} tabIndex={-1}>Thanks, your message is in.</p>
        <p className="muted">{copy.successText || 'I usually reply within one working day.'}</p>
        {bookingUrl && <a className="btn btn-light btn-sm" href={bookingUrl} target="_blank" rel="noopener noreferrer">Want to talk sooner? Book a call</a>}
      </div>
    );
  }

  const bad = (n: 'name' | 'email' | 'message') => (state?.field === n ? { 'aria-invalid': true, 'aria-describedby': ERR } : {});
  const check = (fd: FormData) => {
    if (!String(fd.get('name') ?? '').trim()) return ['name', 'Please add your name.'];
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(fd.get('email') ?? '').trim())) return ['email', 'That email address doesn’t look right.'];
    if (!String(fd.get('message') ?? '').trim()) return ['message', 'Add a few lines about the project.'];
    return null;
  };

  return (
    <form
      ref={form}
      className="brief brief-simple"
      action={action}
      noValidate
      aria-describedby={state?.error || hint ? ERR : undefined}
      onSubmit={(e) => {
        const err = check(new FormData(e.currentTarget));
        setHint(err?.[1] ?? null);
        if (err) { e.preventDefault(); (e.currentTarget.elements.namedItem(err[0]) as HTMLElement | null)?.focus(); }
      }}
    >
      <input type="hidden" name="service" value={service} />
      {!!services.length && (
        <fieldset className="brief-step">
          <legend className="brief-label">{copy.serviceLabel || 'What do you need?'} <span className="muted">(optional)</span></legend>
          <div className="brief-chips">
            {[...services, 'Something else'].map((o) => (
              <label key={o} className={`brief-chip${service === o ? ' is-on' : ''}`}>
                <input type="radio" name="service-pick" value={o} checked={service === o} onChange={() => setService(o)} />
                {o}
              </label>
            ))}
          </div>
        </fieldset>
      )}
      <div className="form-row">
        <label>Name<input name="name" required aria-required="true" autoComplete="name" defaultValue={v?.name} {...bad('name')} /></label>
        <label>Email<input name="email" type="email" required aria-required="true" autoComplete="email" defaultValue={v?.email} {...bad('email')} /></label>
      </div>
      <label htmlFor={`${base}-msg`}>Your project</label>
      <textarea id={`${base}-msg`} name="message" rows={5} required aria-required="true" defaultValue={v?.message} {...bad('message')}
        placeholder={copy.messagePlaceholder || 'What is it, who is it for, and when do you need it?'} />

      <label className="hp" aria-hidden="true">Company<input name="company" tabIndex={-1} autoComplete="off" /></label>
      {(hint || state?.error) && <p className="form-error" id={ERR} role="alert">{hint ?? state?.error}</p>}

      <div className="brief-nav">
        <button className="btn btn-dark" type="submit" disabled={pending}>{pending ? 'Sending…' : copy.submitLabel || 'Send message'}</button>
        {quick && <a className="link-under brief-quick" href={quick} target="_blank" rel="noopener noreferrer">Prefer a quick chat?</a>}
      </div>
      {copy.privacyNote && (
        <p className="brief-help">{copy.privacyNote}{copy.privacyUrl && <> <Link className="link-under" href={copy.privacyUrl}>Read more</Link></>}</p>
      )}
    </form>
  );
}
