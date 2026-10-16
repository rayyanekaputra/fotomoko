// Filmy (Figma 23:163): white card with a dark film column on the left (4 black & white
// photos and a row of sprocket holes), a sideways barcode and title on the
// right, and a faint smiley cropped at the bottom right.

import { drawCover, drawText, drawRotatedImage, fillRect } from '../draw_utils.js';

const W = 401;
const H = 1390;
const DARK = '#212121';

// Film column (23:169): 286 wide, padding 12, gap 16 between photos and holes.
const COL_W = 286;
const PAD = 12;
const GAP = 16;
const HOLE_W = 19.806;
const HOLE_H = 12.527;
const HOLES = 44;
const SLOT_W = COL_W - PAD * 2 - GAP - HOLE_W; // 226.194
const SLOT_H = (H - PAD * 2 - GAP * 3) / 4; // 329.5

const title = { font: '400 63.566px "Koulen"', size: 63.566, color: '#222', trim: 'cap', rotate: -90, align: 'center' };

export default {
  id: 'filmy',
  name: 'Filmy',
  width: W,
  height: H,
  slots: [0, 1, 2, 3].map((i) => ({ x: PAD, y: PAD + i * (SLOT_H + GAP), w: SLOT_W, h: SLOT_H })),
  fonts: [title.font],
  images: {
    smiley: 'assets/svg/filmy-smiley.svg',
    barcode: 'assets/svg/filmy-barcode.svg',
  },
  fields: [
    { key: 'title', label: 'Title', default: 'Fotomoko' },
  ],

  draw(ctx, { photos, fields, images }) {
    fillRect(ctx, 0, 0, W, H, '#ffffff');

    // Smiley (23:164): 280.331 square at -15°, centred in a 343.334 box at (181.73, 891.57).
    drawRotatedImage(ctx, images.smiley, 181.73 + 343.334 / 2, 891.57 + 343.334 / 2, 280.331, 280.331, -15);

    fillRect(ctx, 0, 0, COL_W, H, DARK);
    this.slots.forEach((slot, i) => {
      drawCover(ctx, photos[i], slot, { tone: { type: 'luminosity', color: '#000000' } });
    });

    // Sprocket holes (23:179), spread top to bottom of the padded column.
    const holeX = PAD + SLOT_W + GAP;
    const step = (H - PAD * 2 - HOLE_H) / (HOLES - 1);
    for (let i = 0; i < HOLES; i++) fillRect(ctx, holeX, PAD + i * step, HOLE_W, HOLE_H, '#ffffff');

    // Barcode (23:224): 413.242×40.2 image rotated -90° into a 40.22×413.24 box at (323.53, 33.36).
    drawRotatedImage(ctx, images.barcode, 323.53 + 40.22 / 2, 33.36 + 413.24 / 2, 413.242, 40.2002, -90);

    // Title (23:275): 45×229 box centred on x 343.64, top 1127.62.
    drawText(ctx, fields.title, { x: 343.64 - 45 / 2, y: 1127.62, w: 45, h: 229 }, title);
  },
};
