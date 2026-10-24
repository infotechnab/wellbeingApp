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
| `npm run seed:generate` | Regenerate `supabase/seed.sql` from `src/content` |
| `npm run iphone` | Build and install a free test copy on an iPhone plugged into your Mac ([docs/iphone-test-build.md](docs/iphone-test-build.md)) |

## Backend

Accounts, sync and editable content use the Supabase project set in `.env` (its URL and publishable
key are public by design). Without those two `EXPO_PUBLIC_SUPABASE_*` values the app runs fully
offline. To use another project, set it up as described in [docs/backend.md](docs/backend.md) and
put its values in `.env.local`, which overrides `.env`.

## Releasing

**Web.** Every push to `main` publishes the web app to GitHub Pages at
https://infotechnab.github.io/wellbeingApp/ (`.github/workflows/website.yml`). It needs
**Settings → Pages → Source: GitHub Actions** turned on once. To host it elsewhere,
`npm run export:web` writes a static single-page app to `dist/`: serve it with all paths falling
back to `index.html`, and set `WEB_BASE_URL` (for example `/app`) when it isn't at the root of its
domain.

**iOS and Android.** Builds run in the cloud with [EAS](https://docs.expo.dev/build/introduction/):

```bash
npx eas-cli@latest login
npx eas-cli@latest build --profile preview --platform android   # installable APK for testers
npx eas-cli@latest build --profile production --platform all    # store builds
npx eas-cli@latest submit --platform ios                        # upload to App Store Connect
```

Store submission needs an Apple Developer account and a Google Play Console account. Bundle ids
are `com.infotechnab.wellbeing`; change them in `app.json` before the first store build if you
want a different one.

**Your own iPhone, without a paid Apple account.** A Mac with Xcode can install a test copy that
lasts 7 days at a time; see [docs/iphone-test-build.md](docs/iphone-test-build.md).

## Project layout

```
src/
  app/          Expo Router screens (every file is a route)
    (tabs)/     Home (emotion wheel), Journal and Profile tabs
  backend/      Supabase client, auth, sync and remote content
  components/   Shared UI (ui/ holds the design-system primitives)
  content/      Emotions, activities and affirmations (offline copy)
  session/      Activity session logic, persistence and history
  sketch/       Sketch model and storage
  theme/        Colours (light and dark), spacing, type sizes
supabase/       Database migrations and generated seed data
```

Always add native packages with `npx expo install <package>` so versions match the Expo SDK.
