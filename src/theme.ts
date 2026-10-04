/**
 * Design tokens ported from the web repo (docs/design/tokens.css). Plain StyleSheet only.
 * Do not invent colours, radii or shadows: add them to the web tokens first.
 */
import type { TextStyle, ViewStyle } from 'react-native'

export const colors = {
  ink: '#1C1915',
  cream: '#FAF6EF',
  surface: '#FFFFFF',
  blush: '#F3EADD',
  border: '#E7DFD2',
  borderStrong: '#CFC4B3',
  muted: '#5E564C',
  text2: '#4A433B',
  disabled: '#8A8177',
  pocket: '#B4532F',
  pocketText: '#A1462A',
  arabian: '#9A6510',
  designer: '#1F2F52',
  niche: '#1C1915',
  gold: '#C9A45C',
  success: '#2F6B4F',
  danger: '#9B2C2C',
  info: '#1F2F52',
  white: '#FFFFFF',
  overlay: 'rgba(28, 25, 21, 0.45)',
} as const

export const radius = {
  sm: 10,
  md: 14,
  lg: 18,
  xl: 24,
  xxl: 32,
  pill: 999,
} as const

/** 4pt grid. */
export const space = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const

export const fonts = {
  serif: 'InstrumentSerif_400Regular',
  serifItalic: 'InstrumentSerif_400Regular_Italic',
  sans: 'InstrumentSans_400Regular',
  sansMedium: 'InstrumentSans_500Medium',
  sansSemi: 'InstrumentSans_600SemiBold',
  sansBold: 'InstrumentSans_700Bold',
} as const

/** Type scale for a phone (the web uses fluid clamp()s; these are the small-screen values). */
export const type = {
  display: { fontFamily: fonts.serif, fontSize: 52, lineHeight: 54, letterSpacing: -0.5 },
  h1: { fontFamily: fonts.serif, fontSize: 40, lineHeight: 42, letterSpacing: -0.4 },
  h2: { fontFamily: fonts.serif, fontSize: 32, lineHeight: 36, letterSpacing: -0.3 },
  h3: { fontFamily: fonts.serif, fontSize: 24, lineHeight: 28, letterSpacing: -0.2 },
  body: { fontFamily: fonts.sans, fontSize: 16, lineHeight: 24 },
  bodyStrong: { fontFamily: fonts.sansSemi, fontSize: 16, lineHeight: 24 },
  small: { fontFamily: fonts.sans, fontSize: 14, lineHeight: 20 },
  smallStrong: { fontFamily: fonts.sansSemi, fontSize: 14, lineHeight: 20 },
  caption: { fontFamily: fonts.sansMedium, fontSize: 12, lineHeight: 16 },
  eyebrow: {
    fontFamily: fonts.sansMedium,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
} as const satisfies Record<string, TextStyle>

/** Elevation: tokens.css shadows mapped to RN shadow props plus Android elevation. */
export const shadow = {
  sm: { shadowColor: colors.ink, shadowOpacity: 0.06, shadowRadius: 2, shadowOffset: { width: 0, height: 1 }, elevation: 1 },
  md: { shadowColor: colors.ink, shadowOpacity: 0.18, shadowRadius: 24, shadowOffset: { width: 0, height: 8 }, elevation: 4 },
  lg: { shadowColor: colors.ink, shadowOpacity: 0.3, shadowRadius: 64, shadowOffset: { width: 0, height: 24 }, elevation: 10 },
} as const satisfies Record<string, ViewStyle>

export type Tier = 'pocket' | 'arabian_gems' | 'designer' | 'niche'

export const tiers: Record<Tier, { label: string; range: string; color: string; tint: string }> = {
  pocket: { label: 'Pocket', range: 'Under ₦15k', color: colors.pocket, tint: 'rgba(180, 83, 47, 0.08)' },
  arabian_gems: { label: 'Arabian Gems', range: '₦25k to ₦70k', color: colors.arabian, tint: 'rgba(154, 101, 16, 0.08)' },
  designer: { label: 'Designer', range: '₦75k to ₦400k', color: colors.designer, tint: 'rgba(31, 47, 82, 0.08)' },
  niche: { label: 'Niche', range: '₦350k and up', color: colors.niche, tint: 'rgba(28, 25, 21, 0.08)' },
}

/** Minimum touch target (Android guideline 48dp). */
export const TOUCH = 48

/** Press feedback shared by every pressable: a small scale, like the web's active:scale-[0.97]. */
export const PRESSED_SCALE = 0.97
