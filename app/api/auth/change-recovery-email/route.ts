import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { validateEmail } from '@/lib/utils'

async function handleChangeRecoveryEmail(req: Request) {
  try {
    const base = process.env.API_BASE_URL || 'https://ae8bf55e6f4a.ngrok-free.app'
    const url = `${base.replace(/\/+$/, '')}/api/users/change_recovery_email/`

    const body = await req.json().catch(() => ({} as Record<string, unknown>))
    const recoveryEmail = (body as Record<string, unknown>)['recovery_email'] as string | undefined
    if (!recoveryEmail) {
      return NextResponse.json({ error: 'Укажите новую резервную почту.' }, { status: 400 })
    }
    const { isValid, error } = validateEmail(String(recoveryEmail))
    if (!isValid) {
      return NextResponse.json({ error: error || 'Невалидный email' }, { status: 400 })
    }

    const cookieStore = await cookies()
    const authToken = cookieStore.get('auth')?.value
    const authMode = cookieStore.get('auth_mode')?.value
    const backendSession = cookieStore.get('backend_session')?.value

    const payload: Record<string, string> = { recovery_email: recoveryEmail }

    // Prepare possible headers variants
    const scheme = process.env.AUTH_TOKEN_SCHEME || 'Bearer'
    const baseHeaders: HeadersInit = { 'Content-Type': 'application/json' }
    const tokenHeaders: HeadersInit | null = authToken ? { ...baseHeaders, Authorization: `${scheme} ${authToken}` } : null
    const altTokenHeaders: HeadersInit | null = authToken ? { ...baseHeaders, Authorization: `${(scheme || 'Bearer').toLowerCase() === 'bearer' ? 'Token' : 'Bearer'} ${authToken}` } : null
    const cookieHeaders: HeadersInit | null = (authMode === 'cookie' && (backendSession || authToken))
      ? { ...baseHeaders, Cookie: `${process.env.AUTH_BACKEND_COOKIE_NAME || 'sessionid'}=${backendSession || authToken}` }
      : null
    const noAuthHeaders: HeadersInit = { ...baseHeaders }

    const controller = new AbortController()
    const timeoutMs = Number(process.env.HTTP_TIMEOUT_MS || 30000)
    const timeout = setTimeout(() => controller.abort(), timeoutMs)

    const doFetch = (method: 'PATCH' | 'POST', h: HeadersInit) => fetch(url, {
      method,
      headers: h,
      body: JSON.stringify(payload),
      cache: 'no-store',
      signal: controller.signal,
    })

    let res: Response | undefined
    try {
      // Try PATCH chain
      const tryChain = async (method: 'POST') => {
        // 1) With token
        if (!res && tokenHeaders) {
          const r = await doFetch(method, tokenHeaders)
          if (r.status < 400 || (r.status !== 401 && r.status !== 403)) return r
          res = r
        }
        // 2) With alt token
        if (!res && altTokenHeaders) {
          const r = await doFetch(method, altTokenHeaders)
          if (r.status < 400 || (r.status !== 401 && r.status !== 403)) return r
          res = r
        }
        // 3) With cookie (only if cookie mode)
        if (!res && cookieHeaders) {
          const r = await doFetch(method, cookieHeaders)
          if (r.status < 400 || (r.status !== 401 && r.status !== 403)) return r
          res = r
        }
        // 4) No auth at all (allow public)
        const r = await doFetch(method, noAuthHeaders)
        return r
      }

      res = await tryChain('POST')
      if (res && (res.status === 405 || res.status === 404)) {
        res = await tryChain('POST')
      }
    } finally {
      clearTimeout(timeout)
    }

    if (!res) {
      return new NextResponse('Сервис недоступен. Попробуйте позже.', { status: 502 })
    }

    const contentType = res.headers.get('content-type') || ''
    if (contentType.includes('application/json')) {
      const data: unknown = await res.json().catch(() => ({}))
      return NextResponse.json(data as unknown, { status: res.status })
    }
    const text = await res.text().catch(() => '')
    if (!res.ok) {
      return new NextResponse(text || 'Ошибка при смене резервной почты.', { status: res.status || 502 })
    }
    return NextResponse.json({ message: text || 'ok' }, { status: res.status })
  } catch (e) {
    const err = e as Error & { name?: string }
    const msg = err?.name === 'AbortError' ? 'Превышено время ожидания. Попробуйте ещё раз.' : 'Ошибка сервера. Попробуйте позже.'
    return new NextResponse(msg, { status: 502 })
  }
}

export async function POST(req: Request) {
  return handleChangeRecoveryEmail(req)
}

export async function PATCH(req: Request) {
  return handleChangeRecoveryEmail(req)
}


