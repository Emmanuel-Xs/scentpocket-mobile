import { useQuery } from '@tanstack/react-query'
import { Link } from 'expo-router'
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import type { DupePair, ProductCard } from '@/api/schemas'
import { EmptyState, ErrorState } from '@/components/States'
import { ProductImage } from '@/components/ProductImage'
import { Skeleton } from '@/components/Skeleton'
import { TierChip } from '@/components/TierChip'
import { formatKobo } from '@/lib/money'
import { colors, PRESSED_SCALE, radius, shadow, space, type as t } from '@/theme'
import { dupesQuery } from './queries'

export function DupesScreen() {
  const insets = useSafeAreaInsets()
  const { data, isPending, isError, error, refetch, isRefetching } = useQuery(dupesQuery())

  return (
    <View style={[styles.screen, { paddingTop: insets.top + space.lg }]}>
      <View style={styles.head}>
        <Text style={t.h1}>Dupes</Text>
        <Text style={[t.body, { color: colors.muted }]}>
          Same mood, kinder price. Each pair shows what you save.
        </Text>
      </View>
      {isPending ? (
        <View style={styles.list} accessibilityLabel="Loading dupes" accessibilityRole="progressbar">
          {[0, 1].map((i) => (
            <Skeleton key={i} style={{ height: 260, borderRadius: radius.xl }} />
          ))}
        </View>
      ) : isError ? (
        <ErrorState message={error.message} onRetry={() => void refetch()} />
      ) : (
        <FlatList
          data={data}
          keyExtractor={(p) => `${p.original.id}-${p.dupe.id}`}
          contentContainerStyle={[styles.list, { paddingBottom: space.xxl }]}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={() => void refetch()} tintColor={colors.ink} colors={[colors.ink]} />}
          renderItem={({ item }) => <PairCard pair={item} />}
          ListEmptyComponent={<EmptyState title="No dupes yet" body="Check back soon, we are matching more scents." />}
        />
      )}
    </View>
  )
}

function Side({ product, label }: { product: ProductCard; label: string }) {
  return (
    <Link href={{ pathname: '/product/[slug]', params: { slug: product.slug } }} asChild>
      <Pressable
        accessibilityRole="link"
        accessibilityLabel={`${label}: ${product.brand} ${product.name}, ${formatKobo(product.fromKobo)}`}
        style={({ pressed }) => [styles.side, pressed && { transform: [{ scale: PRESSED_SCALE }] }]}
      >
        <View style={styles.photo}>
          <ProductImage image={product.image} aspectRatio={1} />
        </View>
        <Text style={[t.eyebrow, { color: colors.muted }]}>{label}</Text>
        <Text style={t.h3} numberOfLines={2}>{product.name}</Text>
        <Text style={[t.small, { color: colors.muted }]} numberOfLines={1}>{product.brand}</Text>
        <TierChip tier={product.tier} />
        <Text style={t.bodyStrong}>{product.multiSize ? 'from ' : ''}{formatKobo(product.fromKobo)}</Text>
      </Pressable>
    </Link>
  )
}

function PairCard({ pair }: { pair: DupePair }) {
  return (
    <View style={styles.pair}>
      <View style={styles.sides}>
        <Side product={pair.original} label="The original" />
        <Side product={pair.dupe} label="The dupe" />
      </View>
      <View style={styles.saving} accessibilityLabel={`You save ${formatKobo(pair.savingKobo)}, ${pair.savingPercent} percent`}>
        <Text style={[t.bodyStrong, { color: colors.success }]}>
          Save {formatKobo(pair.savingKobo)} ({pair.savingPercent}%)
        </Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.cream },
  head: { paddingHorizontal: space.lg, gap: space.xs, paddingBottom: space.md },
  list: { paddingHorizontal: space.lg, gap: space.lg },
  pair: { backgroundColor: colors.surface, borderRadius: radius.xl, borderWidth: 1, borderColor: colors.border, padding: space.md, gap: space.md, ...shadow.sm },
  sides: { flexDirection: 'row', gap: space.md },
  side: { flex: 1, gap: 4 },
  photo: { borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, overflow: 'hidden', marginBottom: space.xs },
  saving: { alignItems: 'center', paddingVertical: space.sm, borderRadius: radius.pill, backgroundColor: 'rgba(47, 107, 79, 0.1)' },
})
