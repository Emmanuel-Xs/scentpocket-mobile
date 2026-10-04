import { useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { useAuth } from '@/auth/AuthProvider'
import { useAuthTrace } from '@/auth/debug'
import { colors, radius, space, type as t } from '@/theme'
import { Button } from './Button'

type Props = { title: string; body: string }

/** Shown wherever an account is needed. Google is the only way in. */
export function SignInPrompt({ title, body }: Props) {
  const { signIn } = useAuth()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const trail = useAuthTrace()

  const onPress = async () => {
    setBusy(true)
    setError(null)
    const result = await signIn()
    setBusy(false)
    // Say so when it did not finish, but only after giving a late redirect a moment to complete it.
    if (!result.ok) setError(result.message)
  }

  return (
    <View style={styles.card}>
      <Text style={t.h3}>{title}</Text>
      <Text style={[t.body, { color: colors.muted }]}>{body}</Text>
      {error ? (
        <Text style={[t.small, { color: colors.danger }]} accessibilityRole="alert">
          {error}
        </Text>
      ) : null}
      {__DEV__ && trail.length > 0 ? (
        <Text style={[t.caption, styles.trail]} selectable>{`Sign in trail (dev build):\n${trail.join('\n')}`}</Text>
      ) : null}
      <Button label="Continue with Google" onPress={() => void onPress()} loading={busy} />
    </View>
  )
}

const styles = StyleSheet.create({
  trail: { color: colors.muted, backgroundColor: colors.blush, padding: space.sm, borderRadius: radius.sm },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: space.lg,
    gap: space.md,
  },
})
