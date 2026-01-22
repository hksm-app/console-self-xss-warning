# Svelte / SvelteKit

## Svelte: onMount

```svelte
<script lang="ts">
  import { onMount } from "svelte";
  import { showConsoleWarning } from "console-self-xss-warning";

  onMount(() => {
    showConsoleWarning({ productionOnly: true });
  });
</script>
```

## SvelteKit: re-log on route changes

```svelte
<script lang="ts">
  import { onMount } from "svelte";
  import { afterNavigate } from "$app/navigation";
  import { showConsoleWarning } from "console-self-xss-warning";

  onMount(() => {
    showConsoleWarning({ productionOnly: true });
  });

  afterNavigate(() => {
    showConsoleWarning({ once: false, clearConsole: false, productionOnly: true });
  });
</script>
```

## Custom translations

```svelte
<script lang="ts">
  import { onMount } from "svelte";
  import { showConsoleWarning } from "console-self-xss-warning";

  onMount(() => {
    showConsoleWarning({
      translations: {
        en: {
          title: "STOP!",
          message: "Developers only.\nDo not paste code here."
        }
      }
    });
  });
</script>
```
