import { Pressable, StyleSheet, Text, View } from 'react-native'
import type { DeliveryZoneId, DeliveryZones } from '@/api/schemas'
import { formatKobo } from '@/lib/money'
import { colors, PRESSED_SCALE, radius, space, type as t } from '@/theme'
import { isLagos, isLagosZone, previewDeliveryFeeKobo } from './validation'

type Props = {
  zones: DeliveryZones
  selected: DeliveryZoneId | null
  onSelect: (zone: DeliveryZoneId) => void
  /** The chosen state: Lagos allows the two Lagos zones, anywhere else only Outside Lagos. */
  state: string
  subtotalKobo: number
  error?: string
}

/** Delivery zone radio cards with fee and ETA. A zone that does not fit the state is greyed out. */
export function ZoneCards({ zones, selected, onSelect, state, subtotalKobo, error }: Props) {
  return (
    <View style={{ gap: space.sm }} accessibilityRole="radiogroup" accessibilityLabel="Delivery zone">
      {zones.zones.map((zone) => {
        const disabled = !!state && isLagos(state) !== isLagosZone(zone.id)
        const checked = selected === zone.id
        const fee = previewDeliveryFeeKobo(zone.feeKobo, subtotalKobo, zones.freeDeliveryThresholdKobo)
        return (
          <Pressable
            key={zone.id}
            accessibilityRole="radio"
            accessibilityLabel={`${zone.label}, ${fee === 0 ? 'free' : formatKobo(fee)}, ${zone.eta}`}
            accessibilityState={{ checked, disabled }}
            disabled={disabled}
            onPress={() => onSelect(zone.id)}
            style={({ pressed }) => [
              styles.card,
              checked && styles.checked,
              disabled && styles.disabled,
              pressed && { transform: [{ scale: PRESSED_SCALE }] },
            ]}
          >
            <View style={[styles.radio, checked && { borderColor: colors.ink }]}>{checked ? <View style={styles.dot} /> : null}</View>
            <View style={{ flex: 1 }}>
              <Text style={t.bodyStrong}>{zone.label}</Text>
              <Text style={[t.small, { color: colors.muted }]}>{zone.eta}</Text>
            </View>
            <Text style={[t.bodyStrong, fee === 0 && { color: colors.success }]}>{fee === 0 ? 'Free' : formatKobo(fee)}</Text>
          </Pressable>
        )
      })}
      {error ? <Text style={[t.small, { color: colors.danger }]} accessibilityRole="alert">{error}</Text> : null}
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    paddingHorizontal: space.lg,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surface,
  },
  checked: { borderColor: colors.ink, borderWidth: 2 },
  disabled: { opacity: 0.45, backgroundColor: colors.cream },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 1.5, borderColor: colors.borderStrong, alignItems: 'center', justifyContent: 'center' },
  dot: { width: 12, height: 12, borderRadius: 6, backgroundColor: colors.ink },
})
