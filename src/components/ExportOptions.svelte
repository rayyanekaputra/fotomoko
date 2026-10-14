<script>
  import { ensureFonts } from '../lib/fonts.js';
  import { loadTemplateImages } from '../lib/assets.js';
  import { renderTo, resolveScale, canvasToBlob, downloadBlob, ZOOMS } from '../lib/export.js';
  import { photosForSlots } from '../lib/photos.js';

  let {
    template, photos, fields,
    format = $bindable(), background = $bindable(), zoom = $bindable(), scale = $bindable(),
  } = $props();
  let exporting = $state(false);

  const usedScale = $derived(resolveScale(template, format, scale));

  const ZOOM_LABELS = ['S', 'M', 'L', 'XL'];
  // The slider works on stop indexes; `zoom` holds the fraction.
  const zoomIndex = $derived(Math.max(0, ZOOMS.indexOf(zoom)));

  async function download() {
    const t = template;
    const opts = { format, background, zoom, scale };
    exporting = true;
    try {
      const [, images] = await Promise.all([ensureFonts(t.fonts), loadTemplateImages(t)]);
      const canvas = document.createElement('canvas');
      renderTo(canvas, t, { photos: photosForSlots(t, photos), fields, images, ...opts });
      const blob = await canvasToBlob(canvas);
      canvas.width = canvas.height = 0; // free memory right away (iOS)
      const suffix = opts.format === 'native' ? '' : `-${opts.format}`;
      downloadBlob(blob, `fotomoko-${t.id}${suffix}-${opts.scale}x.png`);
    } catch (err) {
      console.error(err);
      alert('Export failed. Try a smaller size.');
    } finally {
      exporting = false;
    }
  }
</script>

<section>
  <h2>Export</h2>
  <label class="row">
    <span>Format</span>
    <select bind:value={format}>
      <option value="native">Template only</option>
      <option value="story">Story 9:16</option>
      <option value="square">Square 1:1</option>
    </select>
  </label>
  {#if format !== 'native'}
    <label class="row">
      <span>Background</span>
      <select bind:value={background}>
        <option value="light">Broken white</option>
        <option value="dark">Dark grey</option>
        <option value="transparent">Transparent</option>
      </select>
    </label>
    <label class="row">
      <span>Template size: {ZOOM_LABELS[zoomIndex]}</span>
      <input
        type="range" min="0" max={ZOOMS.length - 1} step="1"
        value={zoomIndex}
        oninput={(e) => (zoom = ZOOMS[+e.currentTarget.value])}
        list="zoom-stops"
      />
      <datalist id="zoom-stops">
        {#each ZOOMS as _, i}<option value={i}></option>{/each}
      </datalist>
    </label>
  {/if}
  <label class="row">
    <span>Size</span>
    <select bind:value={scale}>
      <option value={1}>1×</option>
      <option value={2}>2× (recommended)</option>
      <option value={3}>3×</option>
      <option value={4}>4×</option>
    </select>
  </label>
  <p id="export-note">
    {#if usedScale < scale}Too big for some phones at {scale}×, so it will export at {usedScale.toFixed(2)}×.{/if}
  </p>
  <button type="button" disabled={exporting} onclick={download}>Download PNG</button>
</section>
