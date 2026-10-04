import { StyleSheet, Text, View } from 'react-native'
import type { Tier } from '@/api/schemas'
import { colors, radius, tiers, type as t } from '@/theme'

export function TierChip({ tier }: { tier: Tier }) {
  return (
    <View style={[styles.chip, { backgroundColor: tiers[tier].color }]}>
      <Text style={[t.caption, { color: colors.white }]}>{tiers[tier].label}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  chip: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.pill, alignSelf: 'flex-start' },
})
