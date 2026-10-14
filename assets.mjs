// Loads the static images (SVG logos, icons) a template declares in
// `images: { key: 'assets/svg/...' }`. Cached, so each file loads once.

const cache = new Map();

function load(src) {
  if (!cache.has(src)) {
    cache.set(src, new Promise((resolve) => {
      const img = new Image();
      // Wait for decode too: Safari (and sometimes Chrome) draws a blank
      // SVG if drawImage runs right after onload.
      img.onload = () => img.decode().catch(() => {}).then(() => resolve(img));
      img.onerror = () => {
        console.warn('asset failed to load:', src);
        resolve(null);
      };
      img.src = src;
    }));
  }
  return cache.get(src);
}

export async function loadTemplateImages(template) {
  const entries = Object.entries(template.images || {});
  const loaded = await Promise.all(entries.map(([, src]) => load(src)));
  return Object.fromEntries(entries.map(([key], i) => [key, loaded[i]]));
}
