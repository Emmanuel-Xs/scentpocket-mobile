import { StyleSheet, Text, View } from 'react-native'
import { formatKobo } from '@/lib/money'
import { colors, radius, type as t } from '@/theme'

type Props = { subtotalKobo: number; thresholdKobo: number }

/** "₦X away from free delivery" with a bar, or the good news once it is reached. */
export function FreeDeliveryProgress({ subtotalKobo, thresholdKobo }: Props) {
  const remaining = Math.max(0, thresholdKobo - subtotalKobo)
  const reached = remaining === 0
  const ratio = Math.min(1, subtotalKobo / thresholdKobo)
  return (
    <View style={{ gap: 6 }}>
      <Text style={[t.small, { color: reached ? colors.success : colors.text2 }]}>
        {reached ? 'You get free delivery.' : `${formatKobo(remaining)} away from free delivery`}
      </Text>
      <View
        style={styles.track}
        accessibilityRole="progressbar"
        accessibilityLabel="Progress to free delivery"
        accessibilityValue={{ min: 0, max: 100, now: Math.round(ratio * 100) }}
      >
        <View style={[styles.fill, { width: `${ratio * 100}%`, backgroundColor: reached ? colors.success : colors.ink }]} />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  track: { height: 6, borderRadius: radius.pill, backgroundColor: colors.border, overflow: 'hidden' },
  fill: { height: 6, borderRadius: radius.pill },
})
