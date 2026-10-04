import { Pressable, StyleSheet, Text, View } from 'react-native'
import { openProduct } from '@/lib/nav'
import type { ProductCard as Card } from '@/api/schemas'
import { formatKobo } from '@/lib/money'
import { colors, PRESSED_SCALE, radius, space, type as t } from '@/theme'
import { ProductImage } from './ProductImage'
import { Skeleton } from './Skeleton'
import { TierChip } from './TierChip'

type Props = { product: Card; width?: number }

/** One product in a grid or a row. The whole card is the tap target. */
export function ProductCard({ product, width }: Props) {
  return (
    <Pressable
      accessibilityRole="link"
      onPress={() => openProduct(product.slug)}
      accessibilityLabel={`${product.brand} ${product.name}, ${product.multiSize ? 'from ' : ''}${formatKobo(product.fromKobo)}${product.soldOut ? ', sold out' : ''}`}
      style={({ pressed }) => [
        styles.card,
        width ? { width } : styles.fill,
        pressed && { transform: [{ scale: PRESSED_SCALE }] },
      ]}
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
      <Text style={[t.eyebrow, { color: colors.muted }]} numberOfLines={1}>
        {product.brand}
      </Text>
      <Text style={[t.h3, styles.name]} numberOfLines={2}>
        {product.name}
      </Text>
      <Text style={[t.small, { color: colors.text2 }]} numberOfLines={1}>
        {product.notes.join(', ')}
      </Text>
      <Text style={t.bodyStrong}>
        {product.multiSize ? 'from ' : ''}
        {formatKobo(product.fromKobo)}
      </Text>
    </Pressable>
  )
}

/** One text line's worth of space (the real line height) holding a slightly shorter bar. */
export function SkeletonLine({ lineHeight, width }: { lineHeight: number; width: `${number}%` | number }) {
  return (
    <View style={{ height: lineHeight, justifyContent: 'center' }}>
      <Skeleton style={{ height: Math.round(lineHeight * 0.7), width, borderRadius: 6 }} />
    </View>
  )
}

/** Same frame, spacing and line heights as ProductCard, so nothing jumps when the data arrives. */
export function ProductCardSkeleton() {
  return (
    <View
      style={[styles.card, styles.fill]}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <View style={styles.photo}>
        <Skeleton style={{ aspectRatio: 4 / 5, borderRadius: 0 }} />
      </View>
      <SkeletonLine lineHeight={t.eyebrow.lineHeight} width="40%" />
      <SkeletonLine lineHeight={t.h3.lineHeight} width="88%" />
      <SkeletonLine lineHeight={t.h3.lineHeight} width="55%" />
      <SkeletonLine lineHeight={t.small.lineHeight} width="70%" />
      <SkeletonLine lineHeight={t.bodyStrong.lineHeight} width="42%" />
    </View>
  )
}

const styles = StyleSheet.create({
  card: { gap: 2 },
  // minWidth 0 lets a long brand name truncate instead of stretching the column.
  fill: { flex: 1, minWidth: 0 },
  // Always two lines tall, so cards in a row line up and the skeleton matches exactly.
  name: { minHeight: t.h3.lineHeight * 2 },
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
