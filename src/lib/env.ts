import { z } from 'zod'

// Expo inlines EXPO_PUBLIC_* only when they are read as literal `process.env.EXPO_PUBLIC_X`.
// Public values only: the Supabase secret / service role key must never be in this app.
const schema = z.object({
  EXPO_PUBLIC_API_URL: z.url(),
  EXPO_PUBLIC_SUPABASE_URL: z.url(),
  EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().min(1),
})

const parsed = schema.safeParse({
  EXPO_PUBLIC_API_URL: process.env.EXPO_PUBLIC_API_URL,
  EXPO_PUBLIC_SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL,
  EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY:
    process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
})

if (!parsed.success) {
  const issues = parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('\n  ')
  throw new Error(`Invalid environment variables:\n  ${issues}`)
}

export const env = {
  apiUrl: parsed.data.EXPO_PUBLIC_API_URL.replace(/\/+$/, ''),
  supabaseUrl: parsed.data.EXPO_PUBLIC_SUPABASE_URL,
  supabaseKey: parsed.data.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
}
