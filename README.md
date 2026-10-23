# Wellbeing App

A calm, minimal wellbeing app for iPhone, Android and web. Users check in with how they feel on an
emotional wheel, then work through a few short body-based exercises matched to that emotion. No
account is needed; signing up is optional.

Built with [Expo](https://expo.dev) (React Native + TypeScript) and Expo Router.

## Getting started

```bash
npm install
npm start          # then press i (iOS), a (Android) or w (web)
```

## Scripts

| Command | What it does |
| --- | --- |
| `npm start` | Start the Expo dev server |
| `npm run web` | Run in the browser |
| `npm run lint` | ESLint (Expo config) |
| `npm run typecheck` | TypeScript, no emit |
| `npm test` | Jest unit and component tests |
| `npm run export:web` | Build the static web app into `dist/` |

## Project layout

```
src/
  app/          Expo Router screens (every file is a route)
    (tabs)/     Home, Journal and Profile tabs
  components/   Shared UI (ui/ holds the design-system primitives)
  theme/        Colours (light and dark), spacing, type sizes
```

Always add native packages with `npx expo install <package>` so versions match the Expo SDK.
