# Backlog

Ideas and features to pick up later. Not scheduled.

## UI

- **Proper UI.** The real UI comes after it's redesigned in Figma.
- **Keep the current UI as a test bench.** Keep it on purpose, as a proper tool for testing the canvas: templates/frames, polaroid, and filters later. It should be dev-only and stay out of the production build (e.g. a separate `test.html` entry that Vite doesn't build).

## Photos

- **Photo filters.** Let the user pick a filter (B&W, duotone, sepia, film grain, …) instead of, or on top of, each template's built-in look.
- **Photo aspect / cropping.** Decide the capture aspect ratio and how photos are cropped to each template slot (most slots are 3:4, the ticket slots are near-square).

## Capture

- Camera capture with countdown, front-camera mirroring, retakes.
- Pick the template before or after shooting.

## Sharing

- Share sheet (`navigator.share`) alongside download.
- PWA / offline support.

## Deploy

- Set up Cloudflare Pages (see `README.md` for the two options). Connecting the Git repo needs it pushed to GitHub/GitLab first.
