// Frame 39 (Figma 21:2): white vertical strip, 4 black & white photos,
// sideways labels and colour swatches on the right.

import { drawCover, drawText, fillRect, dates } from '../draw_utils.mjs';

const W = 401;
const H = 1391;
const SLOT_W = 246.2;
const SLOT_H = 327.734;
const GAP = 16;

const FONT = '"Iosevka Charon"';
const bold = { font: `700 24px ${FONT}`, size: 24, letterSpacing: -1.2, rotate: -90 };
const regular = { font: `400 24px ${FONT}`, size: 24, letterSpacing: -1.2, rotate: -90 };
const small = { font: `400 12px ${FONT}`, size: 12, rotate: -90 };

// Top to bottom.
const SWATCHES = ['#a47453', '#37bad1', '#decdb9', '#aea5b1'];

export default {
  id: 'strip-classic',
  name: 'Classic strip',
  width: W,
  height: H,
  slots: [0, 1, 2, 3].map((i) => ({ x: 16, y: 16 + i * (SLOT_H + GAP), w: SLOT_W, h: SLOT_H })),
  fonts: [bold.font, regular.font, small.font],
  fields: [
    { key: 'brand', label: 'Title', default: 'FOTOMOKO' },
    { key: 'day', label: 'Date', default: dates.dayMonth() },
    { key: 'year', label: 'Year', default: dates.year() },
    { key: 'device', label: 'Bottom label', default: 'PIXEL 6A' },
    { key: 'code', label: 'Code', default: '1ASDFtasDCZXfgtzr!ASBGASDFAVC' },
  ],

  draw(ctx, { photos, fields }) {
    fillRect(ctx, 0, 0, W, H, '#ffffff');

    this.slots.forEach((slot, i) => {
      drawCover(ctx, photos[i], slot, { tone: { type: 'luminosity', color: '#000000' } });
    });

    // Rotated text boxes are anchored at their bottom edge (where the text starts).
    drawText(ctx, fields.brand, { x: 302.25, y: 320, w: 31, h: 92 }, bold);
    drawText(ctx, fields.day, { x: 302.25, y: 1012, w: 31, h: 62 }, regular);
    drawText(ctx, fields.year, { x: 337.25, y: 1029, w: 31, h: 45 }, regular);
    drawText(ctx, fields.device, { x: 302.25, y: 1280, w: 31, h: 77 }, bold);
    drawText(ctx, fields.code, { x: 370.25, y: 16, w: 15, h: 172 }, small);

    SWATCHES.forEach((color, i) => fillRect(ctx, 302.25, 745 + i * 29, 36, 18, color));
  },
};
