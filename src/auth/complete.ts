import { queryClient } from '@/lib/query'
import { supabase } from '@/lib/supabase'
import { trace } from './debug'
import { meQuery } from './queries'

export type SignInResult = { ok: true } | { ok: false; reason: 'cancelled' | 'error'; message: string }

const inflight = new Map<string, Promise<SignInResult>>()

async function exchange(code: string): Promise<SignInResult> {
  const exchanged = await supabase.auth.exchangeCodeForSession(code)
  if (exchanged.error) {
    trace(`exchange failed: ${exchanged.error.message}`)
    return { ok: false, reason: 'error', message: exchanged.error.message }
  }
  trace('exchange ok, session saved')
  // The server creates the profile on the first signed in request, so ask for /me right away.
  try {
    await queryClient.fetchQuery(meQuery())
  } catch {
    // Signed in all the same; the profile card shows its own retry.
  }
  return { ok: true }
}

/**
 * Finishes Google sign in from the callback `code`. Android delivers the callback twice (to the
 * browser session AND to the router as a deep link), and a code can only be used once, so both
 * paths call this and share one exchange per code.
 */
export function completeSignIn(
  params: { code?: string | null; error?: string | null },
  source: 'browser' | 'link' | 'route',
): Promise<SignInResult> {
  trace(`${source}: code ${params.code ? 'present' : 'missing'}${params.error ? `, error: ${params.error}` : ''}`)
  if (params.error) return Promise.resolve({ ok: false, reason: 'error', message: params.error })
  const { code } = params
  if (!code) return Promise.resolve({ ok: false, reason: 'error', message: 'Google did not send us back a code.' })
  let pending = inflight.get(code)
  if (!pending) {
    pending = exchange(code)
    inflight.set(code, pending)
  }
  return pending
}
