/**
 * Generative SVG artwork.
 *
 * Every piece is a pure function of its key, so server and client renders
 * produce identical markup (no hydration mismatches). Gradient / filter ids
 * are derived from the key; identical keys produce identical defs, so
 * duplicates on one page are harmless.
 *
 * Swap any piece for a real image by giving the project a `cover` in
 * content/site.ts — <Media> will render that instead.
 */

type Rnd = () => number;

interface BustOpts {
  skin: string;
  shade: string;
  hair?: 'bob' | 'long' | 'messy' | 'bun' | 'curly' | 'blond' | 'buzz' | 'cap' | 'short';
  hairC?: string;
  top?: string;
  glasses?: boolean;
  closed?: boolean;
  smile?: boolean;
  blush?: boolean;
  earring?: boolean;
  brow?: string;
  lip?: string;
  collar?: string;
  over?: string;
}

interface PortraitOpts extends BustOpts {
  bg: string;
  wide?: boolean;
  tx?: number;
  ty?: number;
  sc?: number;
  tf?: string;
  deco?: string;
  fg?: string;
  defs?: string;
}

let prefix = 'a';
let uid = 0;
const U = () => `${prefix}-${uid++}`;

const svg = (vb: string, body: string, defs = '') =>
  `<svg class="svg-art" viewBox="${vb}" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">${defs ? `<defs>${defs}</defs>` : ''}${body}</svg>`;

// Fonts resolve through page CSS (.svg-art .t-display / .t-sans)
const PF = 'class="t-display"';
const SF = 'class="t-sans"';

function rng(seed: number): Rnd {
  let s = (seed * 2654435761) >>> 0 || 7;
  return () => {
    s ^= s << 13; s >>>= 0;
    s ^= s >>> 17;
    s ^= s << 5; s >>>= 0;
    return s / 4294967296;
  };
}

function blob(cx: number, cy: number, r: number, jit: number, n: number, rnd: Rnd) {
  const p: [number, number][] = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const rr = r * (1 - jit + rnd() * jit * 2);
    p.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]);
  }
  const m = (a: [number, number], b: [number, number]) => [((a[0] + b[0]) / 2).toFixed(1), ((a[1] + b[1]) / 2).toFixed(1)];
  let d = 'M' + m(p[n - 1], p[0]).join(' ');
  for (let i = 0; i < n; i++) {
    const q = p[(i + 1) % n];
    d += ` Q${p[i][0].toFixed(1)} ${p[i][1].toFixed(1)} ${m(p[i], q).join(' ')}`;
  }
  return d + 'Z';
}

