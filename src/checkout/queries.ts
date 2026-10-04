import { queryOptions } from '@tanstack/react-query'
import { api } from '@/api/client'
import { deliveryZonesResponseSchema } from '@/api/schemas'

/** Fees, ETAs, the free delivery threshold and the state list. Static, so cache it for a day. */
export const deliveryZonesQuery = () =>
  queryOptions({
    queryKey: ['delivery-zones'],
    queryFn: () => api('/delivery-zones', deliveryZonesResponseSchema, { auth: false }),
    staleTime: 24 * 60 * 60_000,
  })
