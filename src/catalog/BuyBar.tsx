import { router } from 'expo-router'
import { useEffect, useState } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import type { ProductDetail, Variant } from '@/api/schemas'
import { useAuth } from '@/auth/AuthProvider'
import { useAddToCart } from '@/cart/queries'
import { Button } from '@/components/Button'
import { SignInSheet } from '@/components/SignInSheet'
import { formatKobo } from '@/lib/money'
import { colors, PRESSED_SCALE, radius, shadow, space, type as t } from '@/theme'

type Props = { product: ProductDetail; variant: Variant; qty: number }

/** Sticky bottom bar: total + Add to cart. Needs an account, so signed out asks to sign in first. */
export function BuyBar({ product, variant, qty }: Props) {
  const insets = useSafeAreaInsets()
  const { status } = useAuth()
  const addToCart = useAddToCart()
  const [sheet, setSheet] = useState(false)
  const [adding, setAdding] = useState(false)
  const [added, setAdded] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const soldOut = variant.stock <= 0

  useEffect(() => {
    if (added === null) return
    const id = setTimeout(() => setAdded(null), 4000)
    return () => clearTimeout(id)
  }, [added])

  const onPress = async () => {
    if (status !== 'signedIn') {
      setSheet(true)
      return
    }
    setAdding(true)
    setError(null)
    try {
      setAdded(await addToCart(variant.id, qty, variant.stock))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'We could not add that. Please try again.')
    } finally {
      setAdding(false)
    }
  }

  return (
    <>
      <View style={[styles.bar, { paddingBottom: insets.bottom + space.md }]}>
        {added !== null ? (
          <Pressable
            onPress={() => router.navigate('/cart')}
            accessibilityRole="button"
            style={({ pressed }) => [styles.toast, pressed && { opacity: 0.85, transform: [{ scale: PRESSED_SCALE }] }]}
          >
            <Text style={[t.smallStrong, { color: colors.cream }]}>Added. {added} in your cart. View cart</Text>
          </Pressable>
        ) : null}
        {error ? (
          <Text style={[t.small, { color: colors.danger }]} accessibilityRole="alert">
            {error}
          </Text>
        ) : null}
        <View style={styles.row}>
          <View>
            <Text style={[t.caption, { color: colors.muted }]} numberOfLines={1}>
              {variant.sizeMl}ml × {qty}
            </Text>
            <Text style={t.h3}>{formatKobo(variant.priceKobo * qty)}</Text>
          </View>
          <Button
            label={soldOut ? 'Sold out' : 'Add to cart'}
            disabled={soldOut}
            loading={adding}
            onPress={() => void onPress()}
            style={{ flex: 1 }}
          />
        </View>
      </View>
      <SignInSheet
        visible={sheet}
        onClose={() => setSheet(false)}
        title={`Sign in to add ${product.card.name}`}
        body="Your cart is saved to your account, so it is the same in the app and on the website."
      />
    </>
  )
}

const styles = StyleSheet.create({
  bar: {
    backgroundColor: colors.cream,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingHorizontal: space.lg,
    paddingTop: space.md,
    gap: space.sm,
    ...shadow.md,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.lg },
  toast: { backgroundColor: colors.ink, borderRadius: radius.pill, paddingVertical: space.md, alignItems: 'center' },
})
