# Vanilla JS

## Basic usage (module/bundler)

```js
import { showConsoleWarning } from "console-self-xss-warning";

showConsoleWarning();
```

## Run after DOM is ready

```js
import { showConsoleWarning } from "console-self-xss-warning";

window.addEventListener("DOMContentLoaded", () => {
  showConsoleWarning({ productionOnly: true });
});
```

## Force language + custom message

```js
import { showConsoleWarning } from "console-self-xss-warning";

showConsoleWarning({
  forceLang: "en",
  translations: {
    en: {
      title: "STOP!",
      message: "Do not paste code here.\nThis is a scam."
    }
  }
});
```

## Re-log on route changes (SPA)

```js
import { showConsoleWarning } from "console-self-xss-warning";

function logOncePerRoute() {
  showConsoleWarning({ once: false, clearConsole: false });
}

window.addEventListener("popstate", logOncePerRoute);
window.addEventListener("hashchange", logOncePerRoute);

logOncePerRoute();
```