/* ---------- a flat, stylised bust in a 300x360 space ---------- */
function bust(o: BustOpts) {
  const sk = o.skin, sh = o.shade, hc = o.hairC || '#1c1714', top = o.top || '#222';
  let back = '', front = '';
  switch (o.hair) {
    case 'bob':
      back = `<path d="M84 186C78 100 118 84 150 84s74 16 66 102c-2 30-10 48-14 58H98c-6-10-12-30-14-58z" fill="${hc}"/>`;
      front = `<path d="M98 152c4-44 38-56 54-54 30-2 52 16 52 54-18-24-42-30-58-22-18-8-34 0-48 22z" fill="${hc}"/>`;
      break;
    case 'long':
      back = `<path d="M86 170c-4-70 28-92 64-92s70 24 64 92l10 120H76z" fill="${hc}"/>`;
      front = `<path d="M98 152c4-44 38-56 54-54 30-2 52 16 52 54-18-24-42-30-58-22-18-8-34 0-48 22z" fill="${hc}"/>`;
      break;
    case 'messy':
      back = `<path d="M70 200C60 110 100 72 150 74c56-2 94 36 82 126-4 30-14 44-22 50l-8-90c-10-30-40-44-52-44s-44 10-56 44l-6 90c-10-8-16-24-18-50z" fill="${hc}"/>`;
      front = `<path d="M96 150c0-40 30-64 56-62 34 0 58 26 54 64-6-18-18-30-30-34 6 14 6 24 2 32-8-18-22-30-40-32 4 10 2 18-4 24-6-10-16-16-24-16-6 6-12 14-14 24z" fill="${hc}"/><path d="M104 140c-10 20-8 44-2 64M198 138c10 24 8 46 0 66M120 118c-14 16-18 30-16 46" stroke="${hc}" stroke-width="3" fill="none" stroke-linecap="round"/>`;
      break;
    case 'bun':
      back = `<circle cx="150" cy="80" r="28" fill="${hc}"/>`;
      front = `<path d="M98 150c2-44 32-58 52-58 26 0 52 14 52 58-16-26-44-32-52-30-12-2-38 4-52 30z" fill="${hc}"/>`;
      break;
    case 'curly': {
      let c = '';
      for (let i = 0; i < 14; i++) {
        const a = Math.PI * (1.02 + (i / 13) * 0.96);
        c += `<circle cx="${(150 + Math.cos(a) * 56).toFixed(1)}" cy="${(150 + Math.sin(a) * 62).toFixed(1)}" r="${18 + (i % 3) * 3}" fill="${hc}"/>`;
      }
      back = c;
      front = `<path d="M100 146c6-30 30-46 50-46s46 14 52 46c-16-14-34-18-52-18s-36 4-50 18z" fill="${hc}"/>`;
      break;
    }
    case 'blond':
      front = `<path d="M98 146c-4-40 20-66 58-70 30-4 52 14 50 36 4 10 2 22-4 34-12-20-34-28-58-26-18 2-34 10-46 26z" fill="${hc}"/><path d="M122 92c14-12 40-18 60-8" stroke="#fff" stroke-opacity=".45" stroke-width="3" fill="none"/>`;
      break;
    case 'buzz':
      front = `<path d="M100 144c2-38 28-52 50-52s48 14 50 52c-14-20-32-26-50-26s-36 6-50 26z" fill="${hc}" opacity=".85"/>`;
      break;
    case 'cap':
      front = `<path d="M96 138c0-40 28-56 54-56s54 16 54 56z" fill="${hc}"/><path d="M150 132h78q-2 14-24 14h-54z" fill="${hc}"/>`;
      break;
    default:
      front = `<path d="M98 148c-2-44 26-60 52-60 28 0 56 16 52 60-6-16-18-28-34-30-22-4-54 2-70 30z" fill="${hc}"/>`;
  }
  const eyes = o.glasses
    ? `<circle cx="127" cy="160" r="19" fill="#17242a" stroke="#c7a05a" stroke-width="2.5"/><circle cx="173" cy="160" r="19" fill="#17242a" stroke="#c7a05a" stroke-width="2.5"/><path d="M146 157q4-4 8 0" stroke="#c7a05a" stroke-width="2.5" fill="none"/><path d="M115 153q7-8 17-7M161 153q7-8 17-7" stroke="#fff" stroke-opacity=".5" stroke-width="3" fill="none" stroke-linecap="round"/>`
    : o.closed
      ? `<path d="M120 160q9 7 18 0M162 160q9 7 18 0" stroke="#1a1a1a" stroke-width="3" fill="none" stroke-linecap="round"/>`
      : `<ellipse cx="130" cy="160" rx="5.5" ry="3.6" fill="#161616"/><ellipse cx="170" cy="160" rx="5.5" ry="3.6" fill="#161616"/>`;
  const brows = o.glasses ? '' : `<path d="M118 146q12-7 23-1M159 145q11-6 23 1" stroke="${o.brow || hc}" stroke-width="4" fill="none" stroke-linecap="round"/>`;
  const mouth = o.smile
    ? `<path d="M134 194q16 16 32 0z" fill="#fff" stroke="#8a2a26" stroke-width="3.5" stroke-linejoin="round"/>`
    : `<path d="M137 198q13-7 26 0q-13 10-26 0z" fill="${o.lip || '#b8483f'}"/>`;
  const blush = o.blush ? `<circle cx="122" cy="184" r="9" fill="#f07a7a" opacity=".35"/><circle cx="178" cy="184" r="9" fill="#f07a7a" opacity=".35"/>` : '';
  const ear = o.earring ? `<circle cx="100" cy="184" r="5" fill="none" stroke="#d9b36a" stroke-width="2.5"/><circle cx="200" cy="184" r="5" fill="none" stroke="#d9b36a" stroke-width="2.5"/>` : '';
  return `${back}<path d="M20 372c4-70 58-104 110-110q20 16 40 0c52 6 106 40 110 110z" fill="${top}"/>${o.collar || ''}<path d="M130 200v62q20 16 40 0v-62z" fill="${sh}"/><ellipse cx="100" cy="164" rx="8" ry="13" fill="${sh}"/><ellipse cx="200" cy="164" rx="8" ry="13" fill="${sh}"/><ellipse cx="150" cy="158" rx="50" ry="62" fill="${sk}"/>${blush}${brows}${eyes}<path d="M150 166q-6 16 2 20" stroke="${sh}" stroke-width="3" fill="none" stroke-linecap="round"/>${mouth}${front}${ear}${o.over || ''}`;
}

function portrait(o: PortraitOpts) {
  const W = o.wide ? 1000 : 300, H = o.wide ? 440 : 360;
  const tf = o.wide ? `translate(${o.tx ?? 298},${o.ty ?? -14}) scale(${o.sc ?? 1.35})` : o.tf || '';
  return svg(`0 0 ${W} ${H}`, `<rect width="${W}" height="${H}" fill="${o.bg}"/>${o.deco || ''}<g transform="${tf}">${bust(o)}</g>${o.fg || ''}`, o.defs || '');
}

function glitch(r: Rnd) {
  const cols = ['#ff4d8d', '#46e0ff', '#ffe23d', '#7c5cff', '#ffffff', '#ff7a2f'];
  let s = '';
  for (let i = 0; i < 4; i++) {
    const y = 132 + r() * 70, h = 6 + r() * 16;
    s += `<rect x="${(88 + r() * 30).toFixed(0)}" y="${y.toFixed(0)}" width="${(60 + r() * 80).toFixed(0)}" height="${h.toFixed(0)}" fill="${cols[Math.floor(r() * cols.length)]}" opacity=".9"/>`;
  }
  return s;
}
function paint(r: Rnd) {
  const cols = ['#ff5f3a', '#ffd23f', '#38d6c4', '#ff4fa3', '#6a5cff', '#9be15d'];
  let s = '';
  for (let i = 0; i < 3; i++) s += `<path d="${blob(120 + r() * 60, 140 + r() * 60, 22 + r() * 22, 0.35, 7, r)}" fill="${cols[Math.floor(r() * cols.length)]}" opacity=".92"/>`;
  return s;
}

