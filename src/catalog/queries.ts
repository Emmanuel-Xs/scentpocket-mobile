import { keepPreviousData, queryOptions } from '@tanstack/react-query'
import { api } from '@/api/client'
import {
  catalogResponseSchema,
  dupesResponseSchema,
  productResponseSchema,
} from '@/api/schemas'
import type { Tier } from '@/api/schemas'

export type Sort = 'featured' | 'price_asc' | 'price_desc' | 'newest'
export type CatalogFilters = { tier?: Tier; q?: string; sort?: Sort }

/** Public routes: no session needed, so a signed out visitor can browse. */
export const catalogQuery = (filters: CatalogFilters) =>
  queryOptions({
    queryKey: ['catalog', filters],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (filters.tier) params.set('tier', filters.tier)
      if (filters.q) params.set('q', filters.q)
      if (filters.sort) params.set('sort', filters.sort)
      const qs = params.toString()
      const res = await api(`/catalog${qs ? `?${qs}` : ''}`, catalogResponseSchema, { auth: false })
      return res.products
    },
    placeholderData: keepPreviousData,
  })

export const productQuery = (slug: string) =>
  queryOptions({
    queryKey: ['product', slug],
    queryFn: async () => (await api(`/products/${encodeURIComponent(slug)}`, productResponseSchema, { auth: false })).product,
  })

export const dupesQuery = () =>
  queryOptions({
    queryKey: ['dupes'],
    queryFn: async () => (await api('/dupes', dupesResponseSchema, { auth: false })).dupes,
  })
