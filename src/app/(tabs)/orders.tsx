import { ScrollView, StyleSheet, Text } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useAuth } from '@/auth/AuthProvider'
import { SignInPrompt } from '@/components/SignInPrompt'
import { ProfileCard } from '@/orders/ProfileCard'
import { colors, space, type as t } from '@/theme'

export default function Orders() {
  const insets = useSafeAreaInsets()
  const { status } = useAuth()
  return (
    <ScrollView contentContainerStyle={[styles.content, { paddingTop: insets.top + space.lg }]}>
      <Text style={t.h1}>Orders</Text>
      {status === 'signedIn' ? (
        <>
          <ProfileCard />
          {/* M2.7: the orders list replaces this note. */}
          <Text style={[t.body, { color: colors.muted }]}>Your orders will show here.</Text>
        </>
      ) : (
        <SignInPrompt title="Sign in to see your orders" body="Your orders and cart follow your Google account, in the app and on the website." />
      )}
    </ScrollView>
  )
}

const styles = StyleSheet.create({ content: { paddingHorizontal: space.lg, gap: space.lg, paddingBottom: space.xxl } })
