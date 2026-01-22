# Solid

## Basic usage

```tsx
import { onMount } from "solid-js";
import { showConsoleWarning } from "console-self-xss-warning";

export function ConsoleWarning() {
  onMount(() => {
    showConsoleWarning({ productionOnly: true });
  });

  return null;
}
```

## Solid Router: re-log on route change

```tsx
import { createEffect, onMount } from "solid-js";
import { useLocation } from "@solidjs/router";
import { showConsoleWarning } from "console-self-xss-warning";

export function ConsoleWarning() {
  const location = useLocation();

  onMount(() => {
    showConsoleWarning({ productionOnly: true });
  });

  createEffect(() => {
    const pathname = location.pathname;
    if (pathname) {
      showConsoleWarning({ once: false, clearConsole: false, productionOnly: true });
    }
  });

  return null;
}
```
