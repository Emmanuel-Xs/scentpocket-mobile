# Scentpocket REST API (v1)

The web app is the backend for the mobile app. Everything below is served from the same deployment as the website.

* **Base URL:** `https://scentpocket.com.ng/api/v1`
* **Format:** JSON in, JSON out. Send `Content-Type: application/json` on requests with a body.
* **Money:** integer **kobo** everywhere (`₦1,500.00` is `150000`). Format on the device.
* **Dates:** ISO 8601 strings (`2026-10-04T09:12:00.000Z`), except `ProductCard.createdAt`, which is epoch milliseconds (it exists only for the "newest" sort).
* **Images:** an `Image` object (below). `src` is an absolute public URL to a WebP, up to 1600px on the long side. Render `blurDataUrl` (a tiny base64 WebP) while it loads, and use `width` and `height` to reserve space.
* **Never trust the client.** Prices, fees, totals, stock and roles are always computed on the server. You can only send *what you want*, never *what it costs*.

## Authentication

Sign the user in with Supabase Auth (Google) in the app, then send the access token:

```
Authorization: Bearer <supabase access token>
```

* The token is verified with Supabase on every request, so a revoked or expired token is a `401`.
* Refresh the session with supabase-js as usual; send the fresh `access_token`.
* The first authenticated request for a user creates their profile (role `customer`), so there is no separate "register" call.
* Public routes (catalog, product, dupes, delivery zones) need no token. Everything else does.

Supabase project URL and publishable key are the same ones the web app uses. Redirect URLs allowed for mobile sign in: `scentpocket://auth/callback` and `exp+scentpocket://**`.

## Errors

Every error has the same shape:

```json
{ "error": { "code": "validation_failed", "message": "Some fields are not valid.", "details": { } } }
```

`details` is optional. Branch on `code`, show `message` only if you have nothing better.

