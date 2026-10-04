import { useQuery } from '@tanstack/react-query'
import { router } from 'expo-router'
import { useState } from 'react'
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import type { ProductDetail } from '@/api/schemas'
import { ApiError } from '@/api/client'
import { Icon } from '@/components/Icon'
import { ProductCard } from '@/components/ProductCard'
import { QuantityStepper } from '@/components/QuantityStepper'
import { Skeleton } from '@/components/Skeleton'
import { EmptyState, ErrorState } from '@/components/States'
import { TierChip } from '@/components/TierChip'
import { maxQty } from '@/lib/qty'
import { colors, radius, space, TOUCH, tiers, type as t } from '@/theme'
import { BuyBar } from './BuyBar'
import { DupeCallouts } from './DupeCallouts'
import { Gallery } from './Gallery'
import { productQuery } from './queries'
import { ScentInfo } from './ScentInfo'
import { SizePicker } from './SizePicker'

function BackButton() {
  const insets = useSafeAreaInsets()
  return (
    <View style={[styles.backRow, { paddingTop: insets.top + space.xs }]}>
      <Pressable
        onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
        accessibilityRole="button"
        accessibilityLabel="Back"
        style={({ pressed }) => [styles.back, pressed && { backgroundColor: colors.blush }]}
      >
        <Icon name="back" size={24} />
      </Pressable>
    </View>
  )
}

export function ProductScreen({ slug }: { slug: string }) {
  const { data, isPending, isError, error, refetch } = useQuery(productQuery(slug))

  if (isPending) return <ProductSkeleton />
  if (isError) {
    const missing = error instanceof ApiError && error.status === 404
    return (
      <View style={styles.screen}>
        <BackButton />
        {missing ? (
          <EmptyState
            title="We could not find that scent"
            body="It may have sold out for good or moved."
            actionLabel="Back to the shop"
            onAction={() => router.replace('/')}
          />
        ) : (
          <ErrorState message={error.message} onRetry={() => void refetch()} />
        )}
      </View>
    )
  }
  return <ProductBody product={data} />
}

function ProductBody({ product }: { product: ProductDetail }) {
  const { card, variants } = product
  const firstInStock = variants.find((v) => v.stock > 0)
  const [selectedId, setSelectedId] = useState((firstInStock ?? variants.at(0))?.id ?? '')
  const [qty, setQty] = useState(1)
  const variant = variants.find((v) => v.id === selectedId)

  if (!variant) {
    return (
      <View style={styles.screen}>
        <BackButton />
        <EmptyState title="No sizes right now" body="Check back soon." />
      </View>
    )
  }
  const cap = maxQty(variant.stock)
  const images = product.images.length > 0 ? product.images : card.image ? [card.image] : []

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <BackButton />
        <Gallery images={images} />
        <View style={styles.body}>
          <TierChip tier={card.tier} />
          <Text style={[t.eyebrow, { color: colors.muted }]}>{card.brand}</Text>
          <Text style={t.h1}>{card.name}</Text>
          <Text style={[t.small, { color: tiers[card.tier].color }]}>{tiers[card.tier].range}</Text>

          <Text style={[t.eyebrow, styles.label]}>Size</Text>
          <SizePicker
            variants={variants}
            selectedId={variant.id}
            onSelect={(id) => {
              setSelectedId(id)
              setQty(1)
            }}
          />

          {variant.stock > 0 ? (
            <View style={{ gap: space.sm }}>
              <Text style={[t.eyebrow, styles.label]}>Quantity</Text>
              <QuantityStepper value={Math.min(qty, cap)} max={cap} onChange={setQty} />
              {variant.stock < 10 ? (
                <Text style={[t.small, { color: colors.muted }]}>
                  Only {variant.stock} {variant.stock === 1 ? 'bottle' : 'bottles'} of {variant.sizeMl}ml left.
                </Text>
              ) : null}
            </View>
          ) : (
            <View style={styles.soldOut} accessibilityRole="alert">
              <Text style={t.bodyStrong}>This size is sold out.</Text>
              <Text style={[t.small, { color: colors.muted }]}>
                {product.dupes.length > 0 ? 'See a cheaper scent in the same mood below.' : 'Try another size or scent.'}
              </Text>
            </View>
          )}

          <DupeCallouts card={card} inspiredBy={product.inspiredBy} dupes={product.dupes} />
          <ScentInfo product={product} />

          {product.related.length > 0 ? (
            <View style={{ gap: space.md }}>
              <Text style={t.h2}>More in {tiers[card.tier].label}</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: space.md }}>
                {product.related.map((r) => (
                  <ProductCard key={r.id} product={r} width={160} />
                ))}
              </ScrollView>
            </View>
          ) : null}
        </View>
      </ScrollView>
      <BuyBar product={product} variant={variant} qty={Math.min(qty, cap)} />
    </View>
  )
}

function ProductSkeleton() {
  return (
    <View style={styles.screen} accessibilityLabel="Loading scent" accessibilityRole="progressbar">
      <BackButton />
      <Skeleton style={{ aspectRatio: 1, borderRadius: 0 }} />
      <View style={styles.body}>
        <Skeleton style={{ height: 14, width: '30%' }} />
        <Skeleton style={{ height: 40, width: '75%' }} />
        <Skeleton style={{ height: TOUCH + 8 }} />
        <Skeleton style={{ height: TOUCH + 8 }} />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.cream },
  scroll: { paddingBottom: space.xxl },
  backRow: { backgroundColor: colors.surface, paddingHorizontal: space.sm },
  back: { width: TOUCH, height: TOUCH, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
  body: { padding: space.lg, gap: space.lg },
  label: { color: colors.muted },
  soldOut: { padding: space.lg, borderRadius: radius.md, borderWidth: 1, borderStyle: 'dashed', borderColor: colors.borderStrong, gap: 4 },
})
