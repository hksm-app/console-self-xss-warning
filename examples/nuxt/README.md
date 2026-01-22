# Nuxt 3

## Client-only plugin

Create `plugins/console-warning.client.ts`:

```ts
import { showConsoleWarning } from "console-self-xss-warning";

export default defineNuxtPlugin(() => {
  showConsoleWarning({ productionOnly: true });
});
```

## Re-log on route changes

Create `plugins/console-warning.client.ts`:

```ts
import { showConsoleWarning } from "console-self-xss-warning";

export default defineNuxtPlugin(() => {
  const route = useRoute();

  watch(
    () => route.fullPath,
    () => {
      showConsoleWarning({ once: false, clearConsole: false, productionOnly: true });
    },
    { immediate: true }
  );
});
```

## Custom translations

```ts
import { showConsoleWarning } from "console-self-xss-warning";

export default defineNuxtPlugin(() => {
  showConsoleWarning({
    translations: {
      en: {
        title: "STOP!",
        message: "Private area.\nDo not paste anything here."
      }
    }
  });
});
```
