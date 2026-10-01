import type { Block, SelectField } from 'payload';

/**
 * Case-study building blocks. An editor stacks these in any order to tell a project's
 * story: big images first, short text in between, process and results where they help.
 */

const width: SelectField = {
  name: 'width',
  type: 'select',
  defaultValue: 'wide',
  options: [
    { label: 'Contained (text width)', value: 'contained' },
    { label: 'Wide', value: 'wide' },
    { label: 'Full bleed (edge to edge)', value: 'full' },
  ],
};

export const ImageBlock: Block = {
  slug: 'image',
  labels: { singular: 'Image', plural: 'Images' },
  fields: [
    { name: 'image', type: 'upload', relationTo: 'media', required: true },
    { name: 'caption', type: 'text' },
    { type: 'row', fields: [{ ...width, admin: { width: '50%' } }, { name: 'background', type: 'text', admin: { width: '50%', description: 'Optional backdrop colour, e.g. #111111' } }] },
  ],
};

export const GalleryBlock: Block = {
  slug: 'gallery',
  labels: { singular: 'Image grid', plural: 'Image grids' },
  fields: [
    { name: 'images', type: 'upload', relationTo: 'media', hasMany: true, required: true, minRows: 2 },
    {
      type: 'row',
      fields: [
        { name: 'columns', type: 'select', defaultValue: '2', options: ['2', '3', '4'], admin: { width: '33%' } },
        { name: 'aspect', type: 'select', defaultValue: 'auto', admin: { width: '33%' }, options: [
          { label: 'Original', value: 'auto' }, { label: 'Square', value: 'square' }, { label: 'Portrait 4:5', value: 'portrait' }, { label: 'Story 9:16', value: 'story' }, { label: 'Landscape 16:10', value: 'landscape' },
        ] },
        { ...width, admin: { width: '33%' } },
      ],
    },
    { name: 'caption', type: 'text' },
  ],
};

export const TextBlock: Block = {
  slug: 'text',
  labels: { singular: 'Text', plural: 'Text' },
  fields: [
    { name: 'heading', type: 'text' },
    { name: 'body', type: 'richText', required: true },
  ],
};

export const BeforeAfterBlock: Block = {
  slug: 'beforeAfter',
  labels: { singular: 'Before / after', plural: 'Before / after' },
  fields: [
    { type: 'row', fields: [
      { name: 'before', type: 'upload', relationTo: 'media', required: true, admin: { width: '50%' } },
      { name: 'after', type: 'upload', relationTo: 'media', required: true, admin: { width: '50%' } },
    ] },
    { type: 'row', fields: [
      { name: 'beforeLabel', type: 'text', admin: { width: '50%', placeholder: 'Before', description: 'e.g. “Sketch”, “Concept”, “Old logo”.' } },
      { name: 'afterLabel', type: 'text', admin: { width: '50%', placeholder: 'After', description: 'e.g. “Final”, “Printed”, “New logo”.' } },
    ] },
    { name: 'caption', type: 'text' },
  ],
};

export const PaletteBlock: Block = {
  slug: 'palette',
  labels: { singular: 'Colour palette', plural: 'Colour palettes' },
  fields: [
    { name: 'heading', type: 'text', defaultValue: 'Colour' },
    {
      name: 'colours',
      type: 'array',
      minRows: 1,
      fields: [
        { type: 'row', fields: [
          { name: 'hex', type: 'text', required: true, admin: { width: '30%', placeholder: '#F5C400' }, validate: (v: unknown) => (typeof v === 'string' && /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(v)) || 'Use a hex colour like #F5C400' },
          { name: 'name', type: 'text', admin: { width: '35%' } },
          { name: 'note', type: 'text', admin: { width: '35%', placeholder: 'e.g. Primary, CTAs' } },
        ] },
      ],
    },
  ],
};

export const TypeBlock: Block = {
  slug: 'typography',
  labels: { singular: 'Typography', plural: 'Typography' },
  fields: [
    { name: 'heading', type: 'text', defaultValue: 'Type' },
    {
      name: 'fonts',
      type: 'array',
      minRows: 1,
      fields: [
        { type: 'row', fields: [
          { name: 'family', type: 'text', required: true, admin: { width: '40%' } },
          { name: 'usage', type: 'text', admin: { width: '60%', placeholder: 'e.g. Headlines, 800 weight' } },
        ] },
        { name: 'specimen', type: 'upload', relationTo: 'media', admin: { description: 'Optional image of the typeface in use' } },
      ],
    },
  ],
};

export const VideoBlock: Block = {
  slug: 'video',
  labels: { singular: 'Video', plural: 'Videos' },
  fields: [
    { name: 'file', type: 'upload', relationTo: 'media', admin: { description: 'Upload an MP4 (plays muted on loop, like a GIF)…' } },
    { name: 'embed', type: 'text', admin: { description: '…or paste a YouTube / Vimeo link' } },
    { name: 'caption', type: 'text' },
    width,
  ],
};

export const QuoteBlock: Block = {
  slug: 'quote',
  labels: { singular: 'Client quote', plural: 'Client quotes' },
  fields: [
    { name: 'quote', type: 'textarea', required: true },
    { type: 'row', fields: [
      { name: 'name', type: 'text', admin: { width: '50%' } },
      { name: 'title', type: 'text', admin: { width: '50%', placeholder: 'Marketing lead, KwikBet' } },
    ] },
  ],
};

export const StatsBlock: Block = {
  slug: 'stats',
  labels: { singular: 'Results', plural: 'Results' },
  fields: [
    { name: 'heading', type: 'text', defaultValue: 'Results' },
    { name: 'items', type: 'array', minRows: 1, maxRows: 4, fields: [
      { type: 'row', fields: [
        { name: 'value', type: 'text', required: true, admin: { width: '35%', placeholder: '3×' } },
        { name: 'label', type: 'text', required: true, admin: { width: '65%', placeholder: 'more engagement per post' } },
      ] },
    ] },
  ],
};

export const caseStudyBlocks = [ImageBlock, GalleryBlock, TextBlock, BeforeAfterBlock, PaletteBlock, TypeBlock, VideoBlock, QuoteBlock, StatsBlock];
