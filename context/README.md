# Scentpocket Mobile: Context and progress tracker

**Single source of truth for where the project is.** Read it first, update it after every step. Rules are in [AGENTS.md](../AGENTS.md).

| | |
|---|---|
| Deadline | **Mon 5 Oct 2026, 11:59 PM WAT** |
| Current phase | **M2 in progress** (sign in works on the phone; Shop, Product, Dupes, Cart, Checkout and Order detail built; next: Orders list M2.7, then the polish pass M2.8) |
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
- [x] M1.6 Development APK: build queued 4 Oct (https://expo.dev/accounts/n99plusones-team/projects/scentpocket-mobile/builds/abdc2875-a9e7-49fa-9097-4cf64e3f340a), install link when it finishes
- [x] M1.7 User tested sign in on the phone (works)

## Phase M2: screens
- [~] M2.1 Tabs (Shop, Dupes, Cart with badge, Orders with profile card); signed out prompts on Cart and Orders. Done except the Orders body (placeholder until M2.7)
- [x] M2.2 Shop: tier pills, search, 2-column grid, pull to refresh
- [x] M2.3 Product: gallery, size radios (sold out struck), stepper capped at stock, add to cart (sign in required), dupe callout
- [x] M2.4 Dupes: pair cards linking both products
- [x] M2.5 Cart: server cart only, optimistic `setCartItem`, refetch on app focus, poll 3s while the Cart tab is focused, free delivery progress, subtotal
- [x] M2.6 Checkout: contact (email from /me, +234 phone), zones, pay on delivery, Idempotency-Key, 409 handling (show `details.short`, refetch the cart)
- [x] M2.7 Orders list and order detail with status timeline (list rendered and checked with mocked responses; real orders only exercised through checkout)
- [x] M2.8 Loading, empty, error-with-retry on every screen; pressed feedback everywhere (audited every Pressable; skeletons mirror the real layouts). Not yet checked on a phone

## Phase M3: release
- [ ] M3.1 Preview APK built, expo.dev install link
- [~] M3.2 README written; the APK link is added when the final preview build finishes
- [ ] M3.3 GitHub repo `Emmanuel-Xs/scentpocket-mobile` created and pushed

## Parked / open
* Supabase redirect URLs allowed for mobile: `scentpocket://auth/callback`, `exp+scentpocket://**` (already pushed on the live project). If Google sign in returns to the wrong place, check what `Linking.createURL("auth/callback")` returns in the dev client.
* `expo-dev-client` added (approved) for the `development` profile. `eslint` + `eslint-config-expo` kept (approved).
* Photos have white backgrounds; the web hides them with mix-blend-multiply, which React Native lacks, so image frames are white and the tier colour shows as the chip.
* Icons are inline SVGs drawn with expo-image (`src/components/Icon.tsx`), so no icon library is needed.

## Progress log
Newest first.

- 2026-10-04 · code review · Read through the app for bugs. Fixed: (1) no request timeout, a stalled connection could leave a spinner forever (now 25s, then a network error; retrying an order is safe because of the Idempotency-Key); (2) Add to cart added to the CACHED cart, so it could overwrite a change made on the website (now fetches the current cart first); (3) the search box had no length cap while the API rejects `q` over 80 characters (maxLength 80). Clean: no secrets in tracked files, no `any` or ts-ignore, all files under 250 lines. Not changed, for the owner to decide: unused template packages are still installed (expo-symbols, @expo/ui, expo-glass-effect, expo-device, expo-constants, expo-system-ui, react-native-gesture-handler, react-native-reanimated, react-native-worklets, react-native-web, react-dom); the Supabase session sits in plain AsyncStorage (no expo-secure-store in the allowed list); the keyboard with the sticky Place order bar is unverified on edge-to-edge Android.

- 2026-10-04 · M2.7 + M2.8 + README · Orders tab: profile card plus the orders list (first photo, ref, date, item count, total, status badge; skeleton, empty, error with retry, pull to refresh, refetch when the tab comes to the front). Pressed feedback added to the last four pressables (cart notice, added toast, state picker close, sign in sheet). Rendered the orders list and the cancelled and delivered timelines in a browser with mocked API responses (no production orders created). README.md written. Remaining: confirm sign in on the preview APK, final preview build, GitHub repo.

- 2026-10-04 · sign in failed on the phone (screen recording) · Two dev client problems: (1) after choosing the Google account Android killed the app, and the dev client then showed its "Development servers" launcher, which loses the callback link; (2) on another try the browser ended on scentpocket.com.ng, because `Linking.createURL()` in a dev client does not return the plain `scentpocket://auth/callback` that is in the Supabase allow-list, so Supabase used the web Site URL. Fix: fixed redirect `Linking.createURL('auth/callback', { scheme: 'scentpocket' })`; a `Linking` url listener + `getInitialURL` finishes sign in even when the router does not mount the callback route (all paths share one exchange per code); the browser session ending early now says "Sign in did not finish"; dev builds show a short sign in trail under the Google button (never the code or tokens). Test sign in with the preview APK (no dev launcher, bundled JS), not the dev client.

- 2026-10-04 · M2.6 + order detail · Checkout: contact (email read-only from /me, name prefilled, +234 phone), address, searchable state picker, zone radio cards (fee, ETA, free over the threshold, zones that do not fit the state are greyed out; non Lagos states force Outside Lagos), pay on delivery, summary with a fee preview, sticky total + Place order with a spinner. Same validation rules as the server, inline errors, scrolls to the first bad section; server 422 issues map back onto fields. `Idempotency-Key` from expo-crypto `randomUUID()` when checkout opens, reused for retries of the same attempt (network error), renewed after a 409 (the cart changed) and after success. 409 `insufficient_stock`: reads the cart as the customer saw it, lists each short line ("Only 1 of Choco Musk Roll On Oil 6ml left (you had 2)"), refreshes the cart, keeps the form. Success goes to `/orders/[ref]?placed=1` (thank you, status timeline, items, delivery, totals). Verified in a browser (react-native-web at 390px through a local CORS proxy) against the live API with a throwaway user: validation, state search, zone rules, a real 409 (stock dropped behind the customer), a real order and the thank-you screen. Cleaned up afterwards (order deleted, stock back to 15, user and profile deleted). Phone not yet tried.

- 2026-10-04 · fixes from the first device test · (1) "Unmatched Route" after Google: Android also delivers `scentpocket://auth/callback?code=...` to the router, so there is now a `src/app/auth/callback.tsx` route, and `src/auth/complete.ts` shares one code exchange per code between that route and `signIn` (a code works once). (2) Tab icons missing: inline SVG through expo-image does not render on Android; icons are now PNGs generated by `scripts/make-assets.mjs` (`assets/icons`) shown with a core `<Image tintColor>`. (3) Skeletons did not match the content: Shop, Dupes and Cart skeletons now reuse the real frames, gaps and line heights (`ProductCardSkeleton`, `SkeletonLine`); product cards always reserve two name lines. (4) `Link asChild` dropped the Pressable's style function (cards lost `flex: 1`, columns came out uneven), so cards now use `Pressable` + `router.push` (`src/lib/nav.ts`). (5) Blur placeholder is stretched over the photo frame (`placeholderContentFit="cover"`) so photos never show as tiny dots while loading. Checked by rendering the app with react-native-web at 390px with the API held back (skeleton vs loaded). Note: `CI=1 expo start` disables Metro file watching, restart it to see edits.

- 2026-10-04 · M2.5 · Cart tab: server cart only (`["cart"]`), signed out prompt, skeleton, empty state, error with retry, pull to refresh, lines with stepper (stops at min(stock,10)) and Remove (quantity 0), optimistic serial saves with rollback and an error line, server `messages` shown in a dismissible notice, free delivery progress (threshold from GET /delivery-zones), subtotal, Checkout. Polls every 3s while the tab is focused and no save is running; refetches when the app returns to the foreground (AppState focusManager). `/checkout` is a placeholder until M2.6. User added EXPO_TOKEN to .zshrc (verified it authenticates). Typecheck and lint pass, bundle compiles; not yet tried on a device.

- 2026-10-04 · M2.2 to M2.4 (+ cart data layer) · Shop (tier pills, debounced search, sort chips, 2 column grid padded for odd counts, skeleton, empty with Clear filters, error with retry, pull to refresh), Product (gallery with dots, size radios with sold out struck through, stepper capped at min(stock,10), sticky buy bar, sign in sheet when signed out, dupe callouts, notes, meters, chips, related row, 404 state), Dupes (pair cards linking both sides). `src/cart/queries.ts`: server cart query `["cart"]`, optimistic `PUT /cart/items` in a serial mutation scope, add-to-cart adds to what is already there. Zod schemas for product, dupes and cart checked against the live API (catalog, product, dupes, me, cart PUT and GET all parse). Dev build started with expo-dev-client and the two Supabase vars set as EAS env vars (development + preview). Adaptive icon bottle scaled up 10% (594px tall, inside the 676px safe zone).

- 2026-10-04 · M1.1 to M1.5 · Scaffolded with create-expo-app (SDK 57), linked EAS, removed the template demo. Deps via `expo install`: supabase-js, async-storage, react-query, zod, expo-crypto, Instrument fonts, sharp (dev). `expo lint` auto-installed eslint + eslint-config-expo (template lint prerequisites). Assets generated (icon 1024 opaque, adaptive foreground inside the 66% safe zone, splash logo 600x696 shown at 200 wide, transparent wordmark derived from the email logo). Test home screen shows catalog count, sign in, `/me`. tsc, lint and expo-doctor (21/21) pass.
