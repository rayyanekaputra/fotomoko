<script>
  // Text inputs built from the template's `fields`.
  let { template, values, onchange } = $props();
</script>

<section>
  <h2>Text</h2>
  <div id="fields">
    {#each template.fields as f (template.id + f.key)}
      <label class="row">
        <span>{f.label}</span>
        <input type="text" value={values[f.key]} oninput={(e) => onchange(f.key, e.currentTarget.value)}>
      </label>
    {/each}
  </div>
</section>
