import { useLocalSearchParams } from 'expo-router'
import { OrderDetailScreen } from '@/orders/OrderDetailScreen'

export default function OrderDetail() {
  const { ref, placed } = useLocalSearchParams<{ ref: string; placed?: string }>()
  return <OrderDetailScreen orderRef={ref} placed={placed === '1'} />
}
