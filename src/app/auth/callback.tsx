import { router, useLocalSearchParams } from 'expo-router'
import { useEffect, useState } from 'react'
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native'
import { completeSignIn } from '@/auth/complete'
import { Button } from '@/components/Button'
import { colors, space, type as t } from '@/theme'

/**
 * `scentpocket://auth/callback?code=...` lands here when Android hands the Google redirect to the
 * router (it can do that as well as to the browser session). It finishes sign in and goes back.
 */
export default function AuthCallback() {
  const { code, error_description: errorDescription, error } = useLocalSearchParams<{
    code?: string
    error_description?: string
    error?: string
  }>()
  const [failure, setFailure] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    void completeSignIn({ code, error: errorDescription ?? error }).then((result) => {
      if (cancelled) return
      if (result.ok) {
        if (router.canGoBack()) router.back()
        else router.replace('/')
      } else {
        setFailure(result.message)
      }
    })
    return () => {
      cancelled = true
    }
  }, [code, errorDescription, error])

  return (
    <View style={styles.screen}>
      {failure ? (
        <>
          <Text style={[t.h2, styles.center]}>We could not sign you in</Text>
          <Text style={[t.body, styles.center, { color: colors.muted }]}>{failure}</Text>
          <Button label="Back to the shop" onPress={() => router.replace('/')} />
        </>
      ) : (
        <>
          <ActivityIndicator color={colors.ink} size="large" />
          <Text style={[t.body, { color: colors.muted }]}>Signing you in...</Text>
        </>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.cream, alignItems: 'center', justifyContent: 'center', padding: space.xl, gap: space.lg },
  center: { textAlign: 'center' },
})
