import { useIsMutating, useQuery } from '@tanstack/react-query'
import { router, useIsFocused } from 'expo-router'
import { useState } from 'react'
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useAuth } from '@/auth/AuthProvider'
import { Button } from '@/components/Button'
import { SignInPrompt } from '@/components/SignInPrompt'
import { SkeletonLine } from '@/components/ProductCard'
import { Skeleton } from '@/components/Skeleton'
import { EmptyState, ErrorState } from '@/components/States'
import { deliveryZonesQuery } from '@/checkout/queries'
import { formatKobo } from '@/lib/money'
import { colors, radius, shadow, space, TOUCH, type as t } from '@/theme'
import { CartLineRow } from './CartLineRow'
import { FreeDeliveryProgress } from './FreeDeliveryProgress'
import { cartQuery, MUTATION_KEY, useSetCartItem } from './queries'

/** How often the server cart is re-read while this tab is in front: how web edits show up here. */
const POLL_MS = 3000

export function CartScreen() {
  const insets = useSafeAreaInsets()
  const { status } = useAuth()
  const focused = useIsFocused()
  const saving = useIsMutating({ mutationKey: MUTATION_KEY }) > 0
  const set = useSetCartItem()
  const [notice, setNotice] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  const cart = useQuery({
    ...cartQuery(),
    enabled: status === 'signedIn',
    // Not while a save is running: a refetch started before it would land after it and undo it.
    refetchInterval: focused && !saving ? POLL_MS : false,
  })
  const delivery = useQuery(deliveryZonesQuery())

  // The server says in words what it changed (sold out, lowered to stock). Keep it until dismissed.
  const messages = cart.data?.messages
  const [seenMessages, setSeenMessages] = useState(messages)
  if (messages !== seenMessages) {
    setSeenMessages(messages)
    if (messages && messages.length > 0) setNotice(messages.join(' '))
  }

  const header = (
    <View style={[styles.head, { paddingTop: insets.top + space.lg }]}>
      <Text style={t.h1}>Cart</Text>
    </View>
  )

  if (status !== 'signedIn') {
    return (
      <ScrollView contentContainerStyle={styles.pad}>
        {header}
        <View style={styles.body}>
          <SignInPrompt title="Sign in to start your cart" body="One cart for the app and the website." />
        </View>
      </ScrollView>
    )
  }
  if (cart.isPending) {
    return (
      <View style={styles.screen}>
        {header}
        <View style={styles.body} accessibilityLabel="Loading your cart" accessibilityRole="progressbar">
          {[0, 1].map((i) => (
            <View key={i} style={styles.skRow}>
              <View style={styles.skPhoto}>
                <Skeleton style={{ aspectRatio: 4 / 5, borderRadius: 0 }} />
              </View>
              <View style={{ flex: 1, gap: space.sm }}>
                <SkeletonLine lineHeight={t.eyebrow.lineHeight} width="35%" />
                <SkeletonLine lineHeight={t.h3.lineHeight} width="75%" />
                <SkeletonLine lineHeight={t.small.lineHeight} width="20%" />
                <Skeleton style={{ height: TOUCH, width: 140, borderRadius: radius.pill }} />
              </View>
            </View>
          ))}
        </View>
      </View>
    )
  }
  if (cart.isError && !cart.data) {
    return (
      <View style={styles.screen}>
        {header}
        <ErrorState message={cart.error.message} onRetry={() => void cart.refetch()} />
      </View>
    )
  }

  const { lines, subtotalKobo, itemCount } = cart.data
  const onQuantity = (variantId: string, quantity: number) => {
    setActionError(null)
    set.mutate(
      { variantId, quantity },
      { onError: () => setActionError("We couldn't update your cart. Check your connection and try again.") },
    )
  }

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.pad}
        refreshControl={<RefreshControl refreshing={cart.isRefetching && !saving} onRefresh={() => void cart.refetch()} tintColor={colors.ink} colors={[colors.ink]} />}
      >
        {header}
        <View style={styles.body}>
          {notice ? (
            <View style={styles.notice} accessibilityRole="alert">
              <View style={{ flex: 1 }}>
                <Text style={t.smallStrong}>We updated your cart.</Text>
                <Text style={t.small}>{notice}</Text>
              </View>
              <Pressable onPress={() => setNotice(null)} accessibilityRole="button" accessibilityLabel="Dismiss" hitSlop={12}>
                <Text style={t.smallStrong}>Got it</Text>
              </Pressable>
            </View>
          ) : null}
          {actionError ? <Text style={[t.small, { color: colors.danger }]} accessibilityRole="alert">{actionError}</Text> : null}

          {lines.length === 0 ? (
            <EmptyState
              title="Your cart is empty"
              body="Find a scent that fits your pocket."
              actionLabel="Browse the shop"
              onAction={() => router.navigate('/')}
            />
          ) : (
            lines.map((line) => (
              <CartLineRow key={line.variantId} line={line} onQuantity={(q) => onQuantity(line.variantId, q)} />
            ))
          )}
        </View>
      </ScrollView>

      {lines.length > 0 ? (
        <View style={styles.footer}>
          {delivery.data ? (
            <FreeDeliveryProgress subtotalKobo={subtotalKobo} thresholdKobo={delivery.data.freeDeliveryThresholdKobo} />
          ) : null}
          <View style={styles.subtotal}>
            <Text style={t.body}>Subtotal ({itemCount} {itemCount === 1 ? 'item' : 'items'})</Text>
            <Text style={t.h3}>{formatKobo(subtotalKobo)}</Text>
          </View>
          <Text style={[t.small, { color: colors.muted }]}>Delivery and total are worked out at checkout.</Text>
          <Button label="Checkout" onPress={() => router.push('/checkout')} />
        </View>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  // Same row padding, divider and photo frame as CartLineRow.
  skRow: { flexDirection: 'row', gap: space.md, paddingVertical: space.lg, borderBottomWidth: 1, borderBottomColor: colors.border },
  skPhoto: { width: 84, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, overflow: 'hidden', alignSelf: 'flex-start' },
  screen: { flex: 1, backgroundColor: colors.cream },
  pad: { paddingBottom: space.xl },
  head: { paddingHorizontal: space.lg, paddingBottom: space.sm },
  body: { paddingHorizontal: space.lg, gap: space.md },
  notice: {
    flexDirection: 'row',
    gap: space.md,
    alignItems: 'center',
    padding: space.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'rgba(155, 44, 44, 0.25)',
    backgroundColor: 'rgba(155, 44, 44, 0.06)',
  },
  footer: { padding: space.lg, gap: space.md, backgroundColor: colors.cream, borderTopWidth: 1, borderTopColor: colors.border, ...shadow.md },
  subtotal: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
})
