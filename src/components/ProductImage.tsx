import { Image } from 'expo-image'
import { StyleSheet, View } from 'react-native'
import type { StyleProp, ViewStyle } from 'react-native'
import type { Image as ApiImage } from '@/api/schemas'
import { colors } from '@/theme'

type Props = {
  image: ApiImage | null
  /** width / height of the frame. */
  aspectRatio?: number
  style?: StyleProp<ViewStyle>
}

// Photos have white backgrounds. The web hides them with mix-blend-multiply, which React Native
// does not have, so the frame is white and the tier colour comes from the chip instead.
export function ProductImage({ image, aspectRatio = 4 / 5, style }: Props) {
  return (
    <View style={[styles.frame, { aspectRatio }, style]}>
      {image ? (
        <Image
          source={{ uri: image.src }}
          placeholder={{ uri: image.blurDataUrl }}
          // The blur is a 16px image: stretch it over the frame instead of showing it tiny.
          placeholderContentFit="cover"
          contentFit="contain"
          transition={200}
          accessibilityLabel={image.alt}
          style={StyleSheet.absoluteFill}
        />
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  frame: { backgroundColor: colors.surface, width: '100%', overflow: 'hidden' },
})
