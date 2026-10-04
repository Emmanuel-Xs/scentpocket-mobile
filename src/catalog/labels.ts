import type { ProductDetail } from '@/api/schemas'

export const longevityInfo: Record<ProductDetail['longevity'], { label: string; level: number }> = {
  short: { label: 'Short, 2 to 4h', level: 1 },
  moderate: { label: 'Moderate, 4 to 6h', level: 2 },
  long: { label: 'Long, 6 to 10h', level: 3 },
  very_long: { label: 'Very long, 10h+', level: 4 },
}

export const projectionInfo: Record<ProductDetail['projection'], { label: string; level: number }> = {
  soft: { label: 'Soft', level: 1 },
  moderate: { label: 'Moderate', level: 2 },
  strong: { label: 'Strong', level: 3 },
}

export const familyLabels = { fresh: 'Fresh', woody: 'Woody', amber: 'Amber', floral: 'Floral', gourmand: 'Gourmand' } as const
export const genderLabels = { men: 'Men', women: 'Women', unisex: 'Unisex' } as const
export const occasionLabels = { office: 'Office', owambe: 'Owambe', date_night: 'Date night', everyday: 'Everyday' } as const
