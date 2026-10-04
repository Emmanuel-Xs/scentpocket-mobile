import { queryOptions, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/api/client'
import { cartResponseSchema } from '@/api/schemas'
import type { Cart } from '@/api/schemas'
import { useAuth } from '@/auth/AuthProvider'
import { maxQty } from '@/lib/qty'
import { withQuantity } from './optimistic'

/** The server cart is the only cart. There is no local copy. */
export const CART_KEY = ['cart'] as const

export const cartQuery = () =>
  queryOptions({
    queryKey: CART_KEY,
    queryFn: async () => (await api('/cart', cartResponseSchema)).cart,
  })

export function useCart() {
  const { status } = useAuth()
  return useQuery({ ...cartQuery(), enabled: status === 'signedIn' })
}

export const MUTATION_KEY = ['setCartItem'] as const

/**
 * Sets one line to an absolute quantity (0 removes it). Optimistic, rolled back on error. Saves
 * share a `scope`, so they run one at a time, in order, and the last one wins.
 */
export function useSetCartItem() {
  const qc = useQueryClient()
  return useMutation({
    mutationKey: MUTATION_KEY,
    scope: { id: 'cart' },
    mutationFn: async (vars: { variantId: string; quantity: number }) =>
      (await api('/cart/items', cartResponseSchema, { method: 'PUT', body: vars })).cart,
    onMutate: async (vars) => {
      // A refetch already in flight would land after this and undo it.
      await qc.cancelQueries({ queryKey: CART_KEY })
      const previous = qc.getQueryData<Cart>(CART_KEY)
      if (previous) qc.setQueryData(CART_KEY, withQuantity(previous, vars.variantId, vars.quantity))
      return { previous }
    },
    onError: (_error, _vars, context) => {
      if (context?.previous) qc.setQueryData(CART_KEY, context.previous)
    },
    onSuccess: (cart) => {
      // Only the last save in the queue is allowed to overwrite the cache.
      if (qc.isMutating({ mutationKey: MUTATION_KEY }) <= 1) qc.setQueryData(CART_KEY, cart)
    },
    onSettled: () => {
      if (qc.isMutating({ mutationKey: MUTATION_KEY }) <= 1) void qc.invalidateQueries({ queryKey: CART_KEY })
    },
  })
}

/** "Add 2 to what I already have", capped at what the server would allow. */
export function useAddToCart() {
  const qc = useQueryClient()
  const set = useSetCartItem()
  return async (variantId: string, qty: number, stock: number) => {
    const cart = await qc.ensureQueryData(cartQuery())
    const current = cart.lines.find((l) => l.variantId === variantId)?.quantity ?? 0
    const quantity = Math.min(current + qty, maxQty(stock))
    await set.mutateAsync({ variantId, quantity })
    return quantity
  }
}
