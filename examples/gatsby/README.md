# Gatsby

## gatsby-browser.js

```js
import { showConsoleWarning } from "console-self-xss-warning";

export const onClientEntry = () => {
  showConsoleWarning({ productionOnly: true });
};

export const onRouteUpdate = () => {
  showConsoleWarning({ once: false, clearConsole: false, productionOnly: true });
};
```

## Custom translations

```js
import { showConsoleWarning } from "console-self-xss-warning";

export const onClientEntry = () => {
  showConsoleWarning({
    translations: {
      en: {
        title: "STOP!",
        message: "Developers only.\nDo not paste code here."
      }
    }
  });
};
```
