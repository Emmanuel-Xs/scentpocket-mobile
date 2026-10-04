import type { DeliveryZoneId } from '@/api/schemas'

export type DeliveryForm = {
  fullName: string
  /** The digits after +234, as typed. */
  phone: string
  addressLine: string
  city: string
  state: string
  deliveryZone: DeliveryZoneId | null
}

export type FieldErrors = Partial<Record<keyof DeliveryForm, string>>

/** "0803 123 4567", "803-123-4567" or "+234 803 123 4567" -> "+2348031234567", or null if it is not a Nigerian mobile. */
export function normalizeNigerianPhone(input: string): string | null {
  let digits = input.replace(/\D/g, '')
  if (digits.startsWith('234')) {
    digits = digits.slice(3)
    if (digits.length === 11 && digits.startsWith('0')) digits = digits.slice(1)
  } else if (digits.startsWith('0')) {
    digits = digits.slice(1)
  }
  return /^[789]\d{9}$/.test(digits) ? `+234${digits}` : null
}

export const isLagos = (state: string) => state === 'Lagos'
export const isLagosZone = (zone: DeliveryZoneId) => zone !== 'outside_lagos'

/** The same rules the server enforces, so mistakes show up next to the field instead of after a round trip. */
export function validateDelivery(form: DeliveryForm): FieldErrors {
  const errors: FieldErrors = {}
  if (form.fullName.trim().length < 2) errors.fullName = 'Enter your full name'
  if (!normalizeNigerianPhone(form.phone)) errors.phone = 'Enter a Nigerian number like 0803 123 4567'
  if (form.addressLine.trim().length < 5) errors.addressLine = 'Enter your street address'
  if (form.city.trim().length < 2) errors.city = 'Enter your city or area'
  if (!form.state) errors.state = 'Choose a state'
  if (!form.deliveryZone) errors.deliveryZone = 'Choose a delivery zone'
  else if (form.state && isLagos(form.state) !== isLagosZone(form.deliveryZone)) {
    errors.deliveryZone = 'Pick Mainland or Island for Lagos, and Outside Lagos for other states'
  }
  return errors
}

/** Server 422 `details.issues` paths look like "delivery.phone"; map them back onto our fields. */
export function fieldErrorsFromIssues(details: unknown): FieldErrors {
  const errors: FieldErrors = {}
  const issues = (details as { issues?: { path?: unknown; message?: unknown }[] } | null)?.issues
  if (!Array.isArray(issues)) return errors
  for (const issue of issues) {
    const key = typeof issue.path === 'string' ? issue.path.replace(/^delivery\./, '') : ''
    if (key in { fullName: 1, phone: 1, addressLine: 1, city: 1, state: 1, deliveryZone: 1 } && typeof issue.message === 'string') {
      errors[key as keyof DeliveryForm] ??= issue.message
    }
  }
  return errors
}

/** Fee preview from the zone list; the server recomputes it when the order is placed. */
export function previewDeliveryFeeKobo(zoneFeeKobo: number, subtotalKobo: number, freeThresholdKobo: number) {
  return subtotalKobo >= freeThresholdKobo ? 0 : zoneFeeKobo
}
