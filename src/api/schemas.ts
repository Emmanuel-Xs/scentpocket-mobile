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
