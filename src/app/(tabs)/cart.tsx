import { ScrollView, StyleSheet, Text } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useAuth } from '@/auth/AuthProvider'
import { useCart } from '@/cart/queries'
import { SignInPrompt } from '@/components/SignInPrompt'
import { colors, space, type as t } from '@/theme'

export default function Cart() {
  const insets = useSafeAreaInsets()
  const { status } = useAuth()
  const cart = useCart()
  return (
    <ScrollView contentContainerStyle={[styles.content, { paddingTop: insets.top + space.lg }]}>
      <Text style={t.h1}>Cart</Text>
      {status === 'signedIn' ? (
        // M2.5: the real cart (lines, steppers, subtotal, checkout) replaces this note.
        <Text style={[t.body, { color: colors.muted }]}>
          {cart.data ? `${cart.data.itemCount} in your cart.` : 'Loading your cart...'}
        </Text>
      ) : (
        <SignInPrompt title="Sign in to start your cart" body="One cart for the app and the website." />
      )}
    </ScrollView>
  )
}

const styles = StyleSheet.create({ content: { paddingHorizontal: space.lg, gap: space.lg, paddingBottom: space.xxl } })
