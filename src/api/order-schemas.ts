import { z } from 'zod'
import { deliveryZoneIdSchema, imageSchema } from './schemas'

// Shapes copied from docs/API.md (Orders).

export const orderStatusSchema = z.enum(['placed', 'confirmed', 'shipped', 'delivered', 'cancelled'])

export const orderItemSchema = z.object({
  id: z.string(),
  productName: z.string(),
  variantLabel: z.string(),
  imageUrl: z.string().nullable(),
  image: imageSchema.nullable(),
  /** Price at the time of the order. */
  unitPriceKobo: z.number().int(),
  qty: z.number().int(),
  lineTotalKobo: z.number().int(),
})

const date = z.string().nullable()

export const orderSchema = z.object({
  ref: z.string(),
  status: orderStatusSchema,
  paymentMethod: z.enum(['pay_on_delivery', 'paystack']),
  customerName: z.string(),
  email: z.string(),
  phone: z.string(),
  addressLine: z.string(),
  city: z.string(),
  state: z.string(),
  deliveryZone: deliveryZoneIdSchema,
  subtotalKobo: z.number().int(),
  deliveryFeeKobo: z.number().int(),
  totalKobo: z.number().int(),
  createdAt: z.string(),
  confirmedAt: date,
  shippedAt: date,
  deliveredAt: date,
  cancelledAt: date,
  emailProvider: z.enum(['mailgun', 'smtp']).nullable(),
  emailSentAt: date,
  emailError: z.string().nullable(),
  items: z.array(orderItemSchema),
})
export const orderResponseSchema = z.object({ order: orderSchema })

/** 409 insufficient_stock: `details.short` lists the lines that fell short. */
export const stockConflictDetailsSchema = z.object({
  short: z.array(z.object({ variantId: z.string(), available: z.number().int() })),
})

export type OrderStatus = z.infer<typeof orderStatusSchema>
export type Order = z.infer<typeof orderSchema>
export type OrderItem = z.infer<typeof orderItemSchema>

export const orderSummarySchema = z.object({
  ref: z.string(),
  status: orderStatusSchema,
  totalKobo: z.number().int(),
  createdAt: z.string(),
  itemCount: z.number().int(),
  imageUrls: z.array(z.string()),
  images: z.array(imageSchema),
})
export const ordersResponseSchema = z.object({ orders: z.array(orderSummarySchema) })

export type OrderSummary = z.infer<typeof orderSummarySchema>
