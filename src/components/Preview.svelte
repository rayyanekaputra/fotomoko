<script>
  import { ensureFonts } from '../lib/fonts.js';
  import { loadTemplateImages } from '../lib/assets.js';
  import { renderTo } from '../lib/export.js';
  import { photosForSlots } from '../lib/photos.js';

  let { template, photos, fields, format, background } = $props();

  let wrap;
  let canvas;

  // Re-render at most once per frame when anything changes.
  let frame = 0;
  function scheduleRender() {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(render);
  }

  async function render() {
    const t = template;
    const [, images] = await Promise.all([ensureFonts(t.fonts), loadTemplateImages(t)]);
    if (t !== template) return; // template changed while loading

    // Preview resolution: fit the wrapper, times devicePixelRatio, capped.
    const box = wrap.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const base = format === 'native' ? { w: t.width, h: t.height } : format === 'story' ? { w: 1080, h: 1920 } : { w: 1080, h: 1080 };
    const fit = Math.min(box.width / base.w, box.height / base.h);
    const scale = Math.max(0.1, fit * dpr);

    renderTo(canvas, t, { photos: photosForSlots(t, photos), fields, images, format, background, scale });
    canvas.style.width = `${Math.floor(base.w * fit)}px`;
    canvas.style.height = `${Math.floor(base.h * fit)}px`;
  }

  $effect(() => {
    // Track every input the render reads.
    void [template, photos, fields, format, background];
    scheduleRender();
    return () => cancelAnimationFrame(frame);
  });
</script>

<svelte:window onresize={scheduleRender} />

<div id="preview-wrap" bind:this={wrap}>
  <canvas id="preview" bind:this={canvas}></canvas>
</div>
