# AGENTS.md

Rules for any AI agent (Claude Code, Codex, Cursor, etc.) working in this repo.

## Start of every session

1. Read [`context/README.md`](./context/README.md): current phase, next unchecked step.
2. Read [`docs/API.md`](./docs/API.md) for anything that talks to the backend. It is a copy of `scentpocket/docs/API.md` in the web repo (https://github.com/Emmanuel-Xs/scentpocket). **Match its shapes exactly; never guess fields.** If the backend changed, re-copy it.
3. Work on one step at a time, in order, unless the human says otherwise.

## End of every step

1. Tick the step in `context/README.md`, add a progress log line, update "Current phase".
2. Run `npx tsc --noEmit && npx expo lint` before calling a step done.
3. Commit with the step ID: `feat(cart): M2.4 optimistic setCartItem`.

## Project in one paragraph

Scentpocket Mobile is the Android app for Scentpocket, a demo Lagos fragrance shop ("a scent for every pocket", four budget tiers, dupes, pay on delivery). It is a thin client over the live backend at `https://scentpocket.com.ng/api/v1` (the web app) and uses the same Supabase project for Google sign in. Expo (React Native), TypeScript strict, expo-router. HNG15 Lesson 3, deadline Mon 5 Oct 2026, 11:59 PM WAT.

## Stack (do not add to it without asking)

expo, expo-router, react-native (plain `StyleSheet`, no NativeWind, no UI kit), @supabase/supabase-js, @react-native-async-storage/async-storage, expo-web-browser, expo-linking, expo-crypto, expo-image, expo-font, @expo-google-fonts/instrument-serif, @expo-google-fonts/instrument-sans, @tanstack/react-query, zod, sharp (dev only, for `scripts/make-assets.mjs`).
Always install with `npx expo install <pkg>` so versions match the SDK.

## Hard rules

* **Money is integer kobo** everywhere. Format only at the edge (`src/lib/money.ts`).
* **Never trust the client** for prices, fees, totals, stock. Show what the server returned; the server recomputes everything.
* **Zod-parse every API response** (`src/api/client.ts` does it; give every call a schema from `src/api/schemas.ts`).
* **The app never queries Supabase tables.** supabase-js is for auth only. All data goes through `/api/v1`.
* **Never put the Supabase secret or service role key in this repo.** Only `EXPO_PUBLIC_*` public values.
* The cart is the **server cart only** (TanStack Query key `["cart"]`). No local cart copy.
* Quantity cap is `min(stock, 10)` per line, same as the server. Steppers stop there.
* `POST /orders` always sends an `Idempotency-Key` (see `docs/API.md`).
* Every screen ships with loading, empty and error-with-retry states. Every pressable gives pressed feedback and a 48dp minimum touch target.
* No `any`, no `@ts-ignore` without a comment explaining why.

## Code style

* Routes in `src/app/` stay thin; features live outside it (`src/api`, `src/auth`, `src/cart`, `src/components`, ...).
* Keep files under ~250 lines; split when they grow.
* UI copy: warm and short; **no em dashes**.
* Design tokens live in `src/theme.ts` (ported from the web repo's `docs/design/tokens.css`). Do not invent colours, radii or shadows.
* Expo changes every SDK release. Before touching an Expo or EAS API, check the versioned docs (https://docs.expo.dev/llms.txt) instead of trusting memory.

## EAS

Profiles: `development` (dev client APK) and `preview` (APK, internal). **Never create a production profile and never run `eas submit`.** Env vars are `EXPO_PUBLIC_API_URL`, `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (EAS environment variables for the two Supabase ones).

## Commands

| Command | Use |
|---|---|
| `npx expo start --dev-client` | dev server for the development build |
| `npx tsc --noEmit` / `npx expo lint` | before every commit |
| `node scripts/make-assets.mjs` | regenerate icons, splash, wordmark from `assets/source` |
| `npx eas-cli@latest build -p android --profile development` | dev client APK |
| `npx eas-cli@latest build -p android --profile preview` | preview APK |
