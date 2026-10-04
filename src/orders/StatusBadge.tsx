import { StyleSheet, Text, View } from 'react-native'
import type { OrderStatus } from '@/api/order-schemas'
import { colors, radius, type as t } from '@/theme'

const LOOK: Record<OrderStatus, { label: string; bg: string; fg: string }> = {
  placed: { label: 'Placed', bg: colors.blush, fg: colors.ink },
  confirmed: { label: 'Confirmed', bg: 'rgba(31, 47, 82, 0.12)', fg: colors.designer },
  shipped: { label: 'Out for delivery', bg: 'rgba(154, 101, 16, 0.14)', fg: colors.arabian },
  delivered: { label: 'Delivered', bg: 'rgba(47, 107, 79, 0.14)', fg: colors.success },
  cancelled: { label: 'Cancelled', bg: 'rgba(155, 44, 44, 0.12)', fg: colors.danger },
}

export function StatusBadge({ status }: { status: OrderStatus }) {
  const look = LOOK[status]
  return (
    <View style={[styles.badge, { backgroundColor: look.bg }]}>
      <Text style={[t.smallStrong, { color: look.fg }]}>{look.label}</Text>
    </View>
  )
}

const styles = StyleSheet.create({ badge: { alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 4, borderRadius: radius.pill } })
