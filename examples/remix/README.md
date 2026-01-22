# Remix

## root.tsx (client-only)

```tsx
import { useEffect } from "react";
import { Outlet, useLocation } from "@remix-run/react";
import { showConsoleWarning } from "console-self-xss-warning";

export default function App() {
  const location = useLocation();

  useEffect(() => {
    showConsoleWarning({ productionOnly: true });
  }, []);

  useEffect(() => {
    showConsoleWarning({ once: false, clearConsole: false, productionOnly: true });
  }, [location.pathname]);

  return <Outlet />;
}
```
