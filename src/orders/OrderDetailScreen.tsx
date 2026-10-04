import { useQuery } from '@tanstack/react-query'
import { router } from 'expo-router'
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native'
import type { Order } from '@/api/order-schemas'
import { ApiError } from '@/api/client'
import { useAuth } from '@/auth/AuthProvider'
import { BackHeader } from '@/components/BackHeader'
import { ProductImage } from '@/components/ProductImage'
import { SignInPrompt } from '@/components/SignInPrompt'
import { Skeleton } from '@/components/Skeleton'
import { EmptyState, ErrorState } from '@/components/States'
import { deliveryZonesQuery } from '@/checkout/queries'
import { formatDateTime } from '@/lib/dates'
import { formatKobo } from '@/lib/money'
import { colors, radius, space, type as t } from '@/theme'
import { orderQuery } from './queries'
import { StatusBadge } from './StatusBadge'
import { StatusTimeline } from './StatusTimeline'

const BACK = '/orders' as const

export function OrderDetailScreen({ orderRef, placed }: { orderRef: string; placed: boolean }) {
  const { status } = useAuth()
  const order = useQuery({ ...orderQuery(orderRef), enabled: status === 'signedIn' })
  const zones = useQuery(deliveryZonesQuery())

  if (status !== 'signedIn') {
    return (
      <View style={styles.screen}>
        <BackHeader title="Order" fallback={BACK} />
        <View style={styles.pad}>
          <SignInPrompt title="Sign in to see this order" body="Orders belong to your Google account." />
        </View>
      </View>
    )
  }
  if (order.isPending) {
    return (
      <View style={styles.screen}>
        <BackHeader title="Order" fallback={BACK} />
        <View style={styles.pad} accessibilityLabel="Loading your order" accessibilityRole="progressbar">
          <Skeleton style={{ height: 28, width: '50%' }} />
          <Skeleton style={{ height: 120 }} />
          <Skeleton style={{ height: 160 }} />
        </View>
      </View>
    )
  }
  if (order.isError) {
    const missing = order.error instanceof ApiError && order.error.status === 404
    return (
      <View style={styles.screen}>
        <BackHeader title="Order" fallback={BACK} />
        {missing ? (
          <EmptyState title="We could not find that order" body="Check the reference, or look in your orders." actionLabel="Back to the shop" onAction={() => router.replace('/')} />
        ) : (
          <ErrorState message={order.error.message} onRetry={() => void order.refetch()} />
        )}
      </View>
    )
  }

  const o = order.data
  const zoneLabel = zones.data?.zones.find((z) => z.id === o.deliveryZone)?.label
  return (
    <View style={styles.screen}>
      <BackHeader title={placed ? undefined : 'Order'} fallback={BACK} />
      <ScrollView
        contentContainerStyle={styles.pad}
        refreshControl={<RefreshControl refreshing={order.isRefetching} onRefresh={() => void order.refetch()} tintColor={colors.ink} colors={[colors.ink]} />}
      >
        {placed ? <ThankYou order={o} /> : null}
        <View style={{ gap: space.sm }}>
          <Text style={t.h2}>{o.ref}</Text>
          <StatusBadge status={o.status} />
          <Text style={[t.small, { color: colors.muted }]}>Placed {formatDateTime(o.createdAt)}</Text>
        </View>

        <Card title="Progress">
          <StatusTimeline order={o} />
        </Card>
        <Card title="Items">
          {o.items.map((item) => (
            <View key={item.id} style={styles.item}>
              <View style={styles.photo}>
                <ProductImage image={item.image} aspectRatio={4 / 5} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={t.bodyStrong} numberOfLines={2}>{item.productName}</Text>
                <Text style={[t.small, { color: colors.muted }]}>{item.variantLabel}</Text>
                <Text style={[t.small, { color: colors.muted }]}>{item.qty} × {formatKobo(item.unitPriceKobo)}</Text>
              </View>
              <Text style={t.bodyStrong}>{formatKobo(item.lineTotalKobo)}</Text>
            </View>
          ))}
        </Card>
        <Card title="Delivery">
          <Text style={t.body}>{o.customerName}</Text>
          <Text style={t.body}>{o.phone}</Text>
          <Text style={t.body}>{o.addressLine}, {o.city}, {o.state}</Text>
          {zoneLabel ? <Text style={[t.small, { color: colors.muted }]}>{zoneLabel}</Text> : null}
        </Card>
        <Card title="Payment">
          <Text style={t.body}>{o.paymentMethod === 'pay_on_delivery' ? 'Pay on delivery' : 'Paystack'}</Text>
          <Row label="Subtotal" value={formatKobo(o.subtotalKobo)} />
          <Row label="Delivery" value={o.deliveryFeeKobo === 0 ? 'Free' : formatKobo(o.deliveryFeeKobo)} />
          <Row label="Total" value={formatKobo(o.totalKobo)} strong />
        </Card>
      </ScrollView>
    </View>
  )
}

function ThankYou({ order }: { order: Order }) {
  const first = order.customerName.trim().split(/\s+/)[0] ?? ''
  return (
    <View style={styles.thanks} accessibilityRole="alert">
      <Text style={t.h2}>Thank you{first ? `, ${first}` : ''}.</Text>
      <Text style={t.body}>Your order is in. We will email a confirmation to {order.email}.</Text>
    </View>
  )
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.card}>
      <Text style={[t.eyebrow, { color: colors.muted }]}>{title}</Text>
      {children}
    </View>
  )
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <View style={styles.row}>
      <Text style={strong ? t.bodyStrong : t.body}>{label}</Text>
      <Text style={strong ? t.h3 : t.body}>{value}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.cream },
  pad: { padding: space.lg, gap: space.lg, paddingBottom: space.xxl },
  thanks: { gap: 4, padding: space.lg, borderRadius: radius.lg, backgroundColor: 'rgba(47, 107, 79, 0.1)', borderWidth: 1, borderColor: 'rgba(47, 107, 79, 0.3)' },
  card: { gap: space.sm, padding: space.lg, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  item: { flexDirection: 'row', alignItems: 'center', gap: space.md, paddingVertical: space.xs },
  photo: { width: 56, borderRadius: radius.sm, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
})
