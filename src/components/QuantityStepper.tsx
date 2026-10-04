import { Pressable, StyleSheet, Text, View } from 'react-native'
import { colors, PRESSED_SCALE, radius, TOUCH, type as t } from '@/theme'

type Props = { value: number; min?: number; max: number; onChange: (value: number) => void; disabled?: boolean }

/** − 2 +, stops at min and max (max is min(stock, 10)). */
export function QuantityStepper({ value, min = 1, max, onChange, disabled }: Props) {
  const down = disabled || value <= min
  const up = disabled || value >= max
  return (
    <View style={styles.row} accessibilityRole="adjustable" accessibilityLabel="Quantity" accessibilityValue={{ now: value, min, max }}>
      <Step label="−" a11y="Decrease" disabled={down} onPress={() => onChange(value - 1)} />
      <Text style={[t.bodyStrong, styles.value]} accessibilityLiveRegion="polite">{value}</Text>
      <Step label="+" a11y="Increase" disabled={up} onPress={() => onChange(value + 1)} />
    </View>
  )
}

function Step({ label, a11y, disabled, onPress }: { label: string; a11y: string; disabled: boolean; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={a11y}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      hitSlop={4}
      style={({ pressed }) => [styles.step, disabled && { opacity: 0.35 }, pressed && { transform: [{ scale: PRESSED_SCALE }], backgroundColor: colors.blush }]}
    >
      <Text style={[t.h3, { color: colors.ink }]}>{label}</Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surface,
  },
  step: { width: TOUCH, height: TOUCH, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
  value: { minWidth: 28, textAlign: 'center' },
})
