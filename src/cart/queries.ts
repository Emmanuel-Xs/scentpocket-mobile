import { queryOptions, useQuery } from '@tanstack/react-query'
import { api } from '@/api/client'
import { cartResponseSchema } from '@/api/schemas'
import type { Cart } from '@/api/schemas'
import { useAuth } from '@/auth/AuthProvider'
import { queryClient } from '@/lib/query'
import { maxQty } from '@/lib/qty'
import { setCartQuantity } from './editor'
import { CART_KEY } from './keys'

export { CART_KEY }

export const cartQuery = () =>
  queryOptions({
    queryKey: CART_KEY,
    queryFn: async () => (await api('/cart', cartResponseSchema)).cart,
  })

export function useCart() {
  const { status } = useAuth()
  return useQuery({ ...cartQuery(), enabled: status === 'signedIn' })
}

/** A cart younger than this is trusted for "add N to what I have"; older ones are re-read first. */
const FRESH_MS = 10_000

/**
 * "Add N to what I already have", capped like the server. The badge and cart update at once; `saved`
 * settles when the server has stored it (and rejects if it did not).
 */
export function useAddToCart() {
  return async (variantId: string, qty: number, stock: number) => {
    const state = queryClient.getQueryState<Cart>(CART_KEY)
    const fresh = state?.data !== undefined && Date.now() - state.dataUpdatedAt < FRESH_MS
    // Never add to a stale cart: the website may have changed it.
    const cart = fresh && state.data ? state.data : await queryClient.fetchQuery({ ...cartQuery(), staleTime: 0 })
    const current = cart.lines.find((l) => l.variantId === variantId)?.quantity ?? 0
    const quantity = Math.min(current + qty, maxQty(stock))
    const saved = setCartQuantity(variantId, quantity, 0)
    return { quantity, saved }
  }
}
