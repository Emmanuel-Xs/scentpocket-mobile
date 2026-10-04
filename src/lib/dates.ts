const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

/** "4 Oct 2026, 3:42 PM" in the phone's time zone. No Intl: it is spotty on devices. */
export function formatDateTime(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  const hours = d.getHours()
  const minutes = String(d.getMinutes()).padStart(2, '0')
  const h12 = hours % 12 === 0 ? 12 : hours % 12
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}, ${h12}:${minutes} ${hours < 12 ? 'AM' : 'PM'}`
}
