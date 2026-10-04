import { Pressable, StyleSheet, Text, View } from 'react-native'
import { openProduct } from '@/lib/nav'
import type { CartLine } from '@/api/schemas'
import { ProductImage } from '@/components/ProductImage'
import { QuantityStepper } from '@/components/QuantityStepper'
import { formatKobo } from '@/lib/money'
import { maxQty } from '@/lib/qty'
import { colors, PRESSED_SCALE, radius, space, TOUCH, type as t } from '@/theme'

type Props = { line: CartLine; onQuantity: (quantity: number) => void }

/** One cart line: photo, name, size, line total, stepper (stops at min(stock, 10)) and Remove. */
export function CartLineRow({ line, onQuantity }: Props) {
  const cap = maxQty(line.stock)
  return (
    <View style={styles.row}>
      <Pressable
        accessibilityRole="link"
        onPress={() => openProduct(line.productSlug)}
        accessibilityLabel={`View ${line.productName}`}
        style={({ pressed }) => [styles.photo, pressed && { transform: [{ scale: PRESSED_SCALE }] }]}
      >
        <ProductImage image={line.image} aspectRatio={4 / 5} />
      </Pressable>
      <View style={styles.info}>
        <View style={styles.top}>
          <View style={{ flex: 1 }}>
            <Text style={[t.eyebrow, { color: colors.muted }]} numberOfLines={1}>
              {line.brand}
            </Text>
            <Text style={t.h3} numberOfLines={2}>
              {line.productName}
            </Text>
            <Text style={[t.small, { color: colors.muted }]}>{line.sizeMl}ml</Text>
          </View>
          <Text style={t.bodyStrong}>{formatKobo(line.priceKobo * line.quantity)}</Text>
        </View>
        <View style={styles.bottom}>
          <QuantityStepper value={line.quantity} max={cap} onChange={onQuantity} />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Remove ${line.productName}`}
            onPress={() => onQuantity(0)}
            style={({ pressed }) => [
              styles.remove,
              pressed && {
                opacity: 0.6,
                transform: [{ scale: PRESSED_SCALE }],
              },
            ]}
          >
            <Text style={[t.smallStrong, { color: colors.muted, textDecorationLine: 'underline' }]}>Remove</Text>
          </Pressable>
        </View>
        {line.stock < 10 && line.quantity >= line.stock ? (
          <Text style={[t.small, { color: colors.arabian }]}>
            {line.stock === 1 ? 'Only 1 left' : `Only ${line.stock} left`}
          </Text>
        ) : null}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: space.md,
    paddingVertical: space.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  photo: {
    width: 84,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    alignSelf: 'flex-start',
  },
  info: { flex: 1, gap: space.sm },
  top: { flexDirection: 'row', gap: space.sm },
  bottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  remove: {
    minHeight: TOUCH,
    paddingHorizontal: space.sm,
    justifyContent: 'center',
  },
})
