import type { Session } from '@supabase/supabase-js'
import * as Linking from 'expo-linking'
import * as WebBrowser from 'expo-web-browser'
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { queryClient } from '@/lib/query'
import { supabase } from '@/lib/supabase'
import { completeSignIn } from './complete'
import { describeUrl, trace } from './debug'
import type { SignInResult } from './complete'

WebBrowser.maybeCompleteAuthSession()

export type AuthStatus = 'loading' | 'signedOut' | 'signedIn'
type AuthContextValue = {
  status: AuthStatus
  session: Session | null
  signIn: () => Promise<SignInResult>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

const queryParam = (params: Linking.QueryParams | null, key: string) => {
  const value = params?.[key]
  return typeof value === 'string' ? value : null
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<{ status: AuthStatus; session: Session | null }>({
    status: 'loading',
    session: null,
  })

  useEffect(() => {
    void supabase.auth.getSession().then(({ data }) => {
      setState({ status: data.session ? 'signedIn' : 'signedOut', session: data.session })
    })
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setState({ status: session ? 'signedIn' : 'signedOut', session })
    })
    return () => data.subscription.unsubscribe()
  }, [])

  // The Google redirect can reach the app as a plain link (not only through the browser session
  // or the router), so catch it here too. All three share one exchange per code.
  useEffect(() => {
    const handle = (url: string) => {
      if (!url.includes('auth/callback')) return
      trace(`link event: ${describeUrl(url)}`)
      const { queryParams } = Linking.parse(url)
      void completeSignIn(
        {
          code: queryParam(queryParams, 'code'),
          error: queryParam(queryParams, 'error_description') ?? queryParam(queryParams, 'error'),
        },
        'link',
      )
    }
    const sub = Linking.addEventListener('url', ({ url }) => handle(url))
    void Linking.getInitialURL().then((url) => {
      if (url) handle(url)
    })
    return () => sub.remove()
  }, [])

  const signIn = useCallback(async (): Promise<SignInResult> => {
    try {
      // Always the plain app scheme, exactly as in the Supabase allow-list. In a dev client createURL()
      // would return an exp+scentpocket://expo-development-client/?url=... address that does not match it,
      // and Supabase would send the browser to the website instead.
      const redirectTo = Linking.createURL('auth/callback', { scheme: 'scentpocket' })
      trace(`start, redirectTo ${redirectTo}`)
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo, skipBrowserRedirect: true },
      })
      if (error) return { ok: false, reason: 'error', message: error.message }

      const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo)
      trace(`browser returned: ${result.type}${result.type === 'success' ? ` ${describeUrl(result.url)}` : ''}`)
      if (result.type !== 'success') {
        // The link listener or the callback route may still finish the job a moment later.
        return { ok: false, reason: 'cancelled', message: 'Sign in did not finish. Please try again.' }
      }

      const { queryParams } = Linking.parse(result.url)
      return await completeSignIn(
        {
          code: queryParam(queryParams, 'code'),
          error: queryParam(queryParams, 'error_description') ?? queryParam(queryParams, 'error'),
        },
        'browser',
      )
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Something went wrong.'
      return { ok: false, reason: 'error', message }
    }
  }, [])

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
    queryClient.clear()
  }, [])

  const value = useMemo(() => ({ ...state, signIn, signOut }), [state, signIn, signOut])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext)
  if (!value) throw new Error('useAuth must be used inside <AuthProvider>')
  return value
}
