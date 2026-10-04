/** Money is integer kobo everywhere. Format only at the edge, with this. */

/** 4200000 -> "₦42,000". Shows kobo only when there are some (₦1,250.50). No Intl: it is spotty on devices. */
export function formatKobo(kobo: number): string {
  const sign = kobo < 0 ? '-' : ''
  const abs = Math.abs(kobo)
  const naira = Math.floor(abs / 100)
  const cents = abs % 100
  const grouped = String(naira).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  return `${sign}₦${grouped}${cents === 0 ? '' : `.${String(cents).padStart(2, '0')}`}`
}