| Status | `code` | When |
|---|---|---|
| 400 | `invalid_json` | Body is not valid JSON |
| 401 | `unauthorized` | Missing, invalid or expired bearer token |
| 404 | `not_found` | Unknown route, product or order (also another user's order) |
| 404 | `variant_not_found` | Cart call names a variant that does not exist or is not for sale |
| 409 | `insufficient_stock` | `POST /orders` and a line is short. `details.short` is `[{ variantId, available }]`; the cart is untouched |
| 422 | `validation_failed` | Bad query or body. `details.issues` is `[{ path, message }]` (`path` is dotted, e.g. `delivery.phone`) |
| 422 | `empty_cart` | `POST /orders` with an empty server cart |
| 500 | `internal_error` | Something broke on our side. Safe to retry reads |

Anything under `/api/v1/` that is not a route below is a JSON `404 not_found` (never HTML).

---

## Types

```ts
type Tier = 'pocket' | 'arabian_gems' | 'designer' | 'niche'
type Gender = 'men' | 'women' | 'unisex'
type Occasion = 'office' | 'owambe' | 'date_night' | 'everyday'
type Family = 'fresh' | 'woody' | 'amber' | 'floral' | 'gourmand'
type Sort = 'featured' | 'price_asc' | 'price_desc' | 'newest'
type DeliveryZone = 'lagos_mainland' | 'lagos_island' | 'outside_lagos'
type OrderStatus = 'placed' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'

type Image = {
  src: string          // absolute URL
  width: number
  height: number
  blurDataUrl: string  // data:image/webp;base64,...
  alt: string
}

type ProductCard = {
  id: string
  slug: string
  name: string
  brand: string
  tier: Tier
  gender: Gender
  family: Family
  occasions: Occasion[]
  featuredRank: number | null   // lower sorts first
  createdAt: number             // epoch ms
  notes: string[]               // first three top notes
  allNotes: string[]            // top + heart + base
  fromKobo: number              // cheapest in-stock variant (cheapest overall if all sold out)
  multiSize: boolean            // show "from"
  soldOut: boolean
  lowStock: number | null       // 1 to 3 bottles left in total, else null
  image: Image | null
}

type Variant = { id: string; label: string; sizeMl: number; priceKobo: number; stock: number }

type ProductDetail = {
  card: ProductCard
  description: string
  topNotes: string[]
  heartNotes: string[]
  baseNotes: string[]
  longevity: 'short' | 'moderate' | 'long' | 'very_long'
  projection: 'soft' | 'moderate' | 'strong'
  variants: Variant[]           // active only, smallest first
  images: Image[]
  inspiredBy: ProductCard | null  // the pricier scent this one is a dupe of
  dupes: ProductCard[]            // cheaper scents inspired by this one
  related: ProductCard[]          // same tier, up to 4
}

type DupePair = { original: ProductCard; dupe: ProductCard; savingKobo: number; savingPercent: number }

type User = { id: string; email: string; name: string | null; avatarUrl: string | null; role: 'customer' | 'admin' | 'owner' }

type CartLine = {
  variantId: string
  quantity: number
  changed: boolean              // the server lowered this quantity while answering
  productSlug: string
  productName: string
  brand: string
  tier: Tier
  variantLabel: string
  sizeMl: number
  priceKobo: number             // current price
  stock: number                 // current stock
  image: Image | null
}

type Cart = {
  lines: CartLine[]
  itemCount: number             // sum of quantities
  subtotalKobo: number
  changed: boolean              // something was removed or lowered; see messages
  messages: string[]            // ready to show, e.g. "Yara 100ml is down to 2."
}

type OrderItem = {
  id: string
  productName: string
  variantLabel: string
  imageUrl: string | null
  image: Image | null
  unitPriceKobo: number         // price at the time of the order
  qty: number
  lineTotalKobo: number
}

type Order = {
  ref: string                   // e.g. "SP-94T8Y5"
  status: OrderStatus
  paymentMethod: 'pay_on_delivery' | 'paystack'
  customerName: string
  email: string
  phone: string                 // +234XXXXXXXXXX
  addressLine: string
  city: string
  state: string
  deliveryZone: DeliveryZone
  subtotalKobo: number
  deliveryFeeKobo: number
  totalKobo: number
  createdAt: string
  confirmedAt: string | null
  shippedAt: string | null
  deliveredAt: string | null
  cancelledAt: string | null
  emailProvider: 'mailgun' | 'smtp' | null
  emailSentAt: string | null
  emailError: string | null
  items: OrderItem[]
}

type OrderSummary = {
  ref: string
  status: OrderStatus
  totalKobo: number
  createdAt: string
  itemCount: number
  imageUrls: string[]           // up to 3
  images: Image[]               // the same photos, up to 3
}
```

---

## Catalog (public)

### `GET /catalog`

All active products as cards, filtered and sorted. Query parameters are all optional and validated strictly (a bad value is a `422`, it is not ignored).

| Param | Values |
|---|---|
| `tier` | `pocket`, `arabian_gems`, `designer`, `niche` |
| `gender` | `men`, `women`, `unisex` |
| `occasion` | `office`, `owambe`, `date_night`, `everyday` |
| `family` | `fresh`, `woody`, `amber`, `floral`, `gourmand` |
| `sort` | `featured` (default), `price_asc`, `price_desc`, `newest` |
| `q` | text, max 80 chars; matches brand, name and any note |

```
GET /api/v1/catalog?tier=pocket&sort=price_asc
→ 200 { "products": ProductCard[], "total": number }
```

### `GET /products/:slug`

```
GET /api/v1/products/mfk-baccarat-rouge-540
→ 200 { "product": ProductDetail }
→ 404 not_found
```

### `GET /dupes`

Every dupe pair, biggest saving first.

```
→ 200 { "dupes": DupePair[] }
```

### `GET /delivery-zones`

Static store rules, so the app never hard codes fees.

```
→ 200 {
  "zones": [{ "id": DeliveryZone, "label": string, "feeKobo": number, "eta": string }],
  "freeDeliveryThresholdKobo": number,   // subtotal at or above this ships free
  "maxQuantityPerLine": number,
  "states": string[]                     // valid values for delivery.state
}
```

---

## Account

### `GET /me`  (auth)

```
→ 200 { "user": User }
→ 401 unauthorized
```

---

## Cart (auth)

The cart lives on the server and is shared with the website. Only variant ids and quantities are stored; prices and stock are read live on every call. **Every cart call returns the whole cart** so you can replace local state with the response.

The server always clamps: a quantity above `min(stock, 10)` is lowered (not rejected), sold out and removed variants are dropped, and the response says what happened (`changed`, `messages`, and `lines[].changed`).

The web app re-reads the cart on window focus and every 3 seconds while its cart drawer or checkout is open, so changes made here appear there. Do the same in the app (refetch on focus, poll lightly while the cart screen is open).

### `GET /cart`

```
→ 200 { "cart": Cart }
```

### `PUT /cart/items`

Set one line to an absolute quantity. `0` removes it. Setting the same value twice is harmless, so it is safe to retry.

```
PUT /api/v1/cart/items
{ "variantId": "uuid", "quantity": 2 }        // quantity: integer 0 to 10
→ 200 { "cart": Cart }
→ 404 variant_not_found
→ 422 validation_failed
```

### `DELETE /cart`

```
→ 200 { "cart": Cart }    // lines: []
```

### `POST /cart/merge`

Fold a local (signed out) cart into the server cart, once, right after sign in. The same variant **adds** quantities, capped at stock (and 10). Unknown and sold out variants are skipped and reported in `messages`. **Not idempotent**: calling it twice with the same items adds them twice, so call it once, then clear your local cart.

```
POST /api/v1/cart/merge
{ "items": [{ "variantId": "uuid", "quantity": 2 }] }   // up to 50 items, quantity 1 to 10
→ 200 { "cart": Cart }
```

---

## Orders (auth)

### `POST /orders`

Place an order **from the server cart**. The body carries contact details and the delivery zone only; **items are never read from the body**. Payment is pay on delivery.

```
POST /api/v1/orders
Idempotency-Key: 6f1c...           // optional header, see below
{
  "delivery": {
    "fullName": "Ada Obi",
    "phone": "0803 123 4567",      // any common Nigerian format; stored as +2348031234567
    "addressLine": "12 Allen Avenue",
    "city": "Ikeja",
    "state": "Lagos",              // one of /delivery-zones states
    "deliveryZone": "lagos_mainland"  // Lagos states must use a Lagos zone; others "outside_lagos"
  },
  "idempotencyKey": "6f1c..."      // optional alternative to the header, 8 to 100 chars
}
→ 201 { "order": Order }
→ 200 { "order": Order }          // a retry with a key that was already used: the first order
→ 409 insufficient_stock          // details.short: [{ variantId, available }]; nothing was charged or changed
→ 422 empty_cart | validation_failed
```

How it behaves:

* Totals, fees and prices come from the database; the delivery fee is free at a subtotal of ₦300,000 or more.
* The stock decrement, the order and the cart clearing happen in **one transaction**. On `201` the server cart is empty; on `409` or any error it is untouched.
* The cart is read as stored, with no silent clamping: if stock dropped since the customer added the item, they get a `409` and can fix the cart, rather than receiving a smaller order than they saw.
* **Send an `Idempotency-Key`** (a fresh UUID per checkout attempt, reused only for retries of that same attempt). If the response is lost on a bad network, retrying with the same key returns the original order with `200` instead of creating a second one, even though the cart is already empty.
* A confirmation email is sent after the order is saved. Email can never fail an order.

### `GET /orders`

The signed in user's orders, newest first.

```
→ 200 { "orders": OrderSummary[] }
```

### `GET /orders/:ref`

```
GET /api/v1/orders/SP-94T8Y5
→ 200 { "order": Order }
→ 404 not_found     // unknown ref, malformed ref, or somebody else's order
```

---

## Quick check

```sh
curl https://scentpocket.com.ng/api/v1/catalog?tier=pocket
curl https://scentpocket.com.ng/api/v1/me                          # 401
curl https://scentpocket.com.ng/api/v1/cart -H "Authorization: Bearer $TOKEN"
```

## Notes for the mobile app

* One cart per user, shared with the web: after sign in, `POST /cart/merge` the local lines once, then treat `GET /cart` as the source of truth and update optimistically with `PUT /cart/items`.
* Do not cache prices or stock beyond the screen showing them; the cart and `GET /products/:slug` always have the current numbers.
* The API has no pagination: the catalog is small (about 16 products).
* Responses are `Cache-Control: no-store`.
