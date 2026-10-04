import { useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { useAuth } from '@/auth/AuthProvider'
import { colors, radius, space, type as t } from '@/theme'
import { Button } from './Button'

type Props = { title: string; body: string }

/** Shown wherever an account is needed. Google is the only way in. */
export function SignInPrompt({ title, body }: Props) {
  const { signIn } = useAuth()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onPress = async () => {
    setBusy(true)
    setError(null)
    const result = await signIn()
    setBusy(false)
    if (!result.ok && result.reason === 'error') setError(result.message)
  }

  return (
    <View style={styles.card}>
      <Text style={t.h3}>{title}</Text>
      <Text style={[t.body, { color: colors.muted }]}>{body}</Text>
      {error ? <Text style={[t.small, { color: colors.danger }]} accessibilityRole="alert">{error}</Text> : null}
      <Button label="Continue with Google" onPress={() => void onPress()} loading={busy} />
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: space.lg,
    gap: space.md,
  },
})
