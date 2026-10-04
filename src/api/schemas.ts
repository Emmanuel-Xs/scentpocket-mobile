import { z } from 'zod'

// Shapes copied from docs/API.md. Every API response is parsed with these: if the server drifts,
// we fail loudly here instead of rendering undefined.

export const tierSchema = z.enum(['pocket', 'arabian_gems', 'designer', 'niche'])

export const imageSchema = z.object({
  src: z.url(),
  width: z.number(),
  height: z.number(),
  blurDataUrl: z.string(),
  alt: z.string(),
})

export const userSchema = z.object({
  id: z.string(),
  email: z.string(),
  name: z.string().nullable(),
  avatarUrl: z.string().nullable(),
  role: z.enum(['customer', 'admin', 'owner']),
})
export const meResponseSchema = z.object({ user: userSchema })

export const productCardSchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  brand: z.string(),
  tier: tierSchema,
  gender: z.enum(['men', 'women', 'unisex']),
  family: z.enum(['fresh', 'woody', 'amber', 'floral', 'gourmand']),
  occasions: z.array(z.enum(['office', 'owambe', 'date_night', 'everyday'])),
  featuredRank: z.number().nullable(),
  createdAt: z.number(),
  notes: z.array(z.string()),
  allNotes: z.array(z.string()),
  fromKobo: z.number().int(),
  multiSize: z.boolean(),
  soldOut: z.boolean(),
  lowStock: z.number().nullable(),
  image: imageSchema.nullable(),
})
export const catalogResponseSchema = z.object({
  products: z.array(productCardSchema),
  total: z.number(),
})

/** `{ error: { code, message, details? } }` */
export const errorEnvelopeSchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.unknown().optional(),
  }),
})

export type Tier = z.infer<typeof tierSchema>
export type Image = z.infer<typeof imageSchema>
export type User = z.infer<typeof userSchema>
export type ProductCard = z.infer<typeof productCardSchema>

// ---- Product detail and dupes ----

export const variantSchema = z.object({
  id: z.string(),
  label: z.string(),
  sizeMl: z.number(),
  priceKobo: z.number().int(),
  stock: z.number().int(),
})

export const productDetailSchema = z.object({
  card: productCardSchema,
  description: z.string(),
  topNotes: z.array(z.string()),
  heartNotes: z.array(z.string()),
  baseNotes: z.array(z.string()),
  longevity: z.enum(['short', 'moderate', 'long', 'very_long']),
  projection: z.enum(['soft', 'moderate', 'strong']),
  variants: z.array(variantSchema),
  images: z.array(imageSchema),
  inspiredBy: productCardSchema.nullable(),
  dupes: z.array(productCardSchema),
  related: z.array(productCardSchema),
})
export const productResponseSchema = z.object({ product: productDetailSchema })

export const dupePairSchema = z.object({
  original: productCardSchema,
  dupe: productCardSchema,
  savingKobo: z.number().int(),
  savingPercent: z.number(),
})
export const dupesResponseSchema = z.object({ dupes: z.array(dupePairSchema) })

// ---- Cart ----

export const cartLineSchema = z.object({
  variantId: z.string(),
  quantity: z.number().int(),
  /** The server lowered this quantity while answering. */
  changed: z.boolean(),
  productSlug: z.string(),
  productName: z.string(),
  brand: z.string(),
  tier: tierSchema,
  variantLabel: z.string(),
  sizeMl: z.number(),
  priceKobo: z.number().int(),
  stock: z.number().int(),
  image: imageSchema.nullable(),
})

export const cartSchema = z.object({
  lines: z.array(cartLineSchema),
  itemCount: z.number().int(),
  subtotalKobo: z.number().int(),
  changed: z.boolean(),
  messages: z.array(z.string()),
})
export const cartResponseSchema = z.object({ cart: cartSchema })

export type Variant = z.infer<typeof variantSchema>
export type ProductDetail = z.infer<typeof productDetailSchema>
export type DupePair = z.infer<typeof dupePairSchema>
export type CartLine = z.infer<typeof cartLineSchema>
export type Cart = z.infer<typeof cartSchema>

// ---- Delivery zones (static store rules) ----

export const deliveryZoneIdSchema = z.enum(['lagos_mainland', 'lagos_island', 'outside_lagos'])

export const deliveryZonesResponseSchema = z.object({
  zones: z.array(
    z.object({
      id: deliveryZoneIdSchema,
      label: z.string(),
      feeKobo: z.number().int(),
      eta: z.string(),
    }),
  ),
  freeDeliveryThresholdKobo: z.number().int(),
  maxQuantityPerLine: z.number().int(),
  states: z.array(z.string()),
})

export type DeliveryZoneId = z.infer<typeof deliveryZoneIdSchema>
export type DeliveryZones = z.infer<typeof deliveryZonesResponseSchema>
