import { focusManager, QueryClient } from '@tanstack/react-query'
import { AppState } from 'react-native'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 10_000, refetchOnReconnect: true },
  },
})

// React Native has no window focus: treat "app in the foreground" as focus, so queries refetch
// when the user comes back to the app (this is how web cart edits show up here).
AppState.addEventListener('change', (state) => {
  focusManager.setFocused(state === 'active')
})
