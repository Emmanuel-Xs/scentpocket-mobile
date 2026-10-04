import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient } from '@supabase/supabase-js'
import { AppState } from 'react-native'
import { env } from './env'

/** Auth only. App data always goes through the REST API, never straight to Supabase tables. */
export const supabase = createClient(env.supabaseUrl, env.supabaseKey, {
  auth: {
    storage: AsyncStorage,
    flowType: 'pkce',
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})

// Refresh tokens only while the app is in the foreground.
AppState.addEventListener('change', (state) => {
  if (state === 'active') void supabase.auth.startAutoRefresh()
  else void supabase.auth.stopAutoRefresh()
})
