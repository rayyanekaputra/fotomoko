# Backlog

Ideas and features to pick up later. Not scheduled.

## UI

- **Proper UI.** The real UI comes after it's redesigned in Figma.
- **Keep the current UI as a test bench.** Keep it on purpose, as a proper tool for testing the canvas: templates/frames, polaroid, and filters later. It should be dev-only and stay out of the production build (e.g. a separate `test.html` entry that Vite doesn't build).

## Photos

- **Photo filters.** Let the user pick a filter (B&W, duotone, sepia, film grain, …) instead of, or on top of, each template's built-in look.
- **Swatch colour override.** `strip-classic`'s swatches are automatic only; colour inputs to override them could come later.
- **Palette in other templates.** `extractPalette()` could tint other templates (borders, text, backgrounds) from the photos.
- **Photo aspect / cropping.** Decide the capture aspect ratio and how photos are cropped to each template slot (most slots are 3:4, the ticket slots are near-square).

## Capture

- Camera capture with countdown, front-camera mirroring, retakes.
- Pick the template before or after shooting.

## Sharing

- Share sheet (`navigator.share`) alongside download.
- PWA / offline support.

## Deploy

- Set up Cloudflare Pages (see `README.md` for the two options). Connecting the Git repo needs it pushed to GitHub/GitLab first.

## QA

- **Safari / iOS check.** Nobody here has an iOS device; a friend will test on the staging deploy. Watch for: canvas `letterSpacing` (Safari 18+ only; older iOS draws `strip-classic` text tighter), the iOS canvas size cap at 4×, font loading, and later the camera (needs HTTPS).
