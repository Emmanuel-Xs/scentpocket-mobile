import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/api/client'
import { orderResponseSchema } from '@/api/order-schemas'
import { CART_KEY } from '@/cart/queries'
import type { DeliveryForm } from './validation'
import { normalizeNigerianPhone } from './validation'

type PlaceOrderVars = { form: DeliveryForm; idempotencyKey: string }

/**
 * Places the order from the SERVER cart (items are never sent). The Idempotency-Key makes a retry
 * of the same attempt return the first order instead of a second one.
 */
export function usePlaceOrder() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ form, idempotencyKey }: PlaceOrderVars) => {
      const res = await api('/orders', orderResponseSchema, {
        method: 'POST',
        headers: { 'Idempotency-Key': idempotencyKey },
        body: {
          delivery: {
            fullName: form.fullName.trim(),
            phone: normalizeNigerianPhone(form.phone) ?? form.phone,
            addressLine: form.addressLine.trim(),
            city: form.city.trim(),
            state: form.state,
            deliveryZone: form.deliveryZone,
          },
        },
      })
      return res.order
    },
    onSuccess: () => {
      // The server emptied the cart in the same transaction as the order.
      void qc.invalidateQueries({ queryKey: CART_KEY })
      void qc.invalidateQueries({ queryKey: ['orders'] })
    },
  })
}
