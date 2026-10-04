import { useQuery } from '@tanstack/react-query'
import { router, useFocusEffect } from 'expo-router'
import { useCallback } from 'react'
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useAuth } from '@/auth/AuthProvider'
import { SkeletonLine } from '@/components/ProductCard'
import { SignInPrompt } from '@/components/SignInPrompt'
import { Skeleton } from '@/components/Skeleton'
import { EmptyState, ErrorState } from '@/components/States'
import { colors, radius, space, type as t } from '@/theme'
import { OrderRow, OrderRowSkeleton } from './OrderRow'
import { ordersQuery } from './queries'
import { ProfileCard } from './ProfileCard'

export function OrdersScreen() {
  const insets = useSafeAreaInsets()
  const { status } = useAuth()
  const signedIn = status === 'signedIn'
  const orders = useQuery({ ...ordersQuery(), enabled: signedIn })
  const { refetch } = orders

  // Statuses change on the shop side, so look again whenever this tab comes to the front.
  useFocusEffect(
    useCallback(() => {
      if (signedIn) void refetch()
    }, [signedIn, refetch]),
  )

  const top = { paddingTop: insets.top + space.lg }
  if (!signedIn) {
    return (
      <View style={[styles.screen, styles.pad, top]}>
        <Text style={t.h1}>Orders</Text>
        <SignInPrompt
          title="Sign in to see your orders"
          body="Your orders and cart follow your Google account, in the app and on the website."
        />
      </View>
    )
  }

  const header = (
    <View style={{ gap: space.lg }}>
      <Text style={t.h1}>Orders</Text>
      <ProfileCard />
    </View>
  )

  return (
    <FlatList
      style={styles.screen}
      data={orders.data ?? []}
      keyExtractor={(o) => o.ref}
      contentContainerStyle={[styles.pad, top, { paddingBottom: space.xxl }]}
      ItemSeparatorComponent={() => <View style={{ height: space.md }} />}
      ListHeaderComponent={<View style={{ marginBottom: space.lg }}>{header}</View>}
      refreshControl={
        <RefreshControl
          refreshing={orders.isRefetching}
          onRefresh={() => void orders.refetch()}
          tintColor={colors.ink}
          colors={[colors.ink]}
        />
      }
      renderItem={({ item }) => <OrderRow order={item} />}
      ListEmptyComponent={
        orders.isPending ? (
          <View style={{ gap: space.md }} accessibilityLabel="Loading your orders" accessibilityRole="progressbar">
            {[0, 1, 2].map((i) => (
              <OrderRowSkeleton key={i}>
                <Skeleton style={{ width: 56, height: 56 }} />
                <View style={{ flex: 1 }}>
                  <SkeletonLine lineHeight={t.bodyStrong.lineHeight} width="50%" />
                  <SkeletonLine lineHeight={t.small.lineHeight} width="70%" />
                  <SkeletonLine lineHeight={t.small.lineHeight} width="30%" />
                </View>
                <View style={{ alignItems: 'flex-end', gap: 6 }}>
                  <SkeletonLine lineHeight={t.bodyStrong.lineHeight} width={64} />
                  <Skeleton style={{ height: 28, width: 76, borderRadius: radius.pill }} />
                </View>
              </OrderRowSkeleton>
            ))}
          </View>
        ) : orders.isError ? (
          <ErrorState message={orders.error.message} onRetry={() => void orders.refetch()} />
        ) : (
          <EmptyState
            title="No orders yet"
            body="When you place one, it shows up here."
            actionLabel="Browse the shop"
            onAction={() => router.navigate('/')}
          />
        )
      }
    />
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.cream },
  pad: { paddingHorizontal: space.lg, gap: space.lg },
})
