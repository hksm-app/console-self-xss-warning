# Vue 3

## Basic usage

```vue
<script setup lang="ts">
import { onMounted } from "vue";
import { showConsoleWarning } from "console-self-xss-warning";

onMounted(() => {
  showConsoleWarning();
});
</script>

<template>
  <slot />
</template>
```

## Production-only + clear console

```vue
<script setup lang="ts">
import { onMounted } from "vue";
import { showConsoleWarning } from "console-self-xss-warning";

onMounted(() => {
  showConsoleWarning({ productionOnly: true, clearConsole: true });
});
</script>

<template>
  <slot />
</template>
```

## Vue Router: re-log on route change

```vue
<script setup lang="ts">
import { watch } from "vue";
import { useRoute } from "vue-router";
import { showConsoleWarning } from "console-self-xss-warning";

const route = useRoute();

watch(
  () => route.fullPath,
  () => {
    showConsoleWarning({ once: false, clearConsole: false });
  },
  { immediate: true }
);
</script>

<template>
  <slot />
</template>
```
