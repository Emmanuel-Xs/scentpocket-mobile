import { queryOptions } from '@tanstack/react-query'
import { api } from '@/api/client'
import { meResponseSchema } from '@/api/schemas'

export const meQuery = () =>
  queryOptions({
    queryKey: ['me'],
    queryFn: async () => (await api('/me', meResponseSchema)).user,
    staleTime: 5 * 60_000,
  })
