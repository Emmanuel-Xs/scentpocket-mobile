import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native'
import type { StyleProp, ViewStyle } from 'react-native'
import { colors, PRESSED_SCALE, radius, TOUCH, type as t } from '@/theme'

type Props = {
  label: string
  onPress: () => void
  variant?: 'primary' | 'secondary'
  loading?: boolean
  disabled?: boolean
  style?: StyleProp<ViewStyle>
}

/** Pill button with press feedback, a spinner while loading, and a disabled look. */
export function Button({ label, onPress, variant = 'primary', loading, disabled, style }: Props) {
  const inactive = disabled || loading
  const primary = variant === 'primary'
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!inactive, busy: !!loading }}
      disabled={inactive}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        primary ? styles.primary : styles.secondary,
        inactive && styles.inactive,
        pressed && { transform: [{ scale: PRESSED_SCALE }], opacity: 0.92 },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={primary ? colors.cream : colors.ink} />
      ) : (
        <Text style={[t.bodyStrong, { color: primary ? colors.cream : colors.ink }]}>{label}</Text>
      )}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  base: {
    minHeight: TOUCH + 4,
    paddingHorizontal: 24,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: { backgroundColor: colors.ink },
  secondary: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.borderStrong },
  inactive: { opacity: 0.5 },
})
