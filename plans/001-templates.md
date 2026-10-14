# 001 — Photo templates (frames, film, polaroid, tickets)

**Status:** all 6 templates implemented (2026-10-14), waiting for QA.

Goal: turn the 6 Figma frames into HTML templates that render a finished PNG from a set of photos. Camera capture comes later; this plan covers only the templates, built one at a time.

Figma file: `ECge2TwI3tAvp2la9VQgb0` (Fotomoko, Page 1).

## The 6 templates

| # | Figma frame | Name (working) | Size (px) | Photos | Look |
|---|---|---|---|---|---|
| 1 | Frame 39 `21:2` | `strip-classic` | 401×1391 | 4 (3:4) | White strip, B&W photos. A rotated side band holds "FOTOMOKO", the date, a device label, 4 colour swatches and a small code string |
| 2 | Frame 40 `21:21` | `strip-wide` | 1065×360 | 3 (3:4) | Yellow background, B&W photos, rotated date, "Fotomoko" plus a big cropped smiley logo |
| 3 | Frame 43 `21:234` | `film` | 400×1391 | 4 (3:4) | Black film strip. Duotone photos (yellow / grey / blue / blue), shape markers per frame, rotated yellow text, and a 3-colour bar on the right |
| 4 | Frame 44 `21:274` | `polaroid` | 1073×1405 | 3 (3:4) | Cream paper, colour photos in a 2×2 grid with the 4th cell empty, a handwritten name, a big yellow handwritten "fotomoko" and smiley stamps |
| 5 | Frame 41 `21:37` | `ticket-wide` | 1368×463 | 3 (~1:1) | Red-header boarding pass in a mono font, flight/from/to/date/gate/time/seat fields, a barcode and a faded smiley watermark |
| 6 | Frame 42 `21:138` | `ticket-tall` | 559×1064 | 1 | Portrait boarding pass: the photo on top, then the same red header, fields and barcode below |

## Approach

**Draw every template on a `<canvas>`, not with DOM/CSS.** The finished product is a PNG. Turning HTML/CSS into an image needs either a library (which we want to avoid) or the SVG `foreignObject` trick, which breaks on iOS Safari. Drawing directly on a canvas gives one code path for both the preview and the export, and works the same on every phone.

- Each template is one module that exports plain data plus a `draw` function:
  ```js
  export default {
    id: 'strip-classic',
    name: 'Classic strip',
    width: 401, height: 1391,     // Figma size; rendered at `scale` (e.g. 3x) for export
    slots: [{ x, y, w, h }, ...],  // photo boxes in Figma coordinates
    fonts: ['...'],               // loaded before drawing
    draw(ctx, { photos, fields, scale }) { ... },
  };
  ```
- Measurements come straight from Figma (`get_design_context` per frame while building it), so the canvas output matches the design 1:1. Positions are written in Figma pixels and multiplied by `scale` at draw time.
- Photos are fitted to each slot like CSS `object-fit: cover`, centre-cropped.
- Text that changes (date, name, flight code, etc.) lives in `fields` with sensible defaults. The date defaults to today.

### Shared helpers (`draw_utils.mjs`)

- `drawCover(ctx, img, slot)`: crop the photo to fill its slot
- Photo filters: `grayscale`, `duotone(dark, light)`. Work on the small, slot-sized pixels, never on full-resolution photos
- `drawRotatedText(ctx, text, x, y, angle, font)` for the sideways labels
- `roundRect` / clipping, and `drawBarcode` (simple Code 128 or a decorative pattern)
- Shapes: circle, triangle, square markers; the smiley logo

### Assets

- The smiley logo and the airplane/seat icons are exported from Figma as SVG into `assets/` and drawn with `drawImage`.
- Fonts come from Google Fonts. I'll confirm the exact families from Figma. My guesses from the screenshots: a condensed sans for the strips, a mono for the tickets, a handwriting font for the polaroid.

### Test page

Until the camera exists, `index.html` has a simple dev view:
- a template picker
- "load photos" (file input, several at once) plus the sample photos in `assets/photo/`
- inputs for the text fields, export options, a live canvas preview and a "Download PNG" button (`canvas.toBlob`)

### Export

Works like strukfoto's export:

- **Native**: the template on its own at **1×, 2×, 3× or 4×** the Figma size (3× is the default). At 4×, the tall strips come out around 1600×5560, which is still within iOS canvas limits.
- **Story (9:16)**: 1080×1920 at 1×, with the template centred and scaled to fit, with margins.
- **Square (1:1)**: 1080×1080 at 1×, same idea.
- The 1×–4× multiplier also applies to story and square (e.g. a 2× story is 2160×3840).
- **iOS limit:** iOS Safari refuses canvases above ~16.7 MP. A 4× story (4320×7680 ≈ 33 MP) and a 4× square (≈ 18.7 MP) go over it. The export automatically lowers the scale to the largest one that fits and shows a short note.
- Story and square backgrounds are either **broken white `#F5F2EA`** or **dark grey `#1E1E1E`**.

The template is drawn once at the chosen scale. Story and square then draw that result onto the bigger canvas, so templates never need to know about export formats.

### Text fields

All text in the designs is placeholder. Every template lists its text in `fields` (key, label, default), and the test page builds one input per field automatically. The date defaults to today.

## Files

| File | Role |
|---|---|
| `index.html` | Markup, inline CSS, entry script, dev/test view |
| `main.mjs` | Wires up the picker, photo loading, preview and download |
| `elements.mjs` | DOM lookups |
| `draw_utils.mjs` | Shared canvas helpers (above) |
| `fonts.mjs` | Font list plus `document.fonts.load` before drawing |
| `templates/index.mjs` | List of all templates |
| `templates/<id>.mjs` | One file per template |
| `assets/` | SVG logo/icons; `assets/photo/` sample photos |

## Steps (one per session, in this order)

1. **Scaffold and helpers.** Set up `index.html`, the test view, `draw_utils.mjs`, font loading, text field inputs, export (scale, story, square) and sample photos.
2. **`strip-classic`** (Frame 39). The simplest one, and it proves the pipeline: cover-crop, grayscale, rotated text.
3. **`film`** (Frame 43). Adds duotone and shape markers.
4. **`strip-wide`** (Frame 40). Adds the logo.
5. **`polaroid`** (Frame 44). Adds the handwriting font and stamps.
6. **`ticket-wide`** (Frame 41). Adds fields, icons and the barcode.
7. **`ticket-tall`** (Frame 42). Reuses the ticket parts from step 6.

For each step: pull `get_design_context` and the SVG assets for that frame only, build it, compare it with the Figma screenshot in the browser, then commit.

## Later (not in this plan)

Camera capture with countdown, mirroring, picking a template before or after shooting, share sheet, and moving to a PWA/offline setup.

## Decisions

- Photo filters and the capture aspect ratio go to `backlog.md`. For now each template keeps the look shown in Figma, and photos are centre-cropped to fit each slot.
- All text is placeholder and editable (see Text fields).
- Export at 1×/2×/3×/4×, plus story 9:16 and square 1:1 with a broken white or dark grey background.
- Frame 40 has 3 photos. The 4th area is the logo/watermark, as designed.
