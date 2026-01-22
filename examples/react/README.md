# React

## Basic usage

```tsx
import { useEffect } from "react";
import { showConsoleWarning } from "console-self-xss-warning";

export function ConsoleWarning() {
  useEffect(() => {
    showConsoleWarning();
  }, []);

  return null;
}
```

## Production-only + clear console

```tsx
import { useEffect } from "react";
import { showConsoleWarning } from "console-self-xss-warning";

export function ConsoleWarning() {
  useEffect(() => {
    showConsoleWarning({
      productionOnly: true,
      clearConsole: true
    });
  }, []);

  return null;
}
```

## React Router: re-log on route change

```tsx
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { showConsoleWarning } from "console-self-xss-warning";

export function ConsoleWarning() {
  const location = useLocation();

  useEffect(() => {
    showConsoleWarning({ once: false, clearConsole: false });
  }, [location.pathname]);

  return null;
}
```

## Custom translations

```tsx
import { useEffect } from "react";
import { showConsoleWarning } from "console-self-xss-warning";

export function ConsoleWarning() {
  useEffect(() => {
    showConsoleWarning({
      translations: {
        en: {
          title: "STOP!",
          message: "Developers only.\nPasting code here is unsafe."
        }
      }
    });
  }, []);

  return null;
}
```
