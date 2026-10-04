import { router } from 'expo-router'

export const openProduct = (slug: string) => router.push({ pathname: '/product/[slug]', params: { slug } })
