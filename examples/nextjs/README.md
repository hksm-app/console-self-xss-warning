# Next.js

## App Router: client component

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

## App Router: re-log on route changes

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

## Pages Router: _app.tsx

```tsx
import { useEffect } from "react";
import type { AppProps } from "next/app";
import { showConsoleWarning } from "console-self-xss-warning";

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    showConsoleWarning({ productionOnly: true });
  }, []);

  return <Component {...pageProps} />;
}
```
