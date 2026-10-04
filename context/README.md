# Scentpocket Mobile: Context and progress tracker

**Single source of truth for where the project is.** Read it first, update it after every step. Rules are in [AGENTS.md](../AGENTS.md).

| | |
|---|---|
| Deadline | **Mon 5 Oct 2026, 11:59 PM WAT** |
| Current phase | **M1: auth + first build** (code done; waiting for the user to approve the generated images before the first EAS build) |
| Last updated | Sun 4 Oct 2026, by Claude Code |
| Backend | https://scentpocket.com.ng/api/v1 ([docs/API.md](../docs/API.md)) |
| Web repo | https://github.com/Emmanuel-Xs/scentpocket |
| EAS project | `d3279573-0003-4b9f-9f01-612a5cf04c11` (owner `n99plusones-team`), package `ng.com.scentpocket`, scheme `scentpocket` |

Status legend: [ ] not started · [x] done

## Phase M1: auth + first build (stop here and let the user test)
- [x] M1.1 Expo app (SDK 57, expo-router), EAS project linked, demo template removed
- [x] M1.2 Icons, adaptive icon, splash and header wordmark generated from the web logo (`scripts/make-assets.mjs`)
- [x] M1.3 `src/theme.ts` from the web tokens; Instrument Serif + Sans
- [x] M1.4 Supabase client (AsyncStorage, pkce), Google sign in via `WebBrowser.openAuthSessionAsync`, `/me` right after sign in
- [x] M1.5 API client: bearer token, refresh once on 401, Zod-validated responses
- [ ] M1.6 Development APK built and install link given to the user (needs approval of the images first)
- [ ] M1.7 User tested sign in on the phone

## Phase M2: screens
- [ ] M2.1 Tabs (Shop, Dupes, Cart with badge, Orders with profile card); signed out prompts on Cart and Orders
- [ ] M2.2 Shop: tier pills, search, 2-column grid, pull to refresh
- [ ] M2.3 Product: gallery, size radios (sold out struck), stepper capped at stock, add to cart (sign in required), dupe callout
- [ ] M2.4 Dupes: pair cards linking both products
- [ ] M2.5 Cart: server cart only, optimistic `setCartItem`, refetch on app focus, poll 3s while the Cart tab is focused, free delivery progress, subtotal
- [ ] M2.6 Checkout: contact (email from /me, +234 phone), zones, pay on delivery, Idempotency-Key, 409 handling (show `details.short`, refetch the cart)
- [ ] M2.7 Orders list and order detail with status timeline
- [ ] M2.8 Loading, empty, error-with-retry on every screen; pressed feedback everywhere

## Phase M3: release
- [ ] M3.1 Preview APK built, expo.dev install link
- [ ] M3.2 README (what it is, stack, how sync works, how to run, APK link)
- [ ] M3.3 GitHub repo `Emmanuel-Xs/scentpocket-mobile` created and pushed

## Parked / open
* Supabase redirect URLs allowed for mobile: `scentpocket://auth/callback`, `exp+scentpocket://**` (already pushed on the live project). If Google sign in returns to the wrong place, check what `Linking.createURL("auth/callback")` returns in the dev client.
* `expo-dev-client` is needed for the `development` profile (not on the original dependency list; asked the user).

## Progress log
Newest first.

- 2026-10-04 · M1.1 to M1.5 · Scaffolded with create-expo-app (SDK 57), linked EAS, removed the template demo. Deps via `expo install`: supabase-js, async-storage, react-query, zod, expo-crypto, Instrument fonts, sharp (dev). `expo lint` auto-installed eslint + eslint-config-expo (template lint prerequisites). Assets generated (icon 1024 opaque, adaptive foreground inside the 66% safe zone, splash logo 600x696 shown at 200 wide, transparent wordmark derived from the email logo). Test home screen shows catalog count, sign in, `/me`. tsc, lint and expo-doctor (21/21) pass.
