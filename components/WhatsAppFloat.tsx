import { digits } from '@/lib/format';
import { Icon } from './Icon';

/**
 * A floating "Chat on WhatsApp" button on every page (bottom right). It opens a chat with a
 * friendly first line already typed. Shown only when Site settings has a phone number with
 * WhatsApp switched on; the label slides out on hover or keyboard focus.
 */
export function WhatsAppFloat({ phone, name }: { phone: string; name: string }) {
  const first = name.split(/\s+/)[0];
  const href = `https://wa.me/${digits(phone)}?text=${encodeURIComponent(`Hi ${first}, I’d like to talk about a project.`)}`;
  return (
    <a className="wa-float" href={href} target="_blank" rel="noopener noreferrer" aria-label="Chat on WhatsApp (opens WhatsApp)">
      <span className="wa-float-label" aria-hidden="true">Chat on WhatsApp</span>
      <span className="wa-float-icon" aria-hidden="true"><Icon name="whatsapp" size={26} /></span>
    </a>
  );
}
