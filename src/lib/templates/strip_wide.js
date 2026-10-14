// Frame 40 (Figma 21:21): yellow horizontal strip, 3 black & white photos,
// then a panel with the date, "Fotomoko" and a big cropped smiley.

import { drawCover, drawText, drawRotatedImage, fillRect, dates } from '../draw_utils.js';

const W = 1064.8;
const H = 359.734;
const SLOT_W = 246.2;
const SLOT_H = 327.734;
const GAP = 16;
const PANEL_X = 16 + 3 * (SLOT_W + GAP); // 4th column

const title = { font: '500 24px "Inter"', size: 24, color: '#222' };
const date = { font: '500 16px "Inter"', size: 16, color: '#222', rotate: 90 };

export default {
  id: 'strip-wide',
  name: 'Wide strip',
  width: W,
  height: H,
  slots: [0, 1, 2].map((i) => ({ x: 16 + i * (SLOT_W + GAP), y: 16, w: SLOT_W, h: SLOT_H })),
  fonts: [title.font, date.font],
  images: { smiley: 'assets/svg/smiley-wide.svg' },
  fields: [
    { key: 'date', label: 'Date', default: dates.long() },
    { key: 'title', label: 'Title', default: 'Fotomoko' },
  ],

  draw(ctx, { photos, fields, images }) {
    fillRect(ctx, 0, 0, W, H, '#f2d965');

    // Photo overflows its slot in Figma (312×415 in 246×328).
    this.slots.forEach((slot, i) => {
      drawCover(ctx, photos[i], slot, { tone: { type: 'luminosity', color: '#000000' }, zoom: 415 / SLOT_H });
    });

    // Smiley: 280.331 square rotated -11.78°, centred in a 331.674 box.
    const box = 331.674;
    drawRotatedImage(ctx, images.smiley, PANEL_X + 0.4 + box / 2, 16 + 122 + box / 2, 280.331, 280.331, -11.78);

    drawText(ctx, fields.title, { x: PANEL_X + 76.4, y: 16 + 148 }, title);
    drawText(ctx, fields.date, { x: PANEL_X + 0.4, y: 16, w: 19, h: 149 }, date);
  },
};
