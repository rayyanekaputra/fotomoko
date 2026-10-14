<script>
  import { onMount } from 'svelte';
  import { TEMPLATES } from './lib/templates/index.js';
  import { loadSamples } from './lib/photos.js';
  import TemplatePicker from './components/TemplatePicker.svelte';
  import PhotoInput from './components/PhotoInput.svelte';
  import Fields from './components/Fields.svelte';
  import ExportOptions from './components/ExportOptions.svelte';
  import Preview from './components/Preview.svelte';

  // Dev shortcuts for checking templates: ?template=<id>&format=story&bg=dark&samples
  const params = new URLSearchParams(location.search);

  let template = $state(TEMPLATES.find((t) => t.id === params.get('template')) ?? TEMPLATES[0]);
  // Canvases; raw so Svelte doesn't proxy them.
  let photos = $state.raw([]);
  let fieldValues = $state({}); // { [templateId]: { [key]: value } }
  let format = $state(params.get('format') ?? 'native');
  let background = $state(params.get('bg') ?? 'light');
  let scale = $state(3);

  const fields = $derived.by(() => {
    const saved = fieldValues[template.id] || {};
    const out = {};
    for (const f of template.fields) out[f.key] = saved[f.key] ?? f.default;
    return out;
  });

  function setField(key, value) {
    fieldValues[template.id] = { ...fieldValues[template.id], [key]: value };
  }

  onMount(async () => {
    if (params.has('samples')) photos = await loadSamples();
  });
</script>

<aside>
  <h1>fotomoko</h1>
  <TemplatePicker templates={TEMPLATES} bind:template />
  <PhotoInput bind:photos />
  <Fields {template} values={fields} onchange={setField} />
  <ExportOptions {template} {photos} {fields} bind:format bind:background bind:scale />
</aside>

<main>
  <Preview {template} {photos} {fields} {format} {background} />
</main>
