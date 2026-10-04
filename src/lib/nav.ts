import { router } from 'expo-router'

export const openProduct = (slug: string) => router.push({ pathname: '/product/[slug]', params: { slug } })

export const openOrder = (ref: string) => router.push({ pathname: '/orders/[ref]', params: { ref } })
