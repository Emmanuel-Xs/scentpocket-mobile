import { Pressable, StyleSheet, Text, View } from 'react-native'
import type { OrderSummary } from '@/api/order-schemas'
import { ProductImage } from '@/components/ProductImage'
import { formatDateTime } from '@/lib/dates'
import { formatKobo } from '@/lib/money'
import { openOrder } from '@/lib/nav'
import { colors, PRESSED_SCALE, radius, space, type as t } from '@/theme'
import { StatusBadge } from './StatusBadge'

/** One order in the list: its first photo, reference, date, status, item count and total. */
export function OrderRow({ order }: { order: OrderSummary }) {
  return (
    <Pressable
      accessibilityRole="link"
      accessibilityLabel={`Order ${order.ref}, ${order.status}, ${formatKobo(order.totalKobo)}`}
      onPress={() => openOrder(order.ref)}
      style={({ pressed }) => [styles.row, pressed && { transform: [{ scale: PRESSED_SCALE }] }]}
    >
      <View style={styles.photos}>
        {order.images.slice(0, 1).map((image) => (
          <View key={image.src} style={styles.photo}>
            <ProductImage image={image} aspectRatio={1} />
          </View>
        ))}
      </View>
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={t.bodyStrong}>{order.ref}</Text>
        <Text style={[t.small, { color: colors.muted }]}>{formatDateTime(order.createdAt)}</Text>
        <Text style={[t.small, { color: colors.muted }]}>
          {order.itemCount} {order.itemCount === 1 ? 'item' : 'items'}
        </Text>
      </View>
      <View style={styles.right}>
        <Text style={t.bodyStrong}>{formatKobo(order.totalKobo)}</Text>
        <StatusBadge status={order.status} />
      </View>
    </Pressable>
  )
}

/** Same row frame as OrderRow, so nothing jumps when the list arrives. */
export function OrderRowSkeleton({ children }: { children: React.ReactNode }) {
  return <View style={styles.row}>{children}</View>
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    padding: space.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  photos: { flexDirection: 'row', width: 56 },
  photo: { width: 56, borderRadius: radius.sm, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' },
  right: { alignItems: 'flex-end', gap: 6 },
})
