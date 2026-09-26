'use client';

import type { ReactNode } from 'react';

export const SERVICE_EVENT = 'contact:service';

/** Jumps to the contact form with this service already chosen in it. */
export function ServiceLink({ service, className, children }: { service: string; className?: string; children: ReactNode }) {
  return (
    <a className={className} href="#contact" onClick={() => window.dispatchEvent(new CustomEvent(SERVICE_EVENT, { detail: service }))}>
      {children}
    </a>
  );
}
