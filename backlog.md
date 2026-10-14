# Backlog

Ideas and features to pick up later. Not scheduled.

## Photos

- **Photo filters.** Let the user pick a filter (B&W, duotone, sepia, film grain, …) instead of, or on top of, each template's built-in look.
- **Photo aspect / cropping.** Decide the capture aspect ratio and how photos are cropped to each template slot (most slots are 3:4, the ticket slots are near-square).

## Capture

- Camera capture with countdown, front-camera mirroring, retakes.
- Pick the template before or after shooting.

## Sharing

- Share sheet (`navigator.share`) alongside download.
- PWA / offline support.

## Architecture

- **Migrate to Svelte (big change).** Rebuild the UI in Svelte (likely SvelteKit with `adapter-static`, or plain Svelte + Vite) and keep it fully client-side. This adds a build step, so the "no build step" rule in `AGENTS.md` would change. The canvas templates (`templates/*.mjs`, `draw_utils.mjs`, `export.mjs`) are plain JS and can mostly be reused as-is.
- **Deploy to Cloudflare Pages as a static site.** Two options:
  - Build locally (`bun run build`) and upload the output folder (`build/` for SvelteKit, `dist/` for Vite) with `bunx wrangler pages deploy <dir>` or drag-and-drop in the dashboard.
  - Connect the Git repo and let Cloudflare build on every push (build command `bun run build`, output dir as above; Cloudflare's build image supports Bun, detected from `bun.lock`).
