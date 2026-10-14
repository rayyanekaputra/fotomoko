// Photo loading. Photos are downscaled once on load so we never keep full
// camera resolution around (12MP+ photos are heavy on phones).

const MAX_PHOTO_EDGE = 2400;

export const SAMPLES = [
  'assets/photo/PXL_20261011_104010409.jpg.jpeg',
  'assets/photo/PXL_20261011_104012242.jpg.jpeg',
  'assets/photo/PXL_20261011_104014157.jpg.jpeg',
  'assets/photo/PXL_20261011_104015738.jpg.jpeg',
];

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.decoding = 'async';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`could not load ${src}`));
    img.src = src;
  });
}

function shrink(img) {
  const k = Math.min(1, MAX_PHOTO_EDGE / Math.max(img.naturalWidth, img.naturalHeight));
  const c = document.createElement('canvas');
  c.width = Math.round(img.naturalWidth * k);
  c.height = Math.round(img.naturalHeight * k);
  c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
  return c;
}

export async function loadFiles(files) {
  const photos = [];
  for (const file of files) {
    const url = URL.createObjectURL(file);
    try {
      photos.push(shrink(await loadImage(url)));
    } finally {
      URL.revokeObjectURL(url);
    }
  }
  return photos;
}

export function loadSamples() {
  return Promise.all(SAMPLES.map(async (src) => shrink(await loadImage(src))));
}

// Fill every slot, repeating photos if there are fewer photos than slots.
export function photosForSlots(template, photos) {
  const n = template.slots.length;
  if (!photos.length) return new Array(n).fill(null);
  return Array.from({ length: n }, (_, i) => photos[i % photos.length]);
}
