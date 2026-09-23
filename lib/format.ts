const DISCIPLINE_LABELS: Record<string, string> = {
  social: 'Social media',
  brand: 'Brand identity',
  web: 'Web design',
  print: 'Print',
  packaging: 'Packaging',
  illustration: 'Illustration',
  motion: 'Motion',
};

export const disciplineLabel = (d: string) => DISCIPLINE_LABELS[d] ?? d;
export const disciplineList = (ds?: string[] | null) => (ds ?? []).map(disciplineLabel).join(', ');

export const price = (amount: number, currency?: string | null) =>
  new Intl.NumberFormat('en-KE', { style: 'currency', currency: currency || 'KES', maximumFractionDigits: 0 }).format(amount);

/** "+254 720 949 086" → "254720949086" for wa.me / tel: links. */
export const digits = (phone: string) => phone.replace(/[^\d]/g, '');
