import { Link } from 'expo-router'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import type { ProductCard } from '@/api/schemas'
import { formatKobo } from '@/lib/money'
import { colors, PRESSED_SCALE, radius, space, type as t } from '@/theme'

type Props = { card: ProductCard; inspiredBy: ProductCard | null; dupes: ProductCard[] }

const percentLess = (from: number, to: number) => Math.round(((from - to) / from) * 100)

function CalloutLink({ product, kicker, line, tone }: { product: ProductCard; kicker: string; line: string; tone: string }) {
  return (
    <Link href={{ pathname: '/product/[slug]', params: { slug: product.slug } }} asChild>
      <Pressable
        accessibilityRole="link"
        accessibilityLabel={`${kicker}: ${product.brand} ${product.name}. ${line}`}
        style={({ pressed }) => [styles.callout, { borderColor: tone }, pressed && { transform: [{ scale: PRESSED_SCALE }] }]}
      >
        <Text style={[t.eyebrow, { color: tone }]}>{kicker}</Text>
        <Text style={t.h3}>{product.brand} {product.name}</Text>
        <Text style={[t.small, { color: colors.text2 }]}>{line}</Text>
      </Pressable>
    </Link>
  )
}

/** The dupe story: what this scent is inspired by, and cheaper scents inspired by it. */
export function DupeCallouts({ card, inspiredBy, dupes }: Props) {
  if (!inspiredBy && dupes.length === 0) return null
  return (
    <View style={{ gap: space.md }}>
      {inspiredBy ? (
        <CalloutLink
          product={inspiredBy}
          kicker="Inspired by"
          tone={colors.info}
          line={`The original is ${formatKobo(inspiredBy.fromKobo)}. This one is ${percentLess(inspiredBy.fromKobo, card.fromKobo)}% less.`}
        />
      ) : null}
      {dupes.map((d) => (
        <CalloutLink
          key={d.id}
          product={d}
          kicker="Want it for less?"
          tone={colors.success}
          line={`From ${formatKobo(d.fromKobo)}, ${percentLess(card.fromKobo, d.fromKobo)}% less.`}
        />
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  callout: { backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1.5, padding: space.lg, gap: 4 },
})