const SK = [['#F3CDB0', '#DDA886'], ['#E3AB84', '#C88A64'], ['#C68A60', '#A56E48'], ['#9A6343', '#7C4D33'], ['#6E4630', '#553424'], ['#F7DCC8', '#E2B79B']];
const HC = ['#191513', '#3a2719', '#E9D27C', '#B8342A', '#EDEDED', '#6B4BD8', '#FF6FAE', '#1F7A5C', '#191513', '#2b1c14'];
const BG = ['#F2A33A', '#4B5BFF', '#FF6A3D', '#7ED9C5', '#C9B6FF', '#FFE45C', '#FF8FB1', '#2D2D2D', '#9BE15D', '#E9E4DA', '#3CC7F0', '#B23AEE', '#FF4B4B', '#1F9E74'];
const TOP = ['#1c1c1c', '#F5F5F5', '#E8542B', '#2F5BFF', '#F2C94C', '#7A3FF2', '#1F8A70', '#FF5FA2'];
const HAIRS: BustOpts['hair'][] = ['short', 'bob', 'bun', 'curly', 'blond', 'buzz', 'messy', 'long', 'cap'];

function avatar(seed: number, fxRate = 0.4) {
  const r = rng(seed + 11);
  const pick = <T,>(a: T[]) => a[Math.floor(r() * a.length)];
  const s = pick(SK);
  const o: PortraitOpts = {
    skin: s[0], shade: s[1], hair: pick(HAIRS), hairC: pick(HC), top: pick(TOP), bg: pick(BG),
    glasses: r() < 0.22, closed: r() < 0.1, smile: r() < 0.22, blush: r() < 0.3, earring: r() < 0.2,
  };
  const fx = r();
  if (fx < fxRate * 0.5) o.over = glitch(r);
  else if (fx < fxRate) o.over = paint(r);
  if (o.bg === o.top) o.top = '#1c1c1c';
  o.tf = 'translate(-30,-10) scale(1.2)';
  const d = r();
  if (d < 0.25) o.deco = `<circle cx="${(40 + r() * 220).toFixed(0)}" cy="${(40 + r() * 120).toFixed(0)}" r="${(30 + r() * 40).toFixed(0)}" fill="#fff" opacity=".25"/>`;
  else if (d < 0.45) o.deco = `<path d="M0 ${(220 + r() * 60).toFixed(0)}L300 ${(140 + r() * 60).toFixed(0)}V360H0z" fill="#000" opacity=".12"/>`;
  return portrait(o);
}

