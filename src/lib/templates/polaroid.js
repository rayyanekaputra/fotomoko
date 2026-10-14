// Frame 44 (Figma 21:274): cream paper, 3 colour photos in a 2×2 grid,
// a handwritten name, a huge yellow "fotomoko" and two smiley stamps.

import { drawCover, drawText, drawRotatedImage, fillRect } from '../draw_utils.js';

const W = 1073.071;
const H = 1404.595;
const SLOT_W = 500.536;
const SLOT_H = 666.297;
const GAP = 24;
const PAPER = '#fefef2';

const HAND = '"Just Me Again Down Here"';
const big = { font: `400 359.617px ${HAND}`, size: 359.617, color: '#f2d965', lineHeight: 1.005 };
const name = { font: `400 40px ${HAND}`, size: 40, color: '#222', lineHeight: 1.005 };

export default {
  id: 'polaroid',
  name: 'Polaroid',
  width: W,
  height: H,
  slots: [
    { x: 24, y: 24, w: SLOT_W, h: SLOT_H },
    { x: 24 + SLOT_W + GAP, y: 24, w: SLOT_W, h: SLOT_H },
    { x: 24, y: 24 + SLOT_H + GAP, w: SLOT_W, h: SLOT_H },
  ],
  fonts: [big.font],
  images: {
    stamp1: 'assets/svg/polaroid-stamp-1.svg',
    stamp2: 'assets/svg/polaroid-stamp-2.svg',
  },
  fields: [
    { key: 'name', label: 'Name', default: 'Eka Putra, Rayyan' },
    { key: 'brand', label: 'Big text', default: 'fotomoko' },
  ],

  draw(ctx, { photos, fields, images }) {
    fillRect(ctx, 0, 0, W, H, PAPER);

    // Photo overflows its slot in Figma (657×875 in 501×666).
    this.slots.forEach((slot, i) => {
      drawCover(ctx, photos[i], slot, { zoom: 875 / SLOT_H, placeholder: '#e8e8dc' });
    });

    drawText(ctx, fields.brand, { x: 34, y: 1123 }, big);

    // Stamps: 82px square, rotated, centred in their Figma boxes.
    drawRotatedImage(ctx, images.stamp1, 660.496 + 97.018 / 2, 1245.494 + 97.018 / 2, 82, 82, -11.78);
    drawRotatedImage(ctx, images.stamp2, 951.003 + 97.811 / 2, 1339 + 97.811 / 2, 82, 82, 12.51);

    drawText(ctx, fields.name, { x: 549, y: 714 }, name);
  },
};
