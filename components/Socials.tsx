import type { Site } from '@/payload-types';
import { Icon, type IconName } from './Icon';

const LABELS: Record<string, string> = { instagram: 'Instagram', behance: 'Behance', dribbble: 'Dribbble', linkedin: 'LinkedIn', x: 'X', facebook: 'Facebook', tiktok: 'TikTok' };

export function Socials({ socials }: { socials: Site['socials'] }) {
  const list = (socials ?? []).filter((s) => s.url);
  if (!list.length) return null;
  return (
    <ul className="socials" aria-label="Social profiles">
      {list.map((s) => (
        <li key={s.id ?? s.url}>
          <a href={s.url} target="_blank" rel="noopener noreferrer" aria-label={LABELS[s.platform] ?? s.platform}>
            <Icon name={s.platform as IconName} />
          </a>
        </li>
      ))}
    </ul>
  );
}
