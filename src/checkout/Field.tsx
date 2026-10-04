import { StyleSheet, Text, TextInput, View } from 'react-native'
import type { TextInputProps } from 'react-native'
import { colors, radius, space, TOUCH, type as t } from '@/theme'

type Props = Omit<TextInputProps, 'style'> & {
  label: string
  error?: string
  /** Shown but not editable (the email comes from your Google account). */
  readOnly?: boolean
  /** Fixed text before the input, like +234. */
  prefix?: string
  hint?: string
}

/** Labelled text input with an inline error. */
export function Field({ label, error, readOnly, prefix, hint, ...input }: Props) {
  return (
    <View style={styles.wrap}>
      <Text style={[t.smallStrong, { color: colors.text2 }]}>{label}</Text>
      <View style={[styles.box, readOnly && styles.readOnly, !!error && styles.errorBox]}>
        {prefix ? <Text style={[t.body, styles.prefix]}>{prefix}</Text> : null}
        <TextInput
          {...input}
          editable={!readOnly}
          accessibilityLabel={label}
          placeholderTextColor={colors.disabled}
          style={[t.body, styles.input, readOnly && { color: colors.muted }]}
        />
      </View>
      {error ? (
        <Text style={[t.small, { color: colors.danger }]} accessibilityRole="alert">{error}</Text>
      ) : hint ? (
        <Text style={[t.small, { color: colors.muted }]}>{hint}</Text>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: { gap: 6 },
  box: {
    minHeight: TOUCH + 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    paddingHorizontal: space.lg,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surface,
  },
  readOnly: { backgroundColor: colors.blush, borderColor: colors.border },
  errorBox: { borderColor: colors.danger, borderWidth: 1.5 },
  prefix: { color: colors.text2 },
  input: { flex: 1, color: colors.ink, paddingVertical: 0 },
})
