// LINES (Figma 24:1403): orange strip with 4 black & white photos stacked edge to edge
// in the middle, and two matching side bands of sideways text (title,
// hashtag, local time + zone) with a white smiley at opposite ends.

import { drawCover, drawText, drawRotatedImage, fillRect, dates } from '../draw_utils.js';

const W = 401;
const H = 1390;
const SLOT_W = 228;
const SLOT_H = H / 4; // 347.5
const BAND_W = (W - SLOT_W) / 2; // 86.5
const PAD = 20; // band padding along the strip
const TIME_GAP = 30;

const base = { size: 63.566, color: '#222', trim: 'cap', rotate: -90 };
const display = { ...base, font: '400 63.566px "Momo Trust Display"' };
const sans = { ...base, font: '400 63.566px "Momo Trust Sans"' };
const zone = { ...base, font: '400 36.093px "Momo Trust Sans"', size: 36.093 };

function measure(ctx, text, style) {
  ctx.save();
  ctx.font = style.font;
  const w = ctx.measureText(text).width;
  const cap = ctx.measureText('H').actualBoundingBoxAscent;
  ctx.restore();
  return { w, cap };
}

// One side band. Its content is laid out along the strip, reading bottom to
// top: title at the bottom, time + zone at the top, hashtag centred between.
// Each item's cap height is centred across the band (Figma's text-box-trim).
function drawBand(ctx, bandX, fields) {
  const title = measure(ctx, fields.title, display);
  const tag = measure(ctx, fields.tag, sans);
  const time = measure(ctx, fields.time, sans);
  const tz = measure(ctx, fields.zone, zone);
  // The zone is top-aligned with the time, so it centres on the time's cap height.
  tz.cap = time.cap;

  // u = distance from the bottom of the strip.
  const put = (text, u, m, style) => {
    const x = bandX + (BAND_W - m.cap) / 2;
    drawText(ctx, text, { x, y: H - u - m.w, w: m.cap, h: m.w }, style);
  };
  const timeW = time.w + TIME_GAP + tz.w;
  const gap = (H - PAD * 2 - title.w - tag.w - timeW) / 2;
  put(fields.title, PAD, title, display);
  put(fields.tag, PAD + title.w + gap, tag, sans);
  put(fields.time, H - PAD - timeW, time, sans);
  put(fields.zone, H - PAD - tz.w, tz, zone);
}

export default {
  id: 'lines',
  name: 'Lines',
  width: W,
  height: H,
  slots: [0, 1, 2, 3].map((i) => ({ x: BAND_W, y: i * SLOT_H, w: SLOT_W, h: SLOT_H })),
  fonts: [display.font, sans.font, zone.font],
  images: {
    smiley1: 'assets/svg/lines-smiley-1.svg',
    smiley2: 'assets/svg/lines-smiley-2.svg',
  },
  fields: [
    { key: 'title', label: 'Title', default: 'FOTOMOKO' },
    { key: 'tag', label: 'Hashtag', default: '#FOTODULS' },
    { key: 'time', label: 'Time', default: dates.time() },
    { key: 'zone', label: 'Time zone', default: 'WITA' },
  ],

  draw(ctx, { photos, fields, images }) {
    fillRect(ctx, 0, 0, W, H, '#ff9500');

    // Left band: smiley (24:1407) sits under its text and under the photos.
    drawRotatedImage(ctx, images.smiley1, BAND_W / 2, H - 480.62, 174.261, 174.261, -15);
    drawBand(ctx, 0, fields);

    this.slots.forEach((slot, i) => {
      drawCover(ctx, photos[i], slot, { tone: { type: 'luminosity', color: '#000000' } });
    });

    // Right band: smiley (24:1432) sits on top of its text and the photos.
    drawBand(ctx, BAND_W + SLOT_W, fields);
    drawRotatedImage(ctx, images.smiley2, BAND_W + SLOT_W + 46.25, H - 1018.24, 174.261, 174.261, 15.38);
  },
};
