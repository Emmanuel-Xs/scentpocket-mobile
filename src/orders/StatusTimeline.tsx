import { StyleSheet, Text, View } from 'react-native'
import type { Order, OrderStatus } from '@/api/order-schemas'
import { formatDateTime } from '@/lib/dates'
import { colors, space, type as t } from '@/theme'

type Step = { label: string; at: string | null; done: boolean; bad?: boolean }

const FLOW: OrderStatus[] = ['placed', 'confirmed', 'shipped', 'delivered']

function stepsFor(order: Order): Step[] {
  if (order.status === 'cancelled') {
    return [
      { label: 'Order placed', at: order.createdAt, done: true },
      { label: 'Cancelled', at: order.cancelledAt, done: true, bad: true },
    ]
  }
  const reached = FLOW.indexOf(order.status)
  const stamps = [order.createdAt, order.confirmedAt, order.shippedAt, order.deliveredAt]
  const labels = ['Order placed', 'Confirmed', 'Out for delivery', 'Delivered']
  return FLOW.map((_, i) => ({ label: labels[i] ?? '', at: stamps[i] ?? null, done: i <= reached }))
}

/** Placed -> confirmed -> shipped -> delivered, with the time each step happened. */
export function StatusTimeline({ order }: { order: Order }) {
  const steps = stepsFor(order)
  return (
    <View accessibilityRole="list" accessibilityLabel="Order progress">
      {steps.map((step, i) => (
        <View
          key={step.label}
          style={styles.row}
          accessible
          accessibilityLabel={`${step.label}${step.done ? ', done' : ', waiting'}${step.at ? `, ${formatDateTime(step.at)}` : ''}`}
        >
          <View style={styles.rail}>
            <View
              style={[
                styles.dot,
                step.done && {
                  backgroundColor: step.bad ? colors.danger : colors.ink,
                  borderColor: step.bad ? colors.danger : colors.ink,
                },
              ]}
            />
            {i < steps.length - 1 ? (
              <View style={[styles.line, step.done && steps[i + 1]?.done && { backgroundColor: colors.ink }]} />
            ) : null}
          </View>
          <View style={styles.text}>
            <Text
              style={[t.bodyStrong, !step.done && { color: colors.disabled }, step.bad && { color: colors.danger }]}
            >
              {step.label}
            </Text>
            {step.at ? <Text style={[t.small, { color: colors.muted }]}>{formatDateTime(step.at)}</Text> : null}
          </View>
        </View>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: space.md, minHeight: 56 },
  rail: { alignItems: 'center', width: 16 },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: colors.borderStrong,
    backgroundColor: colors.cream,
    marginTop: 4,
  },
  line: { flex: 1, width: 2, backgroundColor: colors.border, marginVertical: 2 },
  text: { flex: 1, paddingBottom: space.md },
})
