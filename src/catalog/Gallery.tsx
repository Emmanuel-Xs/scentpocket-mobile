import { useState } from 'react'
import { FlatList, StyleSheet, useWindowDimensions, View } from 'react-native'
import type { Image } from '@/api/schemas'
import { ProductImage } from '@/components/ProductImage'
import { colors, radius, space } from '@/theme'

/** Swipeable photos with dots. One photo (or none) shows no dots. */
export function Gallery({ images }: { images: Image[] }) {
  const { width } = useWindowDimensions()
  const [index, setIndex] = useState(0)

  if (images.length <= 1) {
    return <ProductImage image={images.at(0) ?? null} aspectRatio={1} />
  }
  return (
    <View>
      <FlatList
        data={images}
        keyExtractor={(img) => img.src}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => setIndex(Math.round(e.nativeEvent.contentOffset.x / width))}
        renderItem={({ item }) => (
          <View style={{ width }}>
            <ProductImage image={item} aspectRatio={1} />
          </View>
        )}
      />
      <View style={styles.dots} accessibilityLabel={`Photo ${index + 1} of ${images.length}`}>
        {images.map((img, i) => (
          <View key={img.src} style={[styles.dot, i === index && styles.dotActive]} />
        ))}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  dots: { position: 'absolute', bottom: space.md, alignSelf: 'center', flexDirection: 'row', gap: 6 },
  dot: { width: 8, height: 8, borderRadius: radius.pill, backgroundColor: colors.borderStrong },
  dotActive: { backgroundColor: colors.ink },
})
