# Contributing

Thanks for your interest in contributing! This project is small and aims to stay
lightweight, so contributions are focused and pragmatic.

## Quick start

1. Fork and clone the repository.
2. Install dependencies:

```
npm install
```

3. Build the package:

```
npm run build
```

## Development notes

- Source lives in `src/`. Build output goes to `dist/`.
- Keep the public API backward-compatible when possible.
- Avoid adding new runtime dependencies unless absolutely necessary.
- Keep translations clear and concise; use `\n` for line breaks.

## Submitting changes

1. Create a focused branch for your change.
2. Update or add documentation in `README.md` if behavior changes.
3. Run `npm run build` to ensure TypeScript builds cleanly.
4. Open a pull request with a clear description and motivation.

## Reporting issues

If you find a bug or have a feature request, please open an issue and include:

- Steps to reproduce (or a minimal example)
- Expected vs. actual behavior
- Browser and environment details (framework, bundler, version)
