# Astro

## Inline client script in layout

```astro
---
// Place this in your main layout or page.
---

<script type="module">
  import { showConsoleWarning } from "console-self-xss-warning";

  showConsoleWarning({ productionOnly: true });
</script>
```

## Custom translations

```astro
<script type="module">
  import { showConsoleWarning } from "console-self-xss-warning";

  showConsoleWarning({
    translations: {
      en: {
        title: "STOP!",
        message: "Developers only.\nDo not paste code here."
      }
    }
  });
</script>
```
