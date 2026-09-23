'use client';

import { useActionState } from 'react';
import { sendEnquiry, type ContactState } from '@/app/(frontend)/actions';

export function ContactForm({ services }: { services: string[] }) {
  const [state, action, pending] = useActionState<ContactState, FormData>(sendEnquiry, null);

  if (state?.ok) {
    return (
      <div className="form-done" role="status">
        <p className="h-sm">Thanks, message received.</p>
        <p className="muted">I usually reply within one working day.</p>
      </div>
    );
  }

  return (
    <form className="form" action={action}>
      <div className="form-row">
        <label>Name<input name="name" required autoComplete="name" /></label>
        <label>Email<input name="email" type="email" required autoComplete="email" /></label>
      </div>
      <div className="form-row">
        <label>What do you need?
          <select name="service" defaultValue="">
            <option value="" disabled>Choose one</option>
            {services.map((s) => <option key={s}>{s}</option>)}
            <option>Something else</option>
          </select>
        </label>
        <label>Budget (optional)<input name="budget" placeholder="e.g. KES 50,000" /></label>
      </div>
      <label>Tell me about the project<textarea name="message" rows={5} required /></label>
      <label className="hp" aria-hidden="true">Company<input name="company" tabIndex={-1} autoComplete="off" /></label>
      {state?.error && <p className="form-error" role="alert">{state.error}</p>}
      <button className="btn btn-dark" type="submit" disabled={pending}>{pending ? 'Sending…' : 'Send message'}</button>
    </form>
  );
}
