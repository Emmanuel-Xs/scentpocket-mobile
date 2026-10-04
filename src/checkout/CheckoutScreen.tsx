import { useQuery } from '@tanstack/react-query'
import { router } from 'expo-router'
import { useRef, useState } from 'react'
import { ScrollView, StyleSheet, Text, View } from 'react-native'
import type { LayoutChangeEvent } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useAuth } from '@/auth/AuthProvider'
import { meQuery } from '@/auth/queries'
import { useCart } from '@/cart/queries'
import { BackHeader } from '@/components/BackHeader'
import { Button } from '@/components/Button'
import { SignInPrompt } from '@/components/SignInPrompt'
import { Skeleton } from '@/components/Skeleton'
import { EmptyState, ErrorState } from '@/components/States'
import { formatKobo } from '@/lib/money'
import { colors, radius, shadow, space, type as t } from '@/theme'
import { Field } from './Field'
import { OrderSummary } from './OrderSummary'
import { deliveryZonesQuery } from './queries'
import { StatePicker } from './StatePicker'
import { StockConflict } from './StockConflict'
import { useCheckout } from './useCheckout'
import { isLagos, previewDeliveryFeeKobo } from './validation'
import type { DeliveryForm } from './validation'
import { ZoneCards } from './ZoneCards'

type Section = 'contact' | 'delivery' | 'zone'
const SECTION_OF: Record<keyof DeliveryForm, Section> = {
  fullName: 'contact',
  phone: 'contact',
  addressLine: 'delivery',
  city: 'delivery',
  state: 'delivery',
  deliveryZone: 'zone',
}

const EMPTY: DeliveryForm = { fullName: '', phone: '', addressLine: '', city: '', state: '', deliveryZone: null }

function Heading({ children }: { children: string }) {
  return <Text style={t.h3}>{children}</Text>
}

