# Qwik

## Client-only with useVisibleTask$

```tsx
import { component$, useVisibleTask$ } from "@builder.io/qwik";
import { showConsoleWarning } from "console-self-xss-warning";

export const ConsoleWarning = component$(() => {
  useVisibleTask$(() => {
    showConsoleWarning({ productionOnly: true });
  });

  return null;
});
```

## Re-log on location change

```tsx
import { component$, useTask$ } from "@builder.io/qwik";
import { useLocation } from "@builder.io/qwik-city";
import { showConsoleWarning } from "console-self-xss-warning";

export const ConsoleWarning = component$(() => {
  const location = useLocation();

  useTask$(({ track }) => {
    track(() => location.url.pathname);
    showConsoleWarning({ once: false, clearConsole: false, productionOnly: true });
  });

  return null;
});
```
