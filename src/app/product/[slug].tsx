import { useLocalSearchParams } from 'expo-router'
import { ProductScreen } from '@/catalog/ProductScreen'

export default function Product() {
  const { slug } = useLocalSearchParams<{ slug: string }>()
  return <ProductScreen slug={slug} />
}
