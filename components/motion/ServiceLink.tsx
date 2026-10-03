'use client';

import type { ReactNode } from 'react';

export const SERVICE_EVENT = 'contact:service';

/**
 * Jumps to the contact form with this service already chosen in it. On a page with the form it
 * scrolls there and picks the service; anywhere else it opens the homepage's form via
 * ?service= (ContactForm reads it), so the link always goes somewhere.
 */
export function ServiceLink({ service, className, children }: { service: string; className?: string; children: ReactNode }) {
  return (
    <a
      className={className}
      href={`/?service=${encodeURIComponent(service)}#contact`}
      onClick={(e) => {
        const form = document.getElementById('contact');
        if (!form) return;
        e.preventDefault();
        window.dispatchEvent(new CustomEvent(SERVICE_EVENT, { detail: service }));
        form.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
        history.replaceState(null, '', '#contact');
      }}
    >
      {children}
    </a>
  );
}
