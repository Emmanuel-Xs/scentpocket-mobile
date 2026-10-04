import { Pressable, StyleSheet, Text } from 'react-native'
import { colors, PRESSED_SCALE, radius, TOUCH, type as t } from '@/theme'

type Props = { label: string; selected?: boolean; onPress: () => void; accent?: string }

/** A selectable chip (tier filter, sort). */
export function Pill({ label, selected, onPress, accent = colors.ink }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: !!selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.pill,
        selected ? { backgroundColor: accent, borderColor: accent } : null,
        pressed && { transform: [{ scale: PRESSED_SCALE }] },
      ]}
    >
      <Text style={[t.smallStrong, { color: selected ? colors.white : colors.ink }]}>{label}</Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  pill: {
    minHeight: TOUCH - 8,
    paddingHorizontal: 16,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
