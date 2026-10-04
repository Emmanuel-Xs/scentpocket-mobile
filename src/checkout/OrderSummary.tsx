import { StyleSheet, Text, View } from 'react-native'
import type { Cart } from '@/api/schemas'
import { formatKobo } from '@/lib/money'
import { colors, radius, space, type as t } from '@/theme'

type Props = { cart: Cart; deliveryFeeKobo: number | null }

/** Lines, subtotal, delivery and total. The delivery fee is a preview until the server confirms it. */
export function OrderSummary({ cart, deliveryFeeKobo }: Props) {
  const total = cart.subtotalKobo + (deliveryFeeKobo ?? 0)
  return (
    <View style={styles.box}>
      {cart.lines.map((l) => (
        <View key={l.variantId} style={styles.row}>
          <Text style={[t.body, { flex: 1 }]} numberOfLines={2}>
            {l.quantity} × {l.productName} {l.sizeMl}ml
          </Text>
          <Text style={t.body}>{formatKobo(l.priceKobo * l.quantity)}</Text>
        </View>
      ))}
      <View style={styles.rule} />
      <View style={styles.row}>
        <Text style={t.body}>Subtotal</Text>
        <Text style={t.body}>{formatKobo(cart.subtotalKobo)}</Text>
      </View>
      <View style={styles.row}>
        <Text style={t.body}>Delivery</Text>
        <Text style={[t.body, deliveryFeeKobo === 0 && { color: colors.success }]}>
          {deliveryFeeKobo === null ? 'Choose a zone' : deliveryFeeKobo === 0 ? 'Free' : formatKobo(deliveryFeeKobo)}
        </Text>
      </View>
      <View style={styles.row}>
        <Text style={t.bodyStrong}>Total</Text>
        <Text style={t.h3}>{formatKobo(total)}</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  box: { gap: space.sm, padding: space.lg, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', gap: space.md },
  rule: { height: 1, backgroundColor: colors.border, marginVertical: 2 },
})
