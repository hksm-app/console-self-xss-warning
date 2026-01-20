# console-self-xss-warning

Show a self-XSS warning in the browser console to protect users from social
engineering.

## Install

```
npm install console-self-xss-warning
```

## Quick start

```ts
import { showConsoleWarning } from "console-self-xss-warning";

showConsoleWarning();
```

## Next.js (App Router)

Call it in a client component so it runs only in the browser.

```tsx
"use client";

import { useEffect } from "react";
import { showConsoleWarning } from "console-self-xss-warning";

export function ConsoleWarning() {
  useEffect(() => {
    showConsoleWarning({ productionOnly: true });
  }, []);

  return null;
}
```

Re-log on route changes:

```tsx
"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { showConsoleWarning } from "console-self-xss-warning";

export function ConsoleWarning() {
  const pathname = usePathname();

  useEffect(() => {
    showConsoleWarning({ once: false, clearConsole: false, productionOnly: true });
  }, [pathname]);

  return null;
}
```

## Configuration

| parameter | default | required | description |
| --- | --- | --- | --- |
| `translations` | built-in translations | no | override texts and styles per language |
| `forceLang` | auto-detect (`navigator.language`) | no | force a specific language |
| `once` | `true` | no | show only once per page load |
| `productionOnly` | `false` | no | show only in production mode |
| `clearConsole` | `false` | no | clear the console before logging |
| `productionOnlyEnvKey` | default key list | no | read `productionOnly` from an env variable |

### Common options

```ts
showConsoleWarning({
  once: true,            // show only once per page load
  clearConsole: false,   // optionally clear console before warning
  productionOnly: false  // gate by production environment
});
```

### Custom translation

```ts
showConsoleWarning({
  translations: {
    en: {
      title: "STOP!",
      message:
        "This is for developers only.\nIf someone asks you to paste code here, it is a scam.",
      titleStyle: "color:#d00;font-size:52px;font-weight:900;",
      messageStyle: "font-size:16px;"
    }
  }
});
```

### Full custom JSON

```ts
const translations = {
  en: {
    title: "STOP!",
    message: "Private area.\nDo not paste anything here."
  },
  fr: {
    title: "STOP !",
    message: "Zone privée.\nNe collez rien ici."
  }
};

showConsoleWarning({
  translations,
  forceLang: "en",
  clearConsole: true
});
```

## Environment config for productionOnly

If you want `productionOnly` to be driven by an environment variable, pass
your own key name using `productionOnlyEnvKey`.

```ts
showConsoleWarning({
  productionOnlyEnvKey: "MY_APP_CONSOLE_WARNING_PROD_ONLY"
});
```

You can also pass multiple keys (first match wins):

```ts
showConsoleWarning({
  productionOnlyEnvKey: ["MY_KEY_1", "MY_KEY_2"]
});
```

Boolean values accepted: `1/0`, `true/false`, `yes/no`, `on/off`

Default keys (if you do not pass anything):

- `CONSOLE_SELF_XSS_WARNING_PRODUCTION_ONLY`
- `VITE_CONSOLE_SELF_XSS_WARNING_PRODUCTION_ONLY`
- `NEXT_PUBLIC_CONSOLE_SELF_XSS_WARNING_PRODUCTION_ONLY`

## API

```ts
type Options = {
  translations?: {
    [lang: string]: {
      title: string
      message: string
      titleStyle?: string
      messageStyle?: string
    }
  }
  forceLang?: string
  once?: boolean
  productionOnly?: boolean
  clearConsole?: boolean
  productionOnlyEnvKey?: string | string[]
}

showConsoleWarning(options?)
```

## Notes

- Runs only in the browser and is safe for SSR.
- Default language is auto-detected via `navigator.language` with `en` fallback.
- `\\n` in translations is converted to a real line break in console output.
- No external dependencies.
