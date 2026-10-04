import { StyleSheet, Text, View } from 'react-native'
import { colors, radius, space, type as t } from '@/theme'

/** Shown after a 409: which lines fell short. The cart has already been refreshed. */
export function StockConflict({ lines }: { lines: string[] }) {
  return (
    <View style={styles.box} accessibilityRole="alert">
      <Text style={t.bodyStrong}>Someone got there first</Text>
      {lines.map((line) => (
        <Text key={line} style={t.small}>{line}</Text>
      ))}
      <Text style={[t.small, { color: colors.text2 }]}>
        We updated your cart and nothing was ordered. Check the total and place your order again.
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  box: {
    gap: 4,
    padding: space.lg,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'rgba(155, 44, 44, 0.25)',
    backgroundColor: 'rgba(155, 44, 44, 0.06)',
  },
})
