import type { Cart } from '@/api/schemas'

/**
 * What the cart will look like once `variantId` is set to `quantity` (0 removes it). Only a guess
 * for instant feedback: the server's answer replaces it. A line we have no data for (a brand new
 * variant) can only move the item count, since we do not know its price.
 */
export function withQuantity(cart: Cart, variantId: string, quantity: number): Cart {
  const existing = cart.lines.find((l) => l.variantId === variantId)
  if (!existing) {
    return { ...cart, itemCount: cart.itemCount + quantity }
  }
  const lines =
    quantity <= 0
      ? cart.lines.filter((l) => l.variantId !== variantId)
      : cart.lines.map((l) => (l.variantId === variantId ? { ...l, quantity, changed: false } : l))
  return {
    ...cart,
    lines,
    itemCount: lines.reduce((sum, l) => sum + l.quantity, 0),
    subtotalKobo: lines.reduce((sum, l) => sum + l.priceKobo * l.quantity, 0),
  }
}
