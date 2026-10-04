import { Image } from 'react-native'
import type { ColorValue, ImageSourcePropType } from 'react-native'
import { colors } from '@/theme'

// Black outline PNGs from `node scripts/make-assets.mjs`, recoloured with tintColor.
const SOURCES = {
  grid: require('../../assets/icons/grid.png'),
  copy: require('../../assets/icons/copy.png'),
  bag: require('../../assets/icons/bag.png'),
  receipt: require('../../assets/icons/receipt.png'),
  search: require('../../assets/icons/search.png'),
  back: require('../../assets/icons/back.png'),
  x: require('../../assets/icons/x.png'),
  check: require('../../assets/icons/check.png'),
  user: require('../../assets/icons/user.png'),
} satisfies Record<string, ImageSourcePropType>

export type IconName = keyof typeof SOURCES

export function Icon({ name, size = 22, color = colors.ink }: { name: IconName; size?: number; color?: ColorValue }) {
  return <Image source={SOURCES[name]} tintColor={color} style={{ width: size, height: size }} resizeMode="contain" accessible={false} />
}
