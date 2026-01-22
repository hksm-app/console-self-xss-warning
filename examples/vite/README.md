# Vite (framework-agnostic)

## main.ts / main.js

```ts
import { showConsoleWarning } from "console-self-xss-warning";

showConsoleWarning({ productionOnly: true });
```

## Custom translations + force language

```ts
import { showConsoleWarning } from "console-self-xss-warning";

showConsoleWarning({
  forceLang: "en",
  translations: {
    en: {
      title: "STOP!",
      message: "Developers only.\nDo not paste code here."
    }
  }
});
```

## Re-log on route changes (SPA)

```ts
import { showConsoleWarning } from "console-self-xss-warning";

function logOncePerRoute() {
  showConsoleWarning({ once: false, clearConsole: false });
}

window.addEventListener("popstate", logOncePerRoute);
window.addEventListener("hashchange", logOncePerRoute);

logOncePerRoute();
```
