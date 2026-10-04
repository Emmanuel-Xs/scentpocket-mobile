import { useEffect, useState } from 'react'
import { Animated, Easing } from 'react-native'
import type { StyleProp, ViewStyle } from 'react-native'
import { colors, radius } from '@/theme'

/** A pulsing placeholder block. Opacity only, on the native driver. */
export function Skeleton({ style }: { style?: StyleProp<ViewStyle> }) {
  const [opacity] = useState(() => new Animated.Value(0.55))
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 700, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.55, duration: 700, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ]),
    )
    loop.start()
    return () => loop.stop()
  }, [opacity])
  return (
    <Animated.View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[{ backgroundColor: colors.blush, borderRadius: radius.md, opacity }, style]}
    />
  )
}