/* ---------- named pieces ---------- */
const P: Record<string, () => string> = {
  staff: () => portrait({
    bg: '#E9E3D7', skin: '#F3CDB0', shade: '#DDA886', hair: 'cap', hairC: '#151515', top: '#EA5A1F', tf: 'translate(-44,70) scale(.95)',
    fg: `<text x="286" y="66" text-anchor="end" ${PF} font-size="58" fill="#151515">STAFF</text><text x="286" y="86" text-anchor="end" ${SF} font-size="11" font-weight="700" fill="#151515">COFFEE ROASTERS</text><text x="286" y="100" text-anchor="end" ${SF} font-size="11" font-weight="700" fill="#151515">SINCE MMXX</text><rect x="218" y="318" width="68" height="26" rx="4" fill="#151515"/><text x="252" y="336" text-anchor="middle" ${SF} font-size="11" font-weight="700" fill="#fff">No.14</text>`,
  }),
  fleur: () => {
    const g = U();
    const grass = Array.from({ length: 40 }, (_, i) => `<path d="M${i * 8} 360q${(i % 3) - 1} -30 ${(i % 5) - 2} -${50 + ((i * 37) % 60)}" stroke="#2e6b2a" stroke-width="2" fill="none" opacity=".5"/>`).join('');
    return svg('0 0 300 360', `<rect width="300" height="360" fill="url(#${g})"/>${grass}<g transform="translate(108,168) scale(.3)">${bust({ skin: '#E3AB84', shade: '#C88A64', hair: 'short', hairC: '#2b1c14', top: '#F4EFE6' })}</g><rect x="112" y="276" width="10" height="40" fill="#F4EFE6"/><rect x="176" y="276" width="10" height="40" fill="#F4EFE6"/><circle cx="96" cy="300" r="26" stroke="#1b1b1b" stroke-width="4" fill="none"/><circle cx="206" cy="300" r="26" stroke="#1b1b1b" stroke-width="4" fill="none"/><path d="M96 300l40-40h50l20 40M136 260l14 40" stroke="#1b1b1b" stroke-width="4" fill="none"/><text x="150" y="70" text-anchor="middle" ${SF} font-size="16" font-weight="500" fill="#fff" font-style="italic">a film festival</text><text x="150" y="110" text-anchor="middle" ${PF} font-size="44" fill="#fff">le FLEUR*</text>`,
      `<linearGradient id="${g}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6FB356"/><stop offset="1" stop-color="#2F7A2B"/></linearGradient>`);
  },
  knight: () => svg('0 0 300 360', `<rect width="300" height="360" fill="#F4A716"/><text x="150" y="44" text-anchor="middle" ${SF} font-size="9" font-weight="700" fill="#7a1d0c" letter-spacing="2">A NEW PLAY IN THREE ACTS</text><path d="M70 330c10-80 30-120 70-150 10-30 30-40 40-38 10 4 10 24 0 44 30 30 44 80 50 144z" fill="#141414"/><path d="M40 250l60-40 20 20z" fill="#141414"/><circle cx="178" cy="136" r="18" fill="#141414"/><path d="M168 118l10-16 10 16" fill="#F4A716"/><text x="286" y="238" text-anchor="end" ${PF} font-size="36" fill="#9b1d0d">THE</text><text x="286" y="276" text-anchor="end" ${PF} font-size="40" fill="#9b1d0d">GREEN</text><text x="286" y="318" text-anchor="end" ${PF} font-size="40" fill="#9b1d0d">KNIGHT</text>`),
  allgood: () => {
    const g = U();
    const lines = Array.from({ length: 9 }, (_, i) => `<path d="M${20 + i * 32} 0v360" stroke="#cfcfc9" stroke-width="1"/>`).join('');
    return svg('0 0 300 360', `<rect width="300" height="360" fill="#E4E4DF"/>${lines}<text x="14" y="70" ${PF} font-size="60" fill="#151515">ALL GOOD</text><text x="14" y="130" ${PF} font-size="60" fill="#151515">THINGS</text><text x="14" y="290" ${PF} font-size="56" fill="#151515">COME</text><text x="14" y="346" ${PF} font-size="56" fill="#151515">TO AN END</text><g transform="rotate(-24 170 200)"><rect x="140" y="120" width="70" height="170" rx="26" fill="url(#${g})"/><rect x="160" y="84" width="30" height="44" rx="6" fill="#6c2bd9"/><rect x="150" y="190" width="50" height="40" rx="4" fill="#fff" opacity=".85"/><path d="M152 136q8 50 0 140" stroke="#fff" stroke-opacity=".5" stroke-width="6" fill="none"/></g>`,
      `<linearGradient id="${g}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e05bff"/><stop offset="1" stop-color="#6a1fd1"/></linearGradient>`);
  },
  nine: () => svg('0 0 300 360', `<rect width="300" height="360" fill="#151515"/><rect x="14" y="14" width="272" height="332" rx="12" fill="#E5491B"/><text x="150" y="330" text-anchor="middle" ${PF} font-size="380" fill="#151515" opacity=".95">9</text><rect x="84" y="120" width="132" height="150" fill="#6FA7E8"/><g transform="translate(70,150) scale(.42)">${bust({ skin: '#F3CDB0', shade: '#DDA886', hair: 'short', hairC: '#3a2719', top: '#EDE6D9' })}</g><g transform="translate(118,146) scale(.44)">${bust({ skin: '#C68A60', shade: '#A56E48', hair: 'curly', hairC: '#191513', top: '#2D2D2D' })}</g><text x="30" y="40" ${SF} font-size="12" font-weight="800" fill="#151515">NOVEL</text><text x="270" y="40" text-anchor="end" ${SF} font-size="12" font-weight="800" fill="#151515">SUMMERS</text>`),
  fluffy: () => {
    const f = U(), g = U();
    const r = rng(5);
    let c = '';
    for (let i = 0; i < 26; i++) {
      const t = i / 25;
      const x = 150 + Math.sin(t * Math.PI * 2.2) * 70;
      const y = 70 + t * 240;
      c += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(26 + r() * 18).toFixed(1)}"/>`;
    }
    return svg('0 0 300 360', `<rect width="300" height="360" fill="url(#${g})"/><g fill="#9FB6FF" filter="url(#${f})" transform="translate(8,10)" opacity=".7">${c}</g><g fill="#fff" filter="url(#${f})">${c}</g><text x="18" y="34" ${SF} font-size="18" font-weight="800" fill="#fff" letter-spacing="1">FLUFFY</text><text x="18" y="52" ${SF} font-size="12" font-weight="600" fill="#fff" letter-spacing="3">WORM</text>`,
      `<filter id="${f}" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="7"/></filter><linearGradient id="${g}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2E55FF"/><stop offset="1" stop-color="#1531C9"/></linearGradient>`);
  },
  sixty: () => svg('0 0 300 360', `<rect width="300" height="360" fill="#1E3FD6"/><rect width="300" height="150" fill="#E3262B"/><circle cx="220" cy="120" r="70" fill="#F7C51E"/><text x="150" y="286" text-anchor="middle" ${PF} font-size="200" fill="#fff">66</text><rect x="0" y="306" width="300" height="30" fill="#F7C51E"/><text x="150" y="327" text-anchor="middle" ${SF} font-size="15" font-weight="800" fill="#151515" letter-spacing="2">SUMMER FESTIVAL</text><text x="22" y="46" ${PF} font-size="40" fill="#fff">31TH</text><text x="22" y="70" ${SF} font-size="12" font-weight="700" fill="#fff" letter-spacing="2">OF AUGUST</text>`),
  rings: () => {
    let c = '';
    for (let i = 8; i > 0; i--) c += `<circle cx="150" cy="230" r="${i * 26}" fill="${i % 2 ? '#141414' : '#E2552C'}"/>`;
    return svg('0 0 300 360', `<rect width="300" height="360" fill="#E2552C"/>${c}<path d="${blob(150, 238, 62, 0.3, 9, rng(4))}" fill="#E7A577"/><circle cx="130" cy="226" r="10" fill="#141414"/><circle cx="130" cy="226" r="4" fill="#fff"/><text x="150" y="64" text-anchor="middle" ${PF} font-size="44" fill="#fff" transform="scale(1,-1) translate(0,-100)">Rosch</text><text x="150" y="100" text-anchor="middle" ${PF} font-size="36" fill="#fff">Brandt</text>`);
  },
  friday: () => svg('0 0 300 360', `<rect width="300" height="360" fill="#F7C518"/><path d="M60 110l150-30 40 190-150 30z" fill="#fff"/><path d="M60 110l150-30 8 40-150 30z" fill="#E3262B"/><path d="M82 250l150-30 8 40-150 30z" fill="#E3262B"/><text x="0" y="0" ${SF} font-size="34" font-weight="800" fill="#151515" transform="translate(88 196) rotate(-11)">Friday</text><text x="0" y="0" ${SF} font-size="12" font-weight="600" fill="#151515" transform="translate(92 216) rotate(-11)">social can be happy</text><rect x="200" y="40" width="46" height="46" rx="8" fill="#151515" transform="rotate(14 223 63)"/>`),
  peach: () => {
    const g = U();
    const r = rng(9);
    return svg('0 0 300 360', `<rect width="300" height="360" fill="url(#${g})"/><path d="${blob(160, 200, 92, 0.3, 8, r)}" fill="#F19A6F"/><path d="M120 150q30-60 60-10t40 70" stroke="#b35a3a" stroke-width="16" fill="none" stroke-linecap="round"/><path d="M110 240q40 40 90 0" stroke="#fff" stroke-opacity=".27" stroke-width="10" fill="none" stroke-linecap="round"/><circle cx="84" cy="96" r="26" fill="#fff" opacity=".35"/>`,
      `<linearGradient id="${g}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFD9C0"/><stop offset="1" stop-color="#FF9A7E"/></linearGradient>`);
  },
  mellow: () => portrait({
    bg: '#2F8C58', skin: '#9A6343', shade: '#7C4D33', hair: 'cap', hairC: '#1F5C39', top: '#F5F5F5', smile: true, tf: 'translate(40,90) scale(.85)',
    deco: `<path d="M20 70q30-50 70-10t60-20 60 30 70-20" stroke="#fff" stroke-width="24" fill="none" stroke-linecap="round"/><path d="M30 140q40-30 70 0t70-10 60 20" stroke="#fff" stroke-width="18" fill="none" stroke-linecap="round" opacity=".9"/><circle cx="260" cy="56" r="14" fill="#fff"/>`,
    fg: `<rect x="208" y="300" width="80" height="22" rx="11" fill="#fff"/><text x="248" y="315" text-anchor="middle" ${SF} font-size="10" font-weight="700" fill="#1F5C39">MELLOW</text>`,
  }),
  collage: () => {
    const r = rng(21);
    let sc = '';
    for (let i = 0; i < 6; i++) sc += `<path d="M${(20 + r() * 260).toFixed(0)} ${(20 + r() * 320).toFixed(0)}q${(40 - r() * 80).toFixed(0)} ${(40 - r() * 80).toFixed(0)} ${(60 - r() * 120).toFixed(0)} ${(60 - r() * 120).toFixed(0)}" stroke="#151515" stroke-width="2" fill="none"/>`;
    const lines = Array.from({ length: 8 }, (_, i) => `<rect x="182" y="${54 + i * 12}" width="${50 + ((i * 17) % 40)}" height="4" fill="#9a9a94"/>`).join('');
    return svg('0 0 300 360', `<rect width="300" height="360" fill="#D9D8D2"/><rect x="0" y="210" width="300" height="150" fill="#C9241F"/><rect x="170" y="40" width="110" height="120" fill="#fff"/>${lines}<g transform="translate(10,60) scale(.72)" style="filter:grayscale(1)">${bust({ skin: '#e2e2e2', shade: '#bdbdbd', hair: 'messy', hairC: '#3a3a3a', top: '#555', over: `<rect x="90" y="150" width="120" height="22" fill="#7FE35B"/>` })}</g>${sc}`);
  },
  sketch: () => {
    let s = '';
    const r = rng(33);
    for (let i = 0; i < 18; i++) s += `<rect x="${(r() * 280).toFixed(0)}" y="${(r() * 340).toFixed(0)}" width="${(20 + r() * 50).toFixed(0)}" height="${(8 + r() * 26).toFixed(0)}" fill="${r() < 0.5 ? '#2E5BFF' : '#fff'}" opacity=".85" transform="rotate(${(r() * 30 - 15).toFixed(0)})"/>`;
    return svg('0 0 300 360', `<rect width="300" height="360" fill="#EDEDF4"/>${s}<g transform="translate(20,40) scale(.86)">${bust({ skin: '#F7DCC8', shade: '#E2B79B', hair: 'short', hairC: '#151515', top: '#F2F2F2', over: `<path d="M100 150h100M110 170h80" stroke="#2E5BFF" stroke-width="5"/>` })}</g><text x="150" y="44" text-anchor="middle" ${PF} font-size="46" fill="#2E5BFF" opacity=".8">GALLERY</text>`);
  },
  neon: () => portrait({
    bg: '#F2EFE9', skin: '#F3CDB0', shade: '#DDA886', hair: 'bun', hairC: '#151515', top: '#E3262B', smile: true, tf: 'translate(-20,40) scale(.9)',
    deco: `<text x="10" y="300" ${PF} font-size="170" fill="#3DDC84" transform="rotate(-8 150 250)">Neo</text><text x="80" y="350" ${PF} font-size="120" fill="#2E5BFF" transform="rotate(-8 150 250)">NU</text>`,
  }),
  swirl: () => {
    const g = U(), f = U();
    const cols = ['#F2C230', '#2D6ACB', '#E0E3EA', '#1E2E55', '#F28C28'];
    const paths = Array.from({ length: 16 }, (_, i) => `<path d="M${-40 + i * 24} 380 C ${40 + i * 10} ${260 - i * 8}, ${-20 + i * 22} ${120 + i * 6}, ${80 + i * 16} -20" stroke="${cols[i % 5]}" stroke-width="12" fill="none"/>`).join('');
    return svg('0 0 300 360', `<rect width="300" height="360" fill="#3b4f7a"/><g filter="url(#${f})">${paths}</g><circle cx="200" cy="100" r="40" fill="url(#${g})"/>`,
      `<radialGradient id="${g}"><stop offset="0" stop-color="#FFE68A"/><stop offset="1" stop-color="#F2C230" stop-opacity="0"/></radialGradient><filter id="${f}"><feTurbulence baseFrequency=".02" numOctaves="2" seed="4"/><feDisplacementMap in="SourceGraphic" scale="18"/></filter>`);
  },
  map: () => {
    const lines = Array.from({ length: 12 }, (_, i) => `<path d="M0 ${30 * i}q150 ${i % 2 ? 30 : -30} 300 0" stroke="#c9c9c3" fill="none"/>`).join('');
    return svg('0 0 300 360', `<rect width="300" height="360" fill="#F1F1EE"/>${lines}<path d="M40 300L120 180 180 220 260 60" stroke="#6B3FD8" stroke-width="4" fill="none"/><text x="20" y="60" ${PF} font-size="40" fill="#151515">HOME</text><text x="20" y="100" ${PF} font-size="40" fill="#151515">END</text>`);
  },
  moda: () => svg('0 0 300 360', `<rect width="300" height="360" fill="#3a3a3a"/><text x="150" y="70" text-anchor="middle" ${PF} font-size="64" fill="#f2f2f2" letter-spacing="4">MODA</text><g transform="translate(40,90) scale(.75)">${bust({ skin: '#6E4630', shade: '#553424', hair: 'buzz', hairC: '#111', top: '#111', glasses: true })}</g><rect x="0" y="330" width="300" height="30" fill="#F2C94C"/>`),
  halftone: () => {
    let d = '';
    for (let i = 0; i < 11; i++) for (let j = 0; j < 11; j++) {
      const k = Math.abs(i - 5) + Math.abs(j - 5);
      d += `<circle cx="${25 + i * 25}" cy="${25 + j * 25}" r="${Math.max(1.4, 11 - k * 1.25).toFixed(1)}"/>`;
    }
    return svg('0 0 300 300', `<rect width="300" height="300" fill="#0C0C0C"/><g fill="#F5F5F2">${d}</g>`);
  },
  rainbow: () => {
    const g = U();
    let w = '';
    for (let k = 0; k < 11; k++) {
      const y = 60 + k * 17;
      w += `<path d="M-20 ${y + 90}L80 ${y}L160 ${y + 50}L320 ${y - 30}" stroke="url(#${g})" stroke-width="20" fill="none" stroke-linejoin="round" opacity="${(0.35 + k * 0.06).toFixed(2)}"/>`;
    }
    const cap = Array.from({ length: 5 }, (_, i) => `<rect x="196" y="${236 + i * 8}" width="${70 - i * 6}" height="3"/>`).join('');
    return svg('0 0 300 300', `<rect width="300" height="300" fill="#170F2E"/>${w}<g fill="#fff" opacity=".7">${cap}</g>`,
      `<linearGradient id="${g}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#6A2BFF"/><stop offset=".3" stop-color="#2F8BFF"/><stop offset=".5" stop-color="#3DDC84"/><stop offset=".7" stop-color="#FFD23F"/><stop offset="1" stop-color="#FF3B3B"/></linearGradient>`);
  },
  burst: () => svg('0 0 300 300', `<rect width="300" height="300" fill="#F4EFE6"/><g stroke="#151515" stroke-width="3" stroke-linejoin="round"><path d="M40 60l110 40 30-70 40 110 60-20-60 100 40 60-110-30-40 60-20-110-70-20 80-40z" fill="#E3262B"/><path d="M90 110l60 20 20-40 20 70 40-10-40 60 20 30-60-20-20 40-10-60-40-10 40-30z" fill="#3DDC84"/><path d="M130 140l24 8 8-16 8 28 16-4-16 24 8 12-24-8-8 16-4-24-16-4 16-12z" fill="#FFD23F"/></g><path d="M200 40l30 30-30 30z" fill="#2E5BFF"/>`),
  party: () => {
    const r = rng(77);
    const cols = ['#E3262B', '#FFD23F', '#2E5BFF', '#FF6FAE', '#fff'];
    let s = '';
    for (let i = 0; i < 9; i++) s += `<path d="${blob(60 + r() * 180, 70 + r() * 170, 16 + r() * 30, 0.4, 7, r)}" fill="${cols[i % 5]}"/>`;
    return svg('0 0 300 300', `<rect width="300" height="300" fill="#4E9F6A"/><circle cx="220" cy="80" r="70" fill="#3781C9" opacity=".6"/>${s}<path d="M60 250q60-80 120-40t80-40" stroke="#151515" stroke-width="6" fill="none" stroke-linecap="round"/>`);
  },
  eye: () => {
    const stripes = Array.from({ length: 5 }, (_, i) => `<rect x="${48 + i * 18}" y="40" width="9" height="60" fill="#151515"/>`).join('');
    const dots = Array.from({ length: 6 }, (_, i) => `<circle cx="${306 + (i % 3) * 14}" cy="${166 + Math.floor(i / 3) * 18}" r="3.5"/>`).join('');
    return svg('0 0 400 240', `<rect width="400" height="240" fill="#2B2BF5"/><g transform="translate(200 120)"><circle r="92" fill="none" stroke="#fff" stroke-width="10" stroke-dasharray="4 14" opacity=".4"/><path d="M-120 0Q0 -110 120 0Q0 110 -120 0z" fill="#fff"/><g class="pupil"><circle r="42" fill="#2B2BF5"/><circle r="42" fill="none" stroke="#151515" stroke-width="6"/><circle r="18" fill="#101010"/><circle cx="-12" cy="-12" r="7" fill="#fff"/></g><path d="M-120 0Q0 -110 120 0" stroke="#151515" stroke-width="7" fill="none"/></g><g transform="rotate(-20 88 70)"><rect x="40" y="40" width="100" height="60" rx="30" fill="#fff"/>${stripes}</g><rect x="276" y="36" width="80" height="36" rx="18" fill="#FF9AC4" transform="rotate(-24 316 54)"/><circle cx="320" cy="176" r="26" fill="#E3262B"/><g fill="#fff">${dots}</g>`);
  },
  pop: () => {
    const checks = Array.from({ length: 12 }, (_, i) => `<rect x="${i % 2 ? 11 : 0}" y="${i * 30}" width="11" height="15" fill="#fff"/>`).join('');
    return portrait({
      bg: '#EBA6F0', skin: '#F7DCC8', shade: '#E2B79B', hair: 'short', hairC: '#39C6A8', top: '#F4F0EA', closed: true, smile: true, blush: true, tf: 'translate(32,6) scale(1.02)',
      deco: `<rect x="0" y="0" width="22" height="360" fill="#151515"/>${checks}<path d="M40 150v-50a36 36 0 0 1 72 0v50z" fill="#fff"/><circle cx="76" cy="220" r="26" fill="#FFE23D"/><path d="M66 216h2M84 216h2M66 228q10 8 20 0" stroke="#151515" stroke-width="3" stroke-linecap="round" fill="none"/><path d="M230 40q30 60 0 120t20 120" stroke="#C8F53A" stroke-width="18" fill="none"/><ellipse cx="248" cy="120" rx="38" ry="12" fill="none" stroke="#FF7A2F" stroke-width="6" transform="rotate(-20 248 120)"/><circle cx="248" cy="120" r="16" fill="#E3262B"/>`,
    });
  },
  flower: () => {
    const g = U(), g2 = U(), f = U();
    let petals = '';
    for (let i = 0; i < 12; i++) petals += `<ellipse cx="0" cy="-92" rx="30" ry="72" transform="rotate(${i * 30})" fill="url(#${g})" stroke="#7a2bd1" stroke-opacity=".25" stroke-width="2"/>`;
    return svg('0 0 400 480', `<rect width="400" height="480" fill="#F7F7F5"/><path d="M230 200C150 300 360 360 220 480" stroke="#3F8A3A" stroke-width="12" fill="none"/><g transform="translate(250 130) rotate(8)">${petals}<circle r="40" fill="#E0512A"/><circle r="40" fill="url(#${g2})"/></g><circle cx="140" cy="380" r="90" fill="none" stroke="url(#${g})" stroke-width="26" filter="url(#${f})" opacity=".8"/>`,
      `<linearGradient id="${g}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FF8A3D"/><stop offset=".55" stop-color="#E86BC8"/><stop offset="1" stop-color="#8F4BF2"/></linearGradient><radialGradient id="${g2}"><stop offset="0" stop-color="#FFD23F"/><stop offset="1" stop-color="#E0512A" stop-opacity="0"/></radialGradient><filter id="${f}"><feGaussianBlur stdDeviation="10"/></filter>`);
  },
  sunny: () => portrait({ wide: true, bg: '#EE6B3F', skin: '#F2C3A0', shade: '#DB9F7C', hair: 'messy', hairC: '#3b2416', top: '#F7B3B8', glasses: true, lip: '#D1403A', earring: true, deco: `<circle cx="820" cy="80" r="160" fill="#fff" opacity=".07"/><circle cx="160" cy="420" r="200" fill="#000" opacity=".06"/>` }),
  sunny2: () => portrait({ wide: true, bg: '#2E5BFF', skin: '#C68A60', shade: '#A56E48', hair: 'curly', hairC: '#191513', top: '#FFD23F', earring: true, smile: true, deco: `<circle cx="180" cy="100" r="140" fill="#fff" opacity=".08"/>` }),
  sunny3: () => portrait({ wide: true, bg: '#1F9E74', skin: '#F7DCC8', shade: '#E2B79B', hair: 'bob', hairC: '#E9D27C', top: '#151515', glasses: true, deco: `<path d="M0 440L1000 200V440z" fill="#000" opacity=".1"/>` }),
  designer: () => portrait({ bg: '#EE6A1E', skin: '#8A5537', shade: '#6D412A', hair: 'long', hairC: '#1a110c', top: '#F07E22', earring: true, tf: 'translate(0,20)', collar: `<path d="M110 280q40 40 80 0" stroke="#c9540f" stroke-width="4" fill="none"/>`, deco: `<circle cx="240" cy="70" r="90" fill="#fff" opacity=".08"/>` }),
  blond: () => portrait({ bg: '#D6145A', skin: '#F4D3BE', shade: '#DDAE92', hair: 'blond', hairC: '#EFE3B8', top: '#151515', tf: 'translate(0,-10) scale(1.05)', lip: '#c9716a', deco: `<circle cx="80" cy="330" r="120" fill="#FF7BB4" opacity=".6"/><circle cx="80" cy="330" r="70" fill="#D6145A" opacity=".8"/>` }),

  /* Abstract stand-ins for sensitive client categories (sports/gambling marketing):
     deliberately generic shapes and invented copy, no real people, teams, logos or brands. */
  matchday: () => {
    const g = U();
    return svg('0 0 300 360', `<rect width="300" height="360" fill="url(#${g})"/><circle cx="150" cy="150" r="70" fill="none" stroke="#fff" stroke-width="3" stroke-dasharray="10 8" opacity=".6"/><path d="M150 90a60 60 0 0 1 0 120" fill="none" stroke="#fff" stroke-width="3" opacity=".4"/><circle cx="150" cy="150" r="26" fill="#fff"/><path d="M150 128l19 14-7 22h-24l-7-22z" fill="#151515"/><text x="150" y="252" text-anchor="middle" ${PF} font-size="34" fill="#fff">MATCH</text><text x="150" y="288" text-anchor="middle" ${PF} font-size="34" fill="#fff">DAY</text><text x="150" y="40" text-anchor="middle" ${SF} font-size="11" font-weight="700" fill="#fff" opacity=".7" letter-spacing="3">SOCIAL CAMPAIGN</text>`,
      `<linearGradient id="${g}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#5B1AA8"/><stop offset="1" stop-color="#1A0F3D"/></linearGradient>`);
  },
  crashgame: () => {
    const g = U();
    const dots = Array.from({ length: 16 }, (_, i) => `<circle cx="${(20 + ((i * 53) % 260)).toFixed(0)}" cy="${(20 + ((i * 97) % 320)).toFixed(0)}" r="${1 + (i % 3)}" fill="#fff" opacity=".5"/>`).join('');
    return svg('0 0 300 360', `<rect width="300" height="360" fill="url(#${g})"/>${dots}<path d="M30 320Q120 280 170 190T260 40" stroke="#3DDC84" stroke-width="5" fill="none" stroke-linecap="round"/><g transform="translate(255,55) rotate(-35)"><path d="M0 0l22 6-6 22z" fill="#fff"/></g><text x="150" y="300" text-anchor="middle" ${PF} font-size="46" fill="#3DDC84">2.45x</text><text x="150" y="40" text-anchor="middle" ${SF} font-size="11" font-weight="700" fill="#fff" opacity=".7" letter-spacing="3">CRASH GAME POSTER</text>`,
      `<linearGradient id="${g}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0F1E45"/><stop offset="1" stop-color="#1C0F45"/></linearGradient>`);
  },
  winners: () => {
    const r = rng(41);
    let confetti = '';
    const cols = ['#FFD23F', '#3DDC84', '#FF6FAE', '#fff'];
    for (let i = 0; i < 22; i++) confetti += `<rect x="${(r() * 300).toFixed(0)}" y="${(r() * 360).toFixed(0)}" width="6" height="10" fill="${cols[i % 4]}" opacity=".85" transform="rotate(${(r() * 360).toFixed(0)} 150 150)"/>`;
    return svg('0 0 300 360', `<rect width="300" height="360" fill="#7A1230"/>${confetti}<path d="M120 210h60l10 40h-80z" fill="#F2C94C"/><path d="M110 150h80v50a40 40 0 0 1-80 0z" fill="#F7DE7A"/><path d="M110 160c-18 0-30-14-30-30h30zM190 160c18 0 30-14 30-30h-30z" fill="none" stroke="#F7DE7A" stroke-width="8"/><text x="150" y="100" text-anchor="middle" ${PF} font-size="30" fill="#fff">WINNER</text><text x="150" y="330" text-anchor="middle" ${SF} font-size="11" font-weight="700" fill="#fff" opacity=".75" letter-spacing="3">ANNOUNCEMENT GRAPHIC</text>`);
  },
};

export type ArtKey = keyof typeof P | `av:${number}` | `art:${number}`;

/** Returns the SVG markup for an artwork key. Pure and deterministic. */
export function art(key: string): string {
  prefix = 'a' + key.replace(/[^a-z0-9]/gi, '');
  uid = 0;
  if (key.startsWith('av:')) return avatar(+key.slice(3));
  if (key.startsWith('art:')) return avatar(+key.slice(4), 0.9);
  return (P[key] || P.fluffy)();
}
