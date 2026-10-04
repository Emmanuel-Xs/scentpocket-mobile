import { api } from '@/api/client'
import { cartResponseSchema } from '@/api/schemas'
import type { Cart } from '@/api/schemas'
import { queryClient } from '@/lib/query'
import { CART_KEY } from './keys'
import { withQuantity } from './optimistic'

/**
 * Every cart edit goes through here.
 *
 * - Optimistic: the cached cart changes on the tap, before anything is sent.
 * - Debounced per line: rapid taps on one stepper collapse into ONE request with the final value
 *   (PUT /cart/items takes an absolute quantity, so only the last one matters).
 * - Ordered: saves run one at a time, so the server always ends on the newest value.
 * - Self-healing: if a save fails, the cart is re-read from the server (the truth) and the caller
 *   is told, so the screen never keeps a number the server did not accept.
 *
 * It lives outside React on purpose: an edit still gets saved if the customer leaves the screen
 * during the debounce window.
 */

const DEBOUNCE_MS = 400

type Waiter = { resolve: () => void; reject: (error: unknown) => void }
type Entry = { quantity: number; timer?: ReturnType<typeof setTimeout>; waiters: Waiter[] }

const entries = new Map<string, Entry>()
let queue: Promise<void> = Promise.resolve()
let queued = 0

/** True while an edit is waiting out its debounce or being saved (polling pauses meanwhile). */
export const hasPendingCartEdits = () => entries.size > 0 || queued > 0

async function save(variantId: string, quantity: number, waiters: Waiter[]) {
  try {
    const res = await api('/cart/items', cartResponseSchema, {
      method: 'PUT',
      body: { variantId, quantity },
    })
    // Only the newest answer may overwrite the cache; an older one would undo later taps.
    if (queued === 1 && entries.size === 0) queryClient.setQueryData(CART_KEY, res.cart)
    waiters.forEach((w) => w.resolve())
  } catch (error) {
    void queryClient.invalidateQueries({ queryKey: CART_KEY })
    waiters.forEach((w) => w.reject(error))
  }
}

function flush(variantId: string) {
  const entry = entries.get(variantId)
  if (!entry) return
  entries.delete(variantId)
  queued += 1
  queue = queue.then(() => save(variantId, entry.quantity, entry.waiters)).finally(() => {
    queued -= 1
    // Everything is saved: look once more so the cart is exactly what the server holds.
    if (queued === 0 && entries.size === 0) void queryClient.invalidateQueries({ queryKey: CART_KEY })
  })
}

/**
 * Set one line to an absolute quantity (0 removes it). Resolves when the server has saved it,
 * rejects if it did not. The cached cart is already updated by the time this returns.
 */
export function setCartQuantity(variantId: string, quantity: number, debounceMs = DEBOUNCE_MS): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    // A refetch already in flight would land after this tap and undo it.
    void queryClient.cancelQueries({ queryKey: CART_KEY })
    const current = queryClient.getQueryData<Cart>(CART_KEY)
    if (current) queryClient.setQueryData(CART_KEY, withQuantity(current, variantId, quantity))

    const entry = entries.get(variantId) ?? { quantity, waiters: [] }
    entries.set(variantId, entry)
    entry.quantity = quantity
    entry.waiters.push({ resolve, reject })
    clearTimeout(entry.timer)
    entry.timer = setTimeout(() => flush(variantId), debounceMs)
  })
}
