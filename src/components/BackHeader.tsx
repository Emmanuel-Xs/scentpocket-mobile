import { router } from 'expo-router'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { colors, radius, space, TOUCH, type as t } from '@/theme'
import { Icon } from './Icon'

type Props = { title?: string; fallback?: Parameters<typeof router.replace>[0] }

/** Top bar with a 48dp back button. Falls back to a route when there is nothing to go back to. */
export function BackHeader({ title, fallback = '/' }: Props) {
  const insets = useSafeAreaInsets()
  return (
    <View style={[styles.row, { paddingTop: insets.top + space.xs }]}>
      <Pressable
        onPress={() => (router.canGoBack() ? router.back() : router.replace(fallback))}
        accessibilityRole="button"
        accessibilityLabel="Back"
        style={({ pressed }) => [styles.back, pressed && { backgroundColor: colors.blush }]}
      >
        <Icon name="back" size={24} />
      </Pressable>
      {title ? <Text style={t.h3}>{title}</Text> : null}
    </View>
  )
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: space.xs, paddingHorizontal: space.sm, paddingBottom: space.xs },
  back: { width: TOUCH, height: TOUCH, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
})
