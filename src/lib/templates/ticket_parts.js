// Shared pieces of the boarding-pass templates (Airplane Ticket and Airplane Ticket Shot).

import { drawText, dates } from '../draw_utils.js';

export const RED = '#d44346';
const GREY = '#5d5d5d';
const INK = '#222';
const MONO = '"IBM Plex Mono"';

export const styles = {
  label: { font: `400 18px ${MONO}`, size: 18, color: GREY, trim: 'cap' },
  value: { font: `500 18px ${MONO}`, size: 18, color: INK, trim: 'cap' },
  flight: { font: `500 32px ${MONO}`, size: 32, color: INK, trim: 'cap' },
  code: { font: `500 48px ${MONO}`, size: 48, color: INK, trim: 'cap' },
  city: { font: `400 12px ${MONO}`, size: 12, color: GREY, trim: 'cap' },
  note: { font: `400 18px ${MONO}`, size: 18, color: GREY, trim: 'cap' },
  title: (size) => ({ font: `700 ${size}px ${MONO}`, size, color: '#fff', trim: 'cap' }),
  subtitle: (size) => ({ font: `400 ${size}px ${MONO}`, size, color: '#fff', trim: 'cap' }),
};

export const TICKET_FONTS = [
  `400 18px ${MONO}`,
  `500 18px ${MONO}`,
  `700 28px ${MONO}`,
];

export const TICKET_FIELDS = [
  { key: 'title', label: 'Title', default: 'FOTOMOKO AIRPLANE TICKETS' },
  { key: 'subtitle', label: 'Subtitle', default: 'BOARDING PASS' },
  { key: 'flight', label: 'Flight', default: 'FTMK 2019' },
  { key: 'from', label: 'From', default: 'UPG' },
  { key: 'fromCity', label: 'From city', default: 'MAKASSAR, INDONESIA' },
  { key: 'to', label: 'To', default: 'HND' },
  { key: 'toCity', label: 'To city', default: 'HANEDA, JAPAN' },
  { key: 'date', label: 'Date', default: dates.monthOrdinal() },
  { key: 'gate', label: 'Gate', default: 'A3' },
  { key: 'time', label: 'Time', default: '21.00' },
  { key: 'seat', label: 'Seat', default: 'C3' },
  { key: 'note', label: 'Note', default: 'THE GATES CLOSES 30 MINUTES BEFORE DEPARTING' },
];

// Cap heights of IBM Plex Mono (0.698 em), used to stack Figma's
// cap-trimmed text boxes the way its auto layout does.
const cap = (size) => size * 0.698;
// Two-line city label: cap-trimmed first line plus one normal line (1.3 em).
const cityHeight = cap(12) + 12 * 1.3;

// "MAKASSAR, INDONESIA" → "MAKASSAR,\nINDONESIA"
const twoLines = (s) => s.replace(/,\s*/, ',\n');

// The FLIGHT / FROM–TO / DATE–GATE–TIME–SIT block. (x, y) = top-left.
// Returns the block height.
export function drawTicketInfo(ctx, x, y, fields, images) {
  const { label, value, flight, code, city } = styles;
  const LABEL_GAP = 14;
  const ROW_GAP = 22;

  // FLIGHT
  drawText(ctx, 'FLIGHT', { x, y }, label);
  drawText(ctx, fields.flight, { x, y: y + cap(18) + LABEL_GAP }, flight);
  let top = y + cap(18) + LABEL_GAP + cap(32) + ROW_GAP;

  // FROM → TO
  const colH = cap(18) + LABEL_GAP + cap(48) + LABEL_GAP + cityHeight;
  const place = (px, lbl, codeText, cityText) => {
    drawText(ctx, lbl, { x: px, y: top }, label);
    drawText(ctx, codeText, { x: px, y: top + cap(18) + LABEL_GAP }, code);
    drawText(ctx, twoLines(cityText), { x: px, y: top + cap(18) + LABEL_GAP + cap(48) + LABEL_GAP }, city);
  };
  place(x, 'FROM', fields.from, fields.fromCity);
  if (images.takeoff) ctx.drawImage(images.takeoff, x + 87 + 75, top + (colH - 24) / 2, 24, 24);
  place(x + 87 + 75 + 24 + 75, 'TO', fields.to, fields.toCity);
  top += colH + ROW_GAP;

  // DATE / GATE / TIME / SIT
  const cols = [
    { lbl: 'DATE', val: fields.date, w: 87 },
    { lbl: 'GATE', val: fields.gate, w: 44 },
    { lbl: 'TIME', val: fields.time, w: 54 },
    { lbl: 'SIT', val: fields.seat, w: 33 },
  ];
  let cx = x;
  for (const c of cols) {
    drawText(ctx, c.lbl, { x: cx, y: top }, label);
    drawText(ctx, c.val, { x: cx, y: top + cap(18) + LABEL_GAP }, value);
    cx += c.w + 56;
  }
  top += cap(18) + LABEL_GAP + cap(18);
  return top - y;
}
