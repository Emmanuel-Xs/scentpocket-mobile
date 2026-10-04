import { useQueryClient } from '@tanstack/react-query'
import { randomUUID } from 'expo-crypto'
import { router } from 'expo-router'
import { useState } from 'react'
import { ApiError } from '@/api/client'
import { stockConflictDetailsSchema } from '@/api/order-schemas'
import type { Cart } from '@/api/schemas'
import { CART_KEY } from '@/cart/queries'
import { usePlaceOrder } from './mutations'
import { fieldErrorsFromIssues, validateDelivery } from './validation'
import type { DeliveryForm, FieldErrors } from './validation'

/** "Khamrah EDP 100ml: only 2 left (you had 3)" for each line a 409 says fell short. */
function describeShortLines(cart: Cart | undefined, details: unknown): string[] {
  const parsed = stockConflictDetailsSchema.safeParse(details)
  if (!parsed.success) return []
  return parsed.data.short.map((s) => {
    const line = cart?.lines.find((l) => l.variantId === s.variantId)
    const name = line ? `${line.productName} ${line.sizeMl}ml` : 'An item'
    if (s.available <= 0) return `${name} just sold out.`
    return `Only ${s.available} of ${name} left${line ? ` (you had ${line.quantity})` : ''}.`
  })
}

/**
 * Checkout submit logic. One Idempotency-Key per attempt: a retry after a network failure reuses it
 * (so the order can never be placed twice), a new one is made after a stock conflict because the
 * cart changed, and the screen is left for good after success.
 */
export function useCheckout() {
  const qc = useQueryClient()
  const place = usePlaceOrder()
  const [idempotencyKey, setIdempotencyKey] = useState(() => randomUUID())
  const [errors, setErrors] = useState<FieldErrors>({})
  const [serverError, setServerError] = useState<string | null>(null)
  const [conflict, setConflict] = useState<string[] | null>(null)

  const onError = (error: Error) => {
    const refreshCart = () => void qc.invalidateQueries({ queryKey: CART_KEY })
    if (!(error instanceof ApiError)) {
      setServerError('Something went wrong. Please try again.')
      return
    }
    if (error.status === 409 && error.code === 'insufficient_stock') {
      // Read the cart as it was shown to the customer, before the refresh changes it.
      setConflict(describeShortLines(qc.getQueryData<Cart>(CART_KEY), error.details))
      setIdempotencyKey(randomUUID())
      refreshCart()
    } else if (error.status === 422 && error.code === 'validation_failed') {
      const fields = fieldErrorsFromIssues(error.details)
      setErrors(fields)
      if (Object.keys(fields).length === 0) setServerError(error.message)
    } else if (error.code === 'empty_cart') {
      setServerError('Your cart is empty.')
      refreshCart()
    } else if (error.status === 0) {
      setServerError("We couldn't reach Scentpocket. Try again: we won't place your order twice.")
    } else {
      setServerError(error.message)
    }
  }

  /** Returns the invalid fields (empty when the form is fine and the order is on its way). */
  const submit = (form: DeliveryForm): FieldErrors => {
    const found = validateDelivery(form)
    setErrors(found)
    setServerError(null)
    setConflict(null)
    if (Object.keys(found).length > 0) return found
    place.mutate(
      { form, idempotencyKey },
      {
        onSuccess: (order) => {
          setIdempotencyKey(randomUUID())
          router.replace({ pathname: '/orders/[ref]', params: { ref: order.ref, placed: '1' } })
        },
        onError,
      },
    )
    return found
  }

  return { submit, pending: place.isPending, placed: place.isSuccess, errors, setErrors, serverError, conflict }
}
