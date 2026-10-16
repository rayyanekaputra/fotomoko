// Shared canvas helpers for templates.
//
// Templates draw in Figma units: the caller has already scaled the context,
// so a template only ever uses the coordinates from the Figma frame. Helpers
// that touch pixels read the current scale from the context transform so they
// work at the real output resolution.

// Scratch canvas reused for pixel work (tones), so we don't allocate one per slot.
const scratch = document.createElement('canvas');
const scratchCtx = scratch.getContext('2d', { willReadFrequently: true });

const DEG = Math.PI / 180;

export function currentScale(ctx) {
  const m = ctx.getTransform();
  return Math.hypot(m.a, m.b);
}

// ---- photos -----------------------------------------------------------------

// Source rect that fills a w×h box like CSS object-fit: cover, centred.
// zoom > 1 crops in further (Figma photos are often scaled past the slot).
export function coverRect(srcW, srcH, w, h, zoom = 1) {
  const scale = Math.max(w / srcW, h / srcH) * zoom;
  const sw = w / scale;
  const sh = h / scale;
  return { sx: (srcW - sw) / 2, sy: (srcH - sh) / 2, sw, sh };
}

function sourceSize(img) {
  return {
    w: img.naturalWidth || img.videoWidth || img.width,
    h: img.naturalHeight || img.videoHeight || img.height,
  };
}

// Draw a photo into a slot, centre-cropped.
//   tone: { type: 'luminosity', color } — Figma's "luminosity" blend of the
//         photo over a solid fill (color '#000' gives plain black & white).
//   zoom: extra crop factor, matching how far the photo overflows its slot in Figma.
//   radius: rounded corners.
export function drawCover(ctx, img, slot, { tone = null, zoom = 1, radius = 0, placeholder = '#d9d9d9' } = {}) {
  const { x, y, w, h } = slot;
  ctx.save();
  if (radius) {
    roundRectPath(ctx, x, y, w, h, radius);
    ctx.clip();
  }
  if (!img) {
    ctx.fillStyle = placeholder;
    ctx.fillRect(x, y, w, h);
    ctx.restore();
    return;
  }
  const src = sourceSize(img);
  const { sx, sy, sw, sh } = coverRect(src.w, src.h, w, h, zoom);

  if (!tone) {
    ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
    ctx.restore();
    return;
  }

  // Tone at output resolution only (never the full photo).
  const s = currentScale(ctx);
  const pw = Math.max(1, Math.round(w * s));
  const ph = Math.max(1, Math.round(h * s));
  scratch.width = pw;
  scratch.height = ph;
  scratchCtx.drawImage(img, sx, sy, sw, sh, 0, 0, pw, ph);
  const data = scratchCtx.getImageData(0, 0, pw, ph);
  luminosityBlend(data.data, hexToRgb(tone.color));
  scratchCtx.putImageData(data, 0, 0);
  ctx.drawImage(scratch, 0, 0, pw, ph, x, y, w, h);
  ctx.restore();
}

