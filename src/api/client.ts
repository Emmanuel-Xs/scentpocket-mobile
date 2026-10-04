import type { z } from 'zod'
import { env } from '@/lib/env'
import { supabase } from '@/lib/supabase'
import { errorEnvelopeSchema } from './schemas'

/** A failed API call. `code` and `status` come from the server's error envelope. */
export class ApiError extends Error {
  readonly status: number
  readonly code: string
  readonly details: unknown
  constructor(status: number, code: string, message: string, details?: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.details = details
  }
}

type Options = {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  body?: unknown
  headers?: Record<string, string>
  /** Public routes (catalog) work without a session. */
  auth?: boolean
}

async function accessToken(): Promise<string | null> {
  const { data } = await supabase.auth.getSession()
  return data.session?.access_token ?? null
}

async function send(path: string, opts: Options, token: string | null) {
  const hasBody = opts.body !== undefined
  try {
    return await fetch(`${env.apiUrl}${path}`, {
      method: opts.method ?? 'GET',
      headers: {
        Accept: 'application/json',
        ...(hasBody ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...opts.headers,
      },
      body: hasBody ? JSON.stringify(opts.body) : undefined,
    })
  } catch {
    throw new ApiError(0, 'network', "Can't reach Scentpocket. Check your connection.")
  }
}

/**
 * Typed fetch: sends the Supabase access token, refreshes the session and retries once on a 401,
 * and parses the response with `schema` (a response that does not match is an error, not a guess).
 */
export async function api<T extends z.ZodType>(
  path: string,
  schema: T,
  opts: Options = {},
): Promise<z.output<T>> {
  let token = opts.auth === false ? null : await accessToken()
  let res = await send(path, opts, token)

  if (res.status === 401 && token) {
    const { data, error } = await supabase.auth.refreshSession()
    token = error ? null : (data.session?.access_token ?? null)
    if (token) res = await send(path, opts, token)
  }

  const text = await res.text()
  let json: unknown = null
  try {
    json = text ? JSON.parse(text) : null
  } catch {
    json = null
  }

  if (!res.ok) {
    const envelope = errorEnvelopeSchema.safeParse(json)
    if (envelope.success) {
      const { code, message, details } = envelope.data.error
      throw new ApiError(res.status, code, message, details)
    }
    throw new ApiError(res.status, 'http_error', 'Something went wrong. Please try again.')
  }

  const parsed = schema.safeParse(json)
  if (!parsed.success) {
    console.warn('[api] unexpected response shape for', path, parsed.error.issues)
    throw new ApiError(res.status, 'bad_response', 'We got an unexpected answer. Please try again.')
  }
  return parsed.data
}
