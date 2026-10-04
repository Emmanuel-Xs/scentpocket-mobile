import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { api } from '@/api/client'
import { catalogResponseSchema } from '@/api/schemas'
import { useAuth } from '@/auth/AuthProvider'
import { meQuery } from '@/auth/queries'
import { Button } from '@/components/Button'
import { Wordmark } from '@/components/Wordmark'
import { colors, radius, shadow, space, type as t } from '@/theme'

/** M1 test screen: sign in, see /me, see the catalog arrive through the validated client. */
export default function Home() {
  const insets = useSafeAreaInsets()
  const { status, signIn, signOut } = useAuth()
  const [signingIn, setSigningIn] = useState(false)
  const [signInError, setSignInError] = useState<string | null>(null)

  const me = useQuery({ ...meQuery(), enabled: status === 'signedIn' })
  const catalog = useQuery({
    queryKey: ['catalog-check'],
    queryFn: () => api('/catalog', catalogResponseSchema, { auth: false }),
  })

  const onSignIn = async () => {
    setSigningIn(true)
    setSignInError(null)
    const result = await signIn()
    setSigningIn(false)
    if (!result.ok && result.reason === 'error') setSignInError(result.message)
  }

  return (
    <ScrollView
      contentContainerStyle={[styles.content, { paddingTop: insets.top + space.lg, paddingBottom: insets.bottom + space.xl }]}
    >
      <Wordmark />
      <Text style={[t.h1, styles.title]}>A scent for every pocket.</Text>

      <View style={styles.card}>
        <Text style={t.eyebrow}>Catalog</Text>
        {catalog.isPending ? (
          <ActivityIndicator color={colors.ink} />
        ) : catalog.isError ? (
          <>
            <Text style={[t.body, { color: colors.danger }]}>{catalog.error.message}</Text>
            <Button label="Try again" variant="secondary" onPress={() => void catalog.refetch()} />
          </>
        ) : (
          <Text style={t.body}>{catalog.data.total} scents loaded from the shop.</Text>
        )}
      </View>

      {status === 'signedOut' ? (
        <View style={styles.card}>
          <Text style={t.h3}>Sign in to start your cart</Text>
          <Text style={[t.small, { color: colors.muted }]}>
            One cart for the app and the website.
          </Text>
          {signInError ? <Text style={[t.small, { color: colors.danger }]}>{signInError}</Text> : null}
          <Button label="Continue with Google" onPress={() => void onSignIn()} loading={signingIn} />
        </View>
      ) : (
        <View style={styles.card}>
          <Text style={t.eyebrow}>Signed in</Text>
          {me.isPending ? (
            <ActivityIndicator color={colors.ink} />
          ) : me.isError ? (
            <>
              <Text style={[t.body, { color: colors.danger }]}>{me.error.message}</Text>
              <Button label="Try again" variant="secondary" onPress={() => void me.refetch()} />
            </>
          ) : (
            <>
              <Text style={t.h3}>{me.data.name ?? 'Welcome'}</Text>
              <Text style={t.body}>{me.data.email}</Text>
              <Text style={[t.small, { color: colors.muted }]}>Role: {me.data.role}</Text>
            </>
          )}
          <Button label="Sign out" variant="secondary" onPress={() => void signOut()} />
        </View>
      )}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: space.lg, gap: space.lg },
  title: { marginTop: space.sm },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: space.lg,
    gap: space.md,
    ...shadow.sm,
  },
})
