import { StyleSheet, Text, View } from 'react-native'
import { colors, space, type as t } from '@/theme'
import { Button } from './Button'

type EmptyProps = { title: string; body?: string; actionLabel?: string; onAction?: () => void }

/** Nothing here (yet): says why, and offers a way forward. */
export function EmptyState({ title, body, actionLabel, onAction }: EmptyProps) {
  return (
    <View style={styles.box}>
      <Text style={[t.h3, styles.center]}>{title}</Text>
      {body ? <Text style={[t.body, styles.center, { color: colors.muted }]}>{body}</Text> : null}
      {actionLabel && onAction ? <Button label={actionLabel} variant="secondary" onPress={onAction} /> : null}
    </View>
  )
}

/** Something failed: a plain message and a retry. */
export function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <View style={styles.box} accessibilityRole="alert">
      <Text style={[t.h3, styles.center]}>That did not work</Text>
      <Text style={[t.body, styles.center, { color: colors.muted }]}>{message}</Text>
      <Button label="Try again" onPress={onRetry} />
    </View>
  )
}

const styles = StyleSheet.create({
  box: { alignItems: 'center', justifyContent: 'center', gap: space.md, padding: space.xl, paddingVertical: space.xxxl },
  center: { textAlign: 'center' },
})
