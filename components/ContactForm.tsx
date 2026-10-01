'use client';

import { useActionState, useEffect, useId, useRef, useState } from 'react';
import { sendEnquiry, type ContactState } from '@/app/(frontend)/actions';
import { SERVICE_EVENT } from './motion/ServiceLink';

/**
 * The brief builder: four short steps instead of one long form.
 *   1 What        the service (chips)
 *   2 When        timeline (chips) and an optional budget
 *   3 The project a few lines, with prompts
 *   4 You         name and email, plus a review of the whole brief
 * It is still one <form> posting to the same server action, so validation, the honeypot and
 * the rate limits are unchanged; a server error jumps back to the step holding that field.
 * A service card's "Start a project" button pre-selects its service.
 */

const ERR = 'contact-error';
const TIMELINES = ['As soon as possible', 'In 2–4 weeks', 'In 1–3 months', 'Flexible'];
const STEPS = ['What', 'When', 'The project', 'You'] as const;
const STEP_OF: Record<string, number> = { message: 2, name: 3, email: 3 };

export function ContactForm({ services, bookingUrl }: { services: string[]; bookingUrl?: string | null }) {
  const [state, action, pending] = useActionState<ContactState, FormData>(sendEnquiry, null);
  const base = useId();
  const v = state?.values;
  const [step, setStep] = useState(0);
  const [service, setService] = useState(v?.service ?? '');
  const [timeline, setTimeline] = useState(v?.timeline ?? '');
  const [budget, setBudget] = useState(v?.budget ?? '');
  const [message, setMessage] = useState(v?.message ?? '');
  const [name, setName] = useState(v?.name ?? '');
  const [email, setEmail] = useState(v?.email ?? '');
  const [hint, setHint] = useState<string | null>(null);
  const form = useRef<HTMLFormElement>(null);
  const done = useRef<HTMLParagraphElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const moved = useRef(false);

  useEffect(() => {
    const onPick = (e: Event) => { const s = (e as CustomEvent<string>).detail; if (services.includes(s)) setService(s); };
    window.addEventListener(SERVICE_EVENT, onPick);
    return () => window.removeEventListener(SERVICE_EVENT, onPick);
  }, [services]);

  // after a reply: the thank-you note, or back to the step with the field to fix
  const [seen, setSeen] = useState(state);
  if (seen !== state) {
    setSeen(state);
    if (state && !state.ok && state.field) setStep(STEP_OF[state.field] ?? 3);
  }
  useEffect(() => {
    if (state?.ok) done.current?.focus();
    else if (state?.field) (form.current?.elements.namedItem(state.field) as HTMLElement | null)?.focus();
  }, [state]);

  // moving between steps puts focus on the new step's heading (announced to screen readers)
  useEffect(() => { if (moved.current) heading.current?.focus(); }, [step]);

  const check = (s: number): string | null => {
    if (s === 2 && !message.trim()) return 'Add a few lines about the project.';
    if (s === 3 && !name.trim()) return 'Please add your name.';
    if (s === 3 && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return 'That email address doesn’t look right.';
    return null;
  };
  const go = (to: number) => {
    if (to > step) { const err = check(step); setHint(err); if (err) return; }
    setHint(null);
    moved.current = true;
    setStep(to);
  };

  if (state?.ok) {
    return (
      <div className="form-done">
        <p className="h-sm" ref={done} tabIndex={-1}>Thanks, your brief is in.</p>
        <p className="muted">I usually reply within one working day.</p>
        {bookingUrl && <a className="btn btn-light btn-sm" href={bookingUrl} target="_blank" rel="noopener noreferrer">Want to talk sooner? Book a call</a>}
      </div>
    );
  }

  const bad = (n: 'name' | 'email' | 'message') => (state?.field === n ? { 'aria-invalid': true, 'aria-describedby': ERR } : {});
  const last = step === STEPS.length - 1;
  const chips = (name: string, options: string[], value: string, set: (v: string) => void, label: string) => (
    <div className="brief-chips" role="radiogroup" aria-label={label}>
      {options.map((o) => (
        <label key={o} className={`brief-chip${value === o ? ' is-on' : ''}`}>
          <input type="radio" name={`${name}-pick`} value={o} checked={value === o} onChange={() => set(o)} />
          {o}
        </label>
      ))}
    </div>
  );

  return (
    <form
      ref={form}
      className="brief"
      action={action}
      // each step checks its own fields (hidden steps would trip the browser's validation)
      noValidate
      aria-describedby={state?.error ? ERR : undefined}
      onSubmit={(e) => { if (!last) { e.preventDefault(); go(step + 1); } else if (check(3)) { e.preventDefault(); setHint(check(3)); } }}
    >
      <ol className="brief-steps" aria-label="Brief">
        {STEPS.map((s, i) => (
          <li key={s} className={i === step ? 'is-on' : i < step ? 'is-done' : undefined} aria-current={i === step ? 'step' : undefined}>
            <button type="button" onClick={() => go(i)} disabled={i > step}><span>{String(i + 1).padStart(2, '0')}</span>{s}</button>
          </li>
        ))}
      </ol>
      <div className="brief-progress" aria-hidden="true"><i style={{ width: `${((step + 1) / STEPS.length) * 100}%` }} /></div>

      {/* every field stays in the form, so the final submit carries the whole brief */}
      <input type="hidden" name="service" value={service} />
      <input type="hidden" name="timeline" value={timeline} />

      <fieldset className="brief-step" hidden={step !== 0}>
        <legend><h3 ref={step === 0 ? heading : undefined} tabIndex={-1} className="h-sm">What do you need?</h3></legend>
        {chips('service', [...services, 'Something else'], service, setService, 'Service')}
        <p className="brief-help">Pick the closest; you can explain the rest in a moment.</p>
      </fieldset>

      <fieldset className="brief-step" hidden={step !== 1}>
        <legend><h3 ref={step === 1 ? heading : undefined} tabIndex={-1} className="h-sm">When do you need it?</h3></legend>
        {chips('timeline', TIMELINES, timeline, setTimeline, 'Timeline')}
        <label htmlFor={`${base}-budget`}>Budget (optional)</label>
        <input id={`${base}-budget`} name="budget" value={budget} onChange={(e) => setBudget(e.target.value)} placeholder="e.g. KES 50,000" />
      </fieldset>

      <fieldset className="brief-step" hidden={step !== 2}>
        <legend><h3 ref={step === 2 ? heading : undefined} tabIndex={-1} className="h-sm">Tell me about the project</h3></legend>
        <textarea name="message" rows={6} required aria-required="true" value={message} onChange={(e) => setMessage(e.target.value)} {...bad('message')}
          placeholder={'Who is it for? What should people feel or do when they see it?\nWhere will it live: feed, print, web? Any links you like?'} />
      </fieldset>

      <fieldset className="brief-step" hidden={step !== 3}>
        <legend><h3 ref={step === 3 ? heading : undefined} tabIndex={-1} className="h-sm">Where should I reply?</h3></legend>
        <div className="form-row">
          <label>Name<input name="name" required aria-required="true" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} {...bad('name')} /></label>
          <label>Email<input name="email" type="email" required aria-required="true" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} {...bad('email')} /></label>
        </div>
        <dl className="brief-review" aria-label="Your brief">
          <div><dt>Service</dt><dd>{service || 'Not chosen'}</dd></div>
          <div><dt>Timeline</dt><dd>{timeline || 'Not chosen'}</dd></div>
          <div><dt>Budget</dt><dd>{budget.trim() || 'Not given'}</dd></div>
          <div className="is-wide"><dt>Project</dt><dd>{message.trim() || '—'}</dd></div>
        </dl>
      </fieldset>

      <label className="hp" aria-hidden="true">Company<input name="company" tabIndex={-1} autoComplete="off" /></label>
      {(hint || state?.error) && <p className="form-error" id={ERR} role="alert">{hint ?? state?.error}</p>}

      <div className="brief-nav">
        {step > 0 ? <button type="button" className="btn btn-soft" onClick={() => go(step - 1)}>Back</button> : <span />}
        <button className="btn btn-dark" type="submit" disabled={pending}>{last ? (pending ? 'Sending…' : 'Send brief') : 'Continue'}</button>
      </div>
    </form>
  );
}
