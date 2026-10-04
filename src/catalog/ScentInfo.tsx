import { StyleSheet, Text, View } from 'react-native'
import type { ProductDetail } from '@/api/schemas'
import { colors, radius, space, type as t } from '@/theme'
import { familyLabels, genderLabels, longevityInfo, occasionLabels, projectionInfo } from './labels'

function Notes({ title, notes }: { title: string; notes: string[] }) {
  if (notes.length === 0) return null
  return (
    <View style={styles.noteRow}>
      <Text style={[t.eyebrow, { color: colors.muted, width: 56 }]}>{title}</Text>
      <Text style={[t.body, { flex: 1 }]}>{notes.join(', ')}</Text>
    </View>
  )
}

function Meter({ label, value, level, max }: { label: string; value: string; level: number; max: number }) {
  return (
    <View style={{ gap: 6 }} accessible accessibilityLabel={`${label}: ${value}`}>
      <View style={styles.meterHead}>
        <Text style={[t.eyebrow, { color: colors.muted }]}>{label}</Text>
        <Text style={t.small}>{value}</Text>
      </View>
      <View style={styles.bars}>
        {Array.from({ length: max }, (_, i) => (
          <View key={i} style={[styles.bar, i < level && { backgroundColor: colors.ink }]} />
        ))}
      </View>
    </View>
  )
}

export function ScentInfo({ product }: { product: ProductDetail }) {
  const { card } = product
  const long = longevityInfo[product.longevity]
  const proj = projectionInfo[product.projection]
  const chips = [familyLabels[card.family], genderLabels[card.gender], ...card.occasions.map((o) => occasionLabels[o])]
  return (
    <View style={{ gap: space.xl }}>
      <Text style={[t.body, { color: colors.text2 }]}>{product.description}</Text>
      <View style={styles.box}>
        <Text style={t.h3}>What it smells like</Text>
        <Notes title="Top" notes={product.topNotes} />
        <Notes title="Heart" notes={product.heartNotes} />
        <Notes title="Base" notes={product.baseNotes} />
      </View>
      <View style={styles.box}>
        <Meter label="Longevity" value={long.label} level={long.level} max={4} />
        <Meter label="Projection" value={proj.label} level={proj.level} max={3} />
      </View>
      <View style={styles.chips}>
        {chips.map((c) => (
          <Text key={c} style={[t.smallStrong, styles.chip]}>{c}</Text>
        ))}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  box: { backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: space.lg, gap: space.md },
  noteRow: { flexDirection: 'row', gap: space.md },
  meterHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  bars: { flexDirection: 'row', gap: 6 },
  bar: { flex: 1, height: 6, borderRadius: radius.pill, backgroundColor: colors.border },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: radius.pill, backgroundColor: colors.blush, overflow: 'hidden' },
})
