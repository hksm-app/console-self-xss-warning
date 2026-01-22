# Angular

## Basic usage (browser only)

```ts
import { Component, Inject, OnInit, PLATFORM_ID } from "@angular/core";
import { isPlatformBrowser } from "@angular/common";
import { showConsoleWarning } from "console-self-xss-warning";

@Component({
  selector: "app-root",
  template: "<router-outlet />"
})
export class AppComponent implements OnInit {
  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      showConsoleWarning({ productionOnly: true });
    }
  }
}
```

## Re-log on route changes

```ts
import { Component, Inject, OnDestroy, OnInit, PLATFORM_ID } from "@angular/core";
import { isPlatformBrowser } from "@angular/common";
import { NavigationEnd, Router } from "@angular/router";
import { filter, Subscription } from "rxjs";
import { showConsoleWarning } from "console-self-xss-warning";

@Component({
  selector: "app-root",
  template: "<router-outlet />"
})
export class AppComponent implements OnInit, OnDestroy {
  private subscription?: Subscription;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.subscription = this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        showConsoleWarning({ once: false, clearConsole: false, productionOnly: true });
      });

    showConsoleWarning({ productionOnly: true });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }
}
```
