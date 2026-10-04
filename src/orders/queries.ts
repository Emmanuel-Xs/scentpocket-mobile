import { queryOptions } from '@tanstack/react-query'
import { api } from '@/api/client'
import { orderResponseSchema, ordersResponseSchema } from '@/api/order-schemas'

export const orderQuery = (ref: string) =>
  queryOptions({
    queryKey: ['orders', ref],
    queryFn: async () => (await api(`/orders/${encodeURIComponent(ref)}`, orderResponseSchema)).order,
  })

/** The signed in user's orders, newest first. */
export const ordersQuery = () =>
  queryOptions({
    queryKey: ['orders', 'list'],
    queryFn: async () => (await api('/orders', ordersResponseSchema)).orders,
  })
