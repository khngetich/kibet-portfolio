import type { IconName } from '@/components/Icon';

/** Display names for Site settings → Socials platforms (one list for the footer, contact and CMS). */
export const SOCIAL_LABEL: Record<string, string> = { instagram: 'Instagram', behance: 'Behance', dribbble: 'Dribbble', linkedin: 'LinkedIn', x: 'X', facebook: 'Facebook', tiktok: 'TikTok' };

/** The platform's icon, or a plain link icon for a platform without one. */
export const socialIcon = (platform: string): IconName => (platform in SOCIAL_LABEL ? (platform as IconName) : 'external');
