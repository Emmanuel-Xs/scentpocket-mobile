import { Image } from 'expo-image'
import { StyleSheet } from 'react-native'

// 654x146 source (2x of 327x73); shown at 150 wide.
export function Wordmark({ width = 150 }: { width?: number }) {
  return (
    <Image
      source={require('../../assets/wordmark.png')}
      accessibilityLabel="Scentpocket"
      style={[styles.image, { width, height: (width * 146) / 654 }]}
      contentFit="contain"
    />
  )
}

const styles = StyleSheet.create({ image: { alignSelf: 'flex-start' } })
