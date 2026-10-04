import { Tabs } from 'expo-router'
import type { ColorValue } from 'react-native'
import { Icon } from '@/components/Icon'
import type { IconName } from '@/components/Icon'
import { useCart } from '@/cart/queries'
import { colors, fonts } from '@/theme'

const icon = (name: IconName) =>
  function TabIcon({ color }: { color: ColorValue }) {
    return <Icon name={name} color={color} size={24} />
  }

export default function TabsLayout() {
  const cart = useCart()
  const count = cart.data?.itemCount ?? 0
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.ink,
        tabBarInactiveTintColor: colors.disabled,
        tabBarStyle: { backgroundColor: colors.cream, borderTopColor: colors.border },
        tabBarLabelStyle: { fontFamily: fonts.sansMedium, fontSize: 12 },
        tabBarBadgeStyle: { backgroundColor: colors.pocket, color: colors.white, fontFamily: fonts.sansSemi },
        sceneStyle: { backgroundColor: colors.cream },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Shop', tabBarIcon: icon('grid') }} />
      <Tabs.Screen name="dupes" options={{ title: 'Dupes', tabBarIcon: icon('copy') }} />
      <Tabs.Screen
        name="cart"
        options={{ title: 'Cart', tabBarIcon: icon('bag'), tabBarBadge: count > 0 ? count : undefined }}
      />
      <Tabs.Screen name="orders" options={{ title: 'Orders', tabBarIcon: icon('receipt') }} />
    </Tabs>
  )
}
