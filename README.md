# fotomoko

A photobooth that runs entirely in the browser. Pick a template, load photos (or the samples), edit the text, and download a PNG: template only, story 9:16, or square 1:1, at 1×–4×. Photos never leave your device.

Built with Svelte 5 and Vite. Uses [Bun](https://bun.com).

## Develop

```sh
bun install
bun run dev
```

Dev shortcut: `?template=<id>&format=story&bg=dark&samples` opens a template with the sample photos loaded.

## Build

```sh
bun run build     # static files in dist/
bun run preview   # serve dist/ locally
```

## Deploy (Cloudflare Pages)

`dist/` is a plain static site. Either:

- **Upload a local build:** `bun run build`, then `bunx wrangler pages deploy dist` (or drag `dist/` into the Cloudflare dashboard).
- **Let Cloudflare build from Git:** connect the repo in the Pages dashboard with build command `bun run build` and output directory `dist`.
