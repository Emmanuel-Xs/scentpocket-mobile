import { Link } from 'expo-router'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import type { ProductCard as Card } from '@/api/schemas'
import { formatKobo } from '@/lib/money'
import { colors, PRESSED_SCALE, radius, space, type as t } from '@/theme'
import { ProductImage } from './ProductImage'
import { TierChip } from './TierChip'

type Props = { product: Card; width?: number }

/** One product in a grid or a row. The whole card is the tap target. */
export function ProductCard({ product, width }: Props) {
  return (
    <Link href={{ pathname: '/product/[slug]', params: { slug: product.slug } }} asChild>
      <Pressable
        accessibilityRole="link"
        accessibilityLabel={`${product.brand} ${product.name}, ${product.multiSize ? 'from ' : ''}${formatKobo(product.fromKobo)}${product.soldOut ? ', sold out' : ''}`}
        style={({ pressed }) => [styles.card, width ? { width } : { flex: 1 }, pressed && { transform: [{ scale: PRESSED_SCALE }] }]}
      >
        <View style={[styles.photo, product.soldOut && { opacity: 0.6 }]}>
          <ProductImage image={product.image} />
          <View style={styles.chip}>
            <TierChip tier={product.tier} />
          </View>
          {product.soldOut ? (
            <Text style={[t.caption, styles.badge, { backgroundColor: colors.ink, color: colors.cream }]}>Sold out</Text>
          ) : product.lowStock !== null ? (
            <Text style={[t.caption, styles.badge, { backgroundColor: colors.danger, color: colors.white }]}>
              Only {product.lowStock} left
            </Text>
          ) : null}
        </View>
        <Text style={[t.eyebrow, { color: colors.muted }]} numberOfLines={1}>{product.brand}</Text>
        <Text style={t.h3} numberOfLines={2}>{product.name}</Text>
        <Text style={[t.small, { color: colors.text2 }]} numberOfLines={1}>{product.notes.join(', ')}</Text>
        <Text style={t.bodyStrong}>
          {product.multiSize ? 'from ' : ''}
          {formatKobo(product.fromKobo)}
        </Text>
      </Pressable>
    </Link>
  )
}

const styles = StyleSheet.create({
  card: { gap: 2 },
  photo: {
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    marginBottom: space.sm,
  },
  chip: { position: 'absolute', top: space.sm, left: space.sm },
  badge: {
    position: 'absolute',
    bottom: space.sm,
    left: space.sm,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
    overflow: 'hidden',
  },
})
