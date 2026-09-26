import type { Field, GlobalConfig } from 'payload';
import { anyone, authenticated } from '../access';
import { revalidateGlobal } from '../hooks/revalidate';

/**
 * Site-wide styles. Every value becomes a CSS variable (components/ThemeStyle.tsx), so the
 * whole site — and the Studio's live canvas — restyles without code changes. Controls are
 * deliberately bounded ("managed"): colours, a curated font list, and scales with sensible
 * limits, so the design can change without falling apart.
 */

const hex = (v: unknown) => !v || (typeof v === 'string' && /^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(v)) || 'Use a hex colour like #E8352B';
const colour = (name: string, label: string, defaultValue: string, description?: string): Field => ({
  name, label, type: 'text', defaultValue, validate: hex, admin: { description, custom: { control: 'colour' } },
});
const range = (name: string, label: string, defaultValue: number, min: number, max: number, step: number, unit: string, description?: string): Field => ({
  name, label, type: 'number', defaultValue, min, max, admin: { description, step, custom: { control: 'range', unit } },
});

export const FONTS = ['Geist', 'Inter', 'Manrope', 'DM Sans', 'Space Grotesk', 'Plus Jakarta Sans', 'Sora', 'Outfit', 'Instrument Serif', 'Playfair Display', 'Fraunces', 'DM Serif Display'] as const;
const font = (name: string, label: string, defaultValue: string): Field => ({ name, label, type: 'select', defaultValue, options: FONTS.map((f) => ({ label: f, value: f })) });

export const Theme: GlobalConfig = {
  slug: 'theme',
  label: 'Styles',
  admin: { group: 'Website', description: 'Colours, fonts, buttons, corners and spacing for the whole site.' },
  access: { read: anyone, update: authenticated },
  versions: { max: 30 },
  hooks: { afterChange: [revalidateGlobal] },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Colours',
          fields: [
            { type: 'row', fields: [
              colour('background', 'Background', '#000000', 'Page background (dark sections).'),
              colour('surface', 'Surface', '#131313', 'Cards and panels on dark.'),
              colour('text', 'Text', '#F5F5F4'),
              colour('mutedText', 'Body text', '#E2E8F0', 'Paragraphs and secondary text. A soft off-white reads more comfortably than pure white.'),
            ] },
            { type: 'row', fields: [
              colour('accent', 'Accent', '#E8352B', 'Highlights, tags, the glow and the about banner.'),
              colour('accent2', 'Second accent', '#FF6A2B', 'Gradients and light streaks.'),
            ] },
            { type: 'row', fields: [
              colour('lightBackground', 'Light section background', '#F2F2F1'),
              colour('lightSurface', 'Light card', '#FFFFFF'),
              colour('lightText', 'Text on light', '#0A0A0A'),
            ] },
            { name: 'glow', label: 'Show the accent glow at the bottom of the screen', type: 'checkbox', defaultValue: true },
          ],
        },
        {
          label: 'Type',
          fields: [
            { type: 'row', fields: [font('headingFont', 'Heading font', 'Geist'), font('bodyFont', 'Body font', 'Geist')] },
            { type: 'row', fields: [
              { name: 'headingWeight', type: 'select', defaultValue: '500', options: ['300', '400', '500', '600', '700'] },
              range('headingTracking', 'Heading letter-spacing', -4, -8, 2, 0.5, '%'),
              range('baseSize', 'Body text size', 16, 14, 20, 1, 'px'),
            ] },
          ],
        },
        {
          label: 'Buttons',
          fields: [
            { type: 'row', fields: [
              colour('buttonBackground', 'Main button', '#FFFFFF'),
              colour('buttonText', 'Main button text', '#0A0A0A'),
              colour('buttonDarkBackground', 'Button on light', '#0A0A0A'),
            ] },
            { type: 'row', fields: [
              { name: 'buttonShape', type: 'select', defaultValue: 'pill', options: [{ label: 'Pill', value: 'pill' }, { label: 'Rounded', value: 'rounded' }, { label: 'Square', value: 'square' }] },
              range('buttonHeight', 'Button height', 44, 36, 60, 2, 'px'),
            ] },
          ],
        },
        {
          label: 'Layout',
          fields: [
            { type: 'row', fields: [
              range('radius', 'Corner roundness', 100, 0, 160, 5, '%', '100% is the current look; 0 is square corners.'),
              range('spacing', 'Space between sections', 100, 50, 160, 5, '%'),
              range('container', 'Content width', 1240, 960, 1600, 20, 'px'),
            ] },
            { name: 'motion', label: 'Scroll and entrance animations', type: 'select', defaultValue: 'full', options: [{ label: 'Full', value: 'full' }, { label: 'Subtle', value: 'subtle' }, { label: 'Off', value: 'off' }] },
          ],
        },
      ],
    },
  ],
};