export function CheckoutScreen() {
  const insets = useSafeAreaInsets()
  const { status } = useAuth()
  const me = useQuery({ ...meQuery(), enabled: status === 'signedIn' })
  const cart = useCart()
  const zones = useQuery(deliveryZonesQuery())
  const checkout = useCheckout()

  const [form, setForm] = useState<DeliveryForm>(EMPTY)
  const [prefilled, setPrefilled] = useState(false)
  const scroll = useRef<ScrollView>(null)
  const [sectionY, setSectionY] = useState<Partial<Record<Section, number>>>({})

  // Start with the name on the Google account; the customer can change it.
  if (!prefilled && me.data) {
    setPrefilled(true)
    setForm((f) => ({ ...f, fullName: f.fullName || me.data.name || '' }))
  }

  const update = <K extends keyof DeliveryForm>(key: K, value: DeliveryForm[K]) => {
    setForm((f) => ({ ...f, [key]: value }))
    if (checkout.errors[key]) checkout.setErrors((e) => ({ ...e, [key]: undefined }))
  }
  // Lagos has two zones to pick from; any other state is always Outside Lagos.
  const chooseState = (state: string) =>
    setForm((f) => ({
      ...f,
      state,
      deliveryZone: isLagos(state) ? (f.deliveryZone === 'outside_lagos' ? null : f.deliveryZone) : 'outside_lagos',
    }))
  const mark = (section: Section) => (e: LayoutChangeEvent) => {
    const y = e.nativeEvent.layout.y
    setSectionY((prev) => (prev[section] === y ? prev : { ...prev, [section]: y }))
  }

  if (status !== 'signedIn') {
    return (
      <View style={styles.screen}>
        <BackHeader title="Checkout" />
        <View style={styles.pad}>
          <SignInPrompt title="Sign in to check out" body="Your cart is saved to your account." />
        </View>
      </View>
    )
  }
  if (cart.isPending || zones.isPending || me.isPending) {
    return (
      <View style={styles.screen}>
        <BackHeader title="Checkout" />
        <View style={styles.pad} accessibilityLabel="Loading checkout" accessibilityRole="progressbar">
          <Skeleton style={{ height: 24, width: '40%' }} />
          <Skeleton style={{ height: 52 }} />
          <Skeleton style={{ height: 52 }} />
          <Skeleton style={{ height: 52 }} />
          <Skeleton style={{ height: 24, width: '40%', marginTop: space.md }} />
          <Skeleton style={{ height: 64 }} />
          <Skeleton style={{ height: 64 }} />
        </View>
      </View>
    )
  }
  const loadError = cart.error ?? zones.error ?? me.error
  if (loadError || !cart.data || !zones.data || !me.data) {
    return (
      <View style={styles.screen}>
        <BackHeader title="Checkout" />
        <ErrorState
          message={loadError?.message ?? 'We could not load checkout.'}
          onRetry={() => {
            void cart.refetch()
            void zones.refetch()
            void me.refetch()
          }}
        />
      </View>
    )
  }
  if (cart.data.lines.length === 0 && !checkout.placed) {
    return (
      <View style={styles.screen}>
        <BackHeader title="Checkout" />
        <EmptyState
          title="Your cart is empty"
          body={checkout.conflict ? 'Everything in it sold out.' : 'Add a scent to check out.'}
          actionLabel="Browse the shop"
          onAction={() => router.replace('/')}
        />
      </View>
    )
  }

  const zone = zones.data.zones.find((z) => z.id === form.deliveryZone)
  const feeKobo = zone ? previewDeliveryFeeKobo(zone.feeKobo, cart.data.subtotalKobo, zones.data.freeDeliveryThresholdKobo) : null
  const totalKobo = cart.data.subtotalKobo + (feeKobo ?? 0)

  const onPlaceOrder = () => {
    const invalid = checkout.submit(form)
    const first = (Object.keys(SECTION_OF) as (keyof DeliveryForm)[]).find((k) => invalid[k])
    if (first) scroll.current?.scrollTo({ y: Math.max(0, (sectionY[SECTION_OF[first]] ?? 0) - space.lg), animated: true })
    else scroll.current?.scrollTo({ y: 0, animated: true })
  }

  return (
    <View style={styles.screen}>
      <BackHeader title="Checkout" />
      <ScrollView ref={scroll} contentContainerStyle={styles.pad} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag">
        {checkout.conflict ? <StockConflict lines={checkout.conflict} /> : null}
        {checkout.serverError ? (
          <Text style={[t.body, { color: colors.danger }]} accessibilityRole="alert">{checkout.serverError}</Text>
        ) : null}

        <View style={styles.section} onLayout={mark('contact')}>
          <Heading>Contact</Heading>
          <Field label="Email" value={me.data.email} readOnly hint="From your Google account" />
          <Field
            label="Full name"
            value={form.fullName}
            onChangeText={(v) => update('fullName', v)}
            error={checkout.errors.fullName}
            autoComplete="name"
            textContentType="name"
            autoCapitalize="words"
          />
          <Field
            label="Phone"
            prefix="+234"
            value={form.phone}
            onChangeText={(v) => update('phone', v)}
            error={checkout.errors.phone}
            placeholder="803 123 4567"
            keyboardType="phone-pad"
            autoComplete="tel"
            textContentType="telephoneNumber"
          />
        </View>

        <View style={styles.section} onLayout={mark('delivery')}>
          <Heading>Delivery address</Heading>
          <Field
            label="Street address"
            value={form.addressLine}
            onChangeText={(v) => update('addressLine', v)}
            error={checkout.errors.addressLine}
            autoComplete="street-address"
            textContentType="fullStreetAddress"
          />
          <Field label="City or area" value={form.city} onChangeText={(v) => update('city', v)} error={checkout.errors.city} />
          <StatePicker states={zones.data.states} value={form.state} onChange={chooseState} error={checkout.errors.state} />
        </View>

        <View style={styles.section} onLayout={mark('zone')}>
          <Heading>Delivery zone</Heading>
          <ZoneCards
            zones={zones.data}
            selected={form.deliveryZone}
            onSelect={(z) => update('deliveryZone', z)}
            state={form.state}
            subtotalKobo={cart.data.subtotalKobo}
            error={checkout.errors.deliveryZone}
          />
        </View>

        <View style={styles.section}>
          <Heading>Payment</Heading>
          <View style={styles.payment}>
            <View style={styles.radioOn}><View style={styles.dot} /></View>
            <View style={{ flex: 1 }}>
              <Text style={t.bodyStrong}>Pay on delivery</Text>
              <Text style={[t.small, { color: colors.muted }]}>Pay the rider in cash or by transfer when your order arrives.</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Heading>Your order</Heading>
          <OrderSummary cart={cart.data} deliveryFeeKobo={feeKobo} />
        </View>
      </ScrollView>

      <View style={[styles.bar, { paddingBottom: insets.bottom + space.md }]}>
        <View>
          <Text style={[t.caption, { color: colors.muted }]}>Total</Text>
          <Text style={t.h3}>{formatKobo(totalKobo)}</Text>
        </View>
        <Button label="Place order" onPress={onPlaceOrder} loading={checkout.pending} style={{ flex: 1 }} />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.cream },
  pad: { padding: space.lg, gap: space.xl },
  section: { gap: space.md },
  payment: { flexDirection: 'row', gap: space.md, alignItems: 'center', padding: space.lg, borderRadius: radius.md, borderWidth: 2, borderColor: colors.ink, backgroundColor: colors.surface },
  radioOn: { width: 22, height: 22, borderRadius: 11, borderWidth: 1.5, borderColor: colors.ink, alignItems: 'center', justifyContent: 'center' },
  dot: { width: 12, height: 12, borderRadius: 6, backgroundColor: colors.ink },
  bar: { flexDirection: 'row', alignItems: 'center', gap: space.lg, paddingHorizontal: space.lg, paddingTop: space.md, backgroundColor: colors.cream, borderTopWidth: 1, borderTopColor: colors.border, ...shadow.md },
})
