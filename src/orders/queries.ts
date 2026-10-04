import { queryOptions } from '@tanstack/react-query'
import { api } from '@/api/client'
import { orderResponseSchema } from '@/api/order-schemas'

export const orderQuery = (ref: string) =>
  queryOptions({
    queryKey: ['orders', ref],
    queryFn: async () => (await api(`/orders/${encodeURIComponent(ref)}`, orderResponseSchema)).order,
  })
