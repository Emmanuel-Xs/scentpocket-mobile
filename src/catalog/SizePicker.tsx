import { Pressable, StyleSheet, Text, View } from 'react-native'
import type { Variant } from '@/api/schemas'
import { formatKobo } from '@/lib/money'
import { colors, PRESSED_SCALE, radius, space, TOUCH, type as t } from '@/theme'

type Props = { variants: Variant[]; selectedId: string; onSelect: (id: string) => void }

/** Radio buttons for sizes. Sold out sizes are struck through and cannot be chosen. */
export function SizePicker({ variants, selectedId, onSelect }: Props) {
  return (
    <View accessibilityRole="radiogroup" accessibilityLabel="Size" style={styles.group}>
      {variants.map((v) => {
        const soldOut = v.stock <= 0
        const selected = v.id === selectedId
        return (
          <Pressable
            key={v.id}
            accessibilityRole="radio"
            accessibilityLabel={`${v.label}, ${formatKobo(v.priceKobo)}${soldOut ? ', sold out' : ''}`}
            accessibilityState={{ checked: selected, disabled: soldOut }}
            disabled={soldOut}
            onPress={() => onSelect(v.id)}
            style={({ pressed }) => [
              styles.option,
              selected && styles.selected,
              soldOut && styles.soldOut,
              pressed && { transform: [{ scale: PRESSED_SCALE }] },
            ]}
          >
            <View style={[styles.radio, selected && styles.radioOn]}>{selected ? <View style={styles.dot} /> : null}</View>
            <Text style={[t.bodyStrong, styles.label, soldOut && styles.struck]} numberOfLines={2}>
              {v.label}
            </Text>
            <Text style={[t.bodyStrong, soldOut && styles.struck]}>{formatKobo(v.priceKobo)}</Text>
            {soldOut ? <Text style={[t.caption, { color: colors.muted }]}>Sold out</Text> : null}
          </Pressable>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  group: { gap: space.sm },
  option: {
    minHeight: TOUCH + 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    paddingHorizontal: space.lg,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surface,
  },
  selected: { borderColor: colors.ink, borderWidth: 2 },
  soldOut: { borderStyle: 'dashed', backgroundColor: colors.cream },
  label: { flex: 1 },
  struck: { textDecorationLine: 'line-through', color: colors.disabled },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 1.5, borderColor: colors.borderStrong, alignItems: 'center', justifyContent: 'center' },
  radioOn: { borderColor: colors.ink },
  dot: { width: 12, height: 12, borderRadius: 6, backgroundColor: colors.ink },
})
