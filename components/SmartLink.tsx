import Link from 'next/link';
import type { ReactNode } from 'react';

/**
 * A link from the CMS: a page or section on this site goes through next/link (prefetched, no full
 * reload); a full URL opens in a new tab; mailto:/tel: stay as they are.
 */
export function SmartLink({ href, className, children }: { href: string; className?: string; children: ReactNode }) {
  if (/^https?:/.test(href)) return <a className={className} href={href} target="_blank" rel="noopener noreferrer">{children}</a>;
  if (/^(mailto|tel):/.test(href)) return <a className={className} href={href}>{children}</a>;
  return <Link className={className} href={href}>{children}</Link>;
}
