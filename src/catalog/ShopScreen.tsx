import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { FlatList, RefreshControl, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import type { ProductCard as Card, Tier } from '@/api/schemas'
import { EmptyState, ErrorState } from '@/components/States'
import { Icon } from '@/components/Icon'
import { Pill } from '@/components/Pill'
import { ProductCard, ProductCardSkeleton, SkeletonLine } from '@/components/ProductCard'
import { Wordmark } from '@/components/Wordmark'
import { useDebounced } from '@/lib/use-debounced'
import { colors, radius, space, TOUCH, tiers, type as t } from '@/theme'
import { catalogQuery } from './queries'
import type { Sort } from './queries'

const SORTS: { value: Sort; label: string }[] = [
  { value: 'featured', label: 'Featured' },
  { value: 'price_asc', label: 'Price: low to high' },
  { value: 'price_desc', label: 'Price: high to low' },
  { value: 'newest', label: 'Newest' },
]

const SPACER = 'spacer'
type Item = Card | typeof SPACER

export function ShopScreen() {
  const insets = useSafeAreaInsets()
  const [tier, setTier] = useState<Tier | undefined>()
  const [sort, setSort] = useState<Sort>('featured')
  const [text, setText] = useState('')
  const q = useDebounced(text.trim(), 300)

  const { data, isPending, isError, error, refetch, isRefetching, isPlaceholderData } = useQuery(
    catalogQuery({ tier, q: q || undefined, sort: sort === 'featured' ? undefined : sort }),
  )

  const clear = () => {
    setTier(undefined)
    setText('')
    setSort('featured')
  }

  // An odd count would stretch the last card across the row, so pad it.
  const items: Item[] = data ? (data.length % 2 === 1 ? [...data, SPACER] : data) : []

  return (
    <View style={[styles.screen, { paddingTop: insets.top + space.sm }]}>
      <View style={styles.top}>
        <Wordmark width={132} />
        <View style={styles.search}>
          <Icon name="search" size={20} color={colors.muted} />
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder="Search scents"
            placeholderTextColor={colors.disabled}
            accessibilityLabel="Search scents"
            returnKeyType="search"
            maxLength={80}
            autoCorrect={false}
            style={[t.body, styles.input]}
          />
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
          <Pill label="All" selected={!tier} onPress={() => setTier(undefined)} />
          {(Object.keys(tiers) as Tier[]).map((k) => (
            <Pill key={k} label={tiers[k].label} accent={tiers[k].color} selected={tier === k} onPress={() => setTier(tier === k ? undefined : k)} />
          ))}
        </ScrollView>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
          {SORTS.map((s) => (
            <Pill key={s.value} label={s.label} selected={sort === s.value} onPress={() => setSort(s.value)} />
          ))}
        </ScrollView>
      </View>

      {isPending ? (
        <ShopSkeleton />
      ) : isError && !data ? (
        <ErrorState message={error.message} onRetry={() => void refetch()} />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => (item === SPACER ? SPACER : item.id)}
          numColumns={2}
          columnWrapperStyle={styles.columns}
          contentContainerStyle={[styles.list, { paddingBottom: space.xxl }, isPlaceholderData && { opacity: 0.6 }]}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          refreshControl={<RefreshControl refreshing={isRefetching && !isPlaceholderData} onRefresh={() => void refetch()} tintColor={colors.ink} colors={[colors.ink]} />}
          renderItem={({ item }) => (item === SPACER ? <View style={{ flex: 1 }} /> : <ProductCard product={item} />)}
          ListEmptyComponent={
            <EmptyState
              title="No scents match that"
              body="Try another tier or a shorter search."
              actionLabel="Clear filters"
              onAction={clear}
            />
          }
          ListHeaderComponent={
            data && data.length > 0 ? (
              <Text style={[t.small, { color: colors.muted }]}>{data.length} {data.length === 1 ? 'scent' : 'scents'}</Text>
            ) : null
          }
        />
      )}
    </View>
  )
}

/** Mirrors the loaded list: the same padding, the "N scents" line, 2 columns and gaps. */
function ShopSkeleton() {
  return (
    <View style={[styles.list, { paddingBottom: space.xxl }]} accessibilityLabel="Loading scents" accessibilityRole="progressbar">
      <SkeletonLine lineHeight={t.small.lineHeight} width={64} />
      {[0, 1, 2].map((row) => (
        <View key={row} style={styles.columns}>
          <ProductCardSkeleton />
          <ProductCardSkeleton />
        </View>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.cream },
  top: { paddingHorizontal: space.lg, gap: space.md, paddingBottom: space.md },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    minHeight: TOUCH,
    paddingHorizontal: space.lg,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surface,
  },
  input: { flex: 1, color: colors.ink, paddingVertical: 0 },
  row: { gap: space.sm },
  list: { paddingHorizontal: space.lg, gap: space.lg },
  columns: { flexDirection: 'row', gap: space.md },
})