function hexToRgb(hex) {
  const n = parseInt(hex.replace('#', ''), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

// W3C "luminosity" blend mode: keep the backdrop's hue and saturation, take
// the luminosity from the photo. Backdrop is a solid colour, so most of the
// work (its offset from its own luminosity) is done once.
function luminosityBlend(px, [br, bg, bb]) {
  const lumB = 0.3 * br + 0.59 * bg + 0.11 * bb;
  const dr = br - lumB;
  const dg = bg - lumB;
  const db = bb - lumB;
  const lo = Math.min(dr, dg, db);
  const hi = Math.max(dr, dg, db);
  for (let i = 0; i < px.length; i += 4) {
    const l = 0.3 * px[i] + 0.59 * px[i + 1] + 0.11 * px[i + 2];
    // ClipColor: pull channels back into range around l.
    let k = 1;
    if (l + lo < 0) k = l / (l - (l + lo));
    if (l + hi > 255) k = Math.min(k, (255 - l) / hi);
    px[i] = l + dr * k;
    px[i + 1] = l + dg * k;
    px[i + 2] = l + db * k;
  }
}

// ---- text -------------------------------------------------------------------

function applyFont(ctx, { font, color = '#222', letterSpacing = 0 }) {
  ctx.font = font;
  ctx.fillStyle = color;
  if ('letterSpacing' in ctx) ctx.letterSpacing = `${letterSpacing}px`;
}

// Distance from the top of a Figma text box to the baseline.
//   trim: 'cap'  — Figma "text-box-trim" to cap height: box top = cap top.
//   otherwise    — CSS line box ("normal" or a lineHeight multiplier).
function baselineOffset(ctx, size, { trim, lineHeight }) {
  const m = ctx.measureText('H');
  if (trim === 'cap') return m.actualBoundingBoxAscent;
  const asc = m.fontBoundingBoxAscent ?? size * 0.9;
  const desc = m.fontBoundingBoxDescent ?? size * 0.25;
  if (!lineHeight) return asc;
  return (lineHeight * size - (asc + desc)) / 2 + asc;
}

function lineAdvance(ctx, size, lineHeight) {
  if (lineHeight) return lineHeight * size;
  const m = ctx.measureText('H');
  return (m.fontBoundingBoxAscent ?? size * 0.9) + (m.fontBoundingBoxDescent ?? size * 0.25);
}

// Draw text in a Figma text box.
//   box: { x, y } top-left of the box as shown in Figma (for rotated text,
//        the rotated bounding box, plus w/h).
//   rotate: 0, -90 (reads bottom-to-top) or 90 (reads top-to-bottom).
//   size: font size in px (needed for line metrics).
//   Text may contain '\n' for extra lines.
export function drawText(ctx, text, box, style) {
  const { size, rotate = 0, trim = null, lineHeight = null, align = 'left' } = style;
  ctx.save();
  applyFont(ctx, style);

  let length; // available run length along the text direction (for align)
  if (rotate === -90) {
    ctx.translate(box.x, box.y + box.h);
    ctx.rotate(-90 * DEG);
    length = box.h;
  } else if (rotate === 90) {
    ctx.translate(box.x + box.w, box.y);
    ctx.rotate(90 * DEG);
    length = box.h;
  } else {
    ctx.translate(box.x, box.y);
    length = box.w;
  }

  ctx.textBaseline = 'alphabetic';
  ctx.textAlign = align;
  const ax = align === 'center' ? (length || 0) / 2 : align === 'right' ? (length || 0) : 0;
  let by = baselineOffset(ctx, size, { trim, lineHeight });
  const adv = lineAdvance(ctx, size, lineHeight);
  for (const line of String(text).split('\n')) {
    ctx.fillText(line, ax, by);
    by += adv;
  }
  ctx.restore();
}

// ---- shapes and images --------------------------------------------------------

export function roundRectPath(ctx, x, y, w, h, r = 0) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

export function fillRect(ctx, x, y, w, h, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
}

// Draw an image of size w×h centred on (cx, cy), rotated by `angle` degrees.
export function drawRotatedImage(ctx, img, cx, cy, w, h, angle = 0) {
  if (!img) return;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(angle * DEG);
  ctx.drawImage(img, -w / 2, -h / 2, w, h);
  ctx.restore();
}

// ---- dates --------------------------------------------------------------------

const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
const MONTHS_LONG = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

function ordinal(n) {
  const s = n % 100 >= 11 && n % 100 <= 13 ? 'th' : ['th', 'st', 'nd', 'rd'][n % 10] || 'th';
  return `${n}${s}`;
}

export const dates = {
  dayMonth: (d = new Date()) => `${d.getDate()} ${MONTHS[d.getMonth()]}`, // 14 OCT
  year: (d = new Date()) => String(d.getFullYear()), // 2026
  long: (d = new Date()) => `${MONTHS_LONG[d.getMonth()]} ${ordinal(d.getDate())}, ${d.getFullYear()}`, // October 14th, 2026
  monthOrdinal: (d = new Date()) => `${MONTHS[d.getMonth()]} ${ordinal(d.getDate()).toUpperCase()}`, // OCT 14TH
  time: (d = new Date()) => `${String(d.getHours()).padStart(2, '0')}.${String(d.getMinutes()).padStart(2, '0')}`, // 12.31, browser local time
};
