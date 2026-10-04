# Scentpocket Mobile

The Android app for **Scentpocket**, a demo Lagos fragrance shop ("a scent for every pocket"): four budget tiers, real perfumes and prices, dupes that link cheap scents to expensive ones, Google sign in, a cart shared with the website, checkout with delivery zones and pay on delivery, and order history.

It is a thin client over the live backend, the Scentpocket web app:

* **API:** `https://scentpocket.com.ng/api/v1` ([docs/API.md](./docs/API.md), copied from the web repo)
* **Web app and backend:** https://github.com/Emmanuel-Xs/scentpocket
* **Auth:** the same Supabase project as the website (Google sign in)

> Demo store for HNG15 Lesson 3. Nothing here is for sale.

## Install (Android)

**Preview APK:** _link added when the final build finishes_ (open it on your phone, allow "install unknown apps" for your browser if asked).

## Stack

Expo (React Native, SDK 57) with expo-router, TypeScript strict, plain `StyleSheet` (no UI kit). TanStack Query for server state, Zod for every API response, `@supabase/supabase-js` for auth only, `expo-image`, Instrument Serif and Instrument Sans. Built with EAS.

## How it works

* **The app never touches the database.** It calls the REST API with `Authorization: Bearer <Supabase access token>`. Prices, fees, totals and stock always come from the server; the app only shows them. Money is integer kobo and is formatted at the edge (`src/lib/money.ts`).
* **Sign in.** Google through Supabase with PKCE: `signInWithOAuth` (browser not auto-opened) -> `WebBrowser.openAuthSessionAsync` -> `exchangeCodeForSession`. The redirect is always `scentpocket://auth/callback`. The callback can reach the app three ways (browser session, a link event, the router), so all three share one code exchange. Right after sign in the app calls `GET /me`, which makes the server create the profile.
* **One cart for the app and the website.** The cart lives on the server (TanStack Query key `["cart"]`, no local copy). Edits are optimistic and debounced: the screen changes on the tap, rapid taps on one line collapse into a single `PUT /cart/items` (absolute quantity, 400ms after the last tap), saves run one at a time in order, and if one fails the cart is re-read from the server and you are told (`src/cart/editor.ts`). Add to cart and sign out are optimistic too. The app refetches when it returns to the foreground and polls every 3 seconds while the Cart tab is in front, so a change made on the website shows up here (and the website polls the same cart the other way). Quantities stop at `min(stock, 10)`, the same as the server, which also clamps and explains anything it changes.
* **Checkout.** `POST /orders` takes contact details and the delivery zone only; the items come from the server cart. Every attempt has an `Idempotency-Key` (expo-crypto `randomUUID()`), reused when a request is retried so an order is never placed twice. A `409` (stock ran out) lists the lines that fell short, refreshes the cart and keeps the form.
* **Orders.** List and detail with a status timeline (placed, confirmed, out for delivery, delivered, or cancelled).

## Run it

```sh
npm install
cp .env.example .env     # fill in the two Supabase values (public ones only)
npx expo start --dev-client
```

You need a development build on the phone (`eas build -p android --profile development`), because the app uses a custom URL scheme. Never put the Supabase secret or service-role key in this app: only `EXPO_PUBLIC_*` values.

| Variable | What |
|---|---|
| `EXPO_PUBLIC_API_URL` | `https://scentpocket.com.ng/api/v1` |
| `EXPO_PUBLIC_SUPABASE_URL` | the Supabase project URL |
| `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | the publishable (anon) key |

The two Supabase values are EAS environment variables for the `development` and `preview` profiles.

Checks: `npx tsc --noEmit` and `npx expo lint`. Icons, splash and the header wordmark are generated from the web logo with `node scripts/make-assets.mjs`.

Notes for the dev client: signing in with Google can restart the app on some phones, and a dev client then shows its server launcher and drops the sign in link. The preview build does not have that problem.

## Project layout

```
src/app/            expo-router routes (thin): tabs, product, checkout, orders, auth/callback
src/api/            fetch client (bearer token, one refresh on 401), Zod schemas
src/auth/           Supabase sign in, session state
src/catalog/        shop, product, dupes screens and queries
src/cart/           server cart screen, queries, optimistic updates
src/checkout/       checkout form, validation, idempotency, stock conflicts
src/orders/         orders list and detail
src/components/     buttons, cards, skeletons, states
src/theme.ts        tokens ported from the web design system
context/README.md   build plan and progress log
```
