import { useSyncExternalStore } from 'react'

// A short on-screen trail of the sign in steps, for development builds only. Never records the
// code or any token: only what happened and which parts were present.
let entries: string[] = []
const listeners = new Set<() => void>()

export function trace(message: string) {
  if (!__DEV__) return
  const time = new Date().toTimeString().slice(0, 8)
  entries = [...entries.slice(-9), `${time} ${message}`]
  console.log('[auth]', message)
  listeners.forEach((l) => l())
}

const subscribe = (l: () => void) => {
  listeners.add(l)
  return () => listeners.delete(l)
}

export function useAuthTrace(): string[] {
  return useSyncExternalStore(
    subscribe,
    () => entries,
    () => entries,
  )
}

/** "scentpocket://auth/callback?code=abc" -> "scentpocket://auth/callback?code" (keys only). */
export function describeUrl(url: string): string {
  const [base, query = ''] = url.split('?')
  const keys = query
    .split('&')
    .filter(Boolean)
    .map((p) => p.split('=')[0])
  return keys.length ? `${base}?${keys.join('&')}` : (base ?? url)
}
