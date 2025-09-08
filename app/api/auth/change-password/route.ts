import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(req: Request) {
  try {
    const url = process.env.AUTH_CHANGE_PASSWORD_URL || 'https://900c15e5d875.ngrok-free.app/api/users/change_password/'
    if (!url) {
      return NextResponse.json({ message: 'AUTH_CHANGE_PASSWORD_URL is not configured' }, { status: 500 })
    }
    const body = await req.json().catch(() => ({}))
    const current = body.current_password ?? body.old_password ?? body.password
    const nextPwd = body.new_password ?? body.new_password1 ?? body.new_password2
    const forwardBody: Record<string, string> = {}
    if (current) {
      forwardBody.current_password = current
      forwardBody.old_password = current
    }
    if (nextPwd) {
      forwardBody.new_password = nextPwd
      forwardBody.new_password1 = nextPwd
      forwardBody.new_password2 = nextPwd
      forwardBody.password = nextPwd
      forwardBody.password1 = nextPwd
      forwardBody.password2 = nextPwd
    }

    const cookieStore = cookies()
    const authToken = cookieStore.get('auth')?.value
    const authMode = cookieStore.get('auth_mode')?.value
    const backendSession = cookieStore.get('backend_session')?.value
    if (!authToken) {
      return NextResponse.json({ detail: 'Authentication credentials were not provided.' }, { status: 403 })
    }

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    }
    // Always send Authorization header (works for token/JWT backends)
    const scheme = process.env.AUTH_TOKEN_SCHEME || 'Bearer'
    headers['Authorization'] = `${scheme} ${authToken}`
    // Additionally, if using cookie-based auth, forward the session cookie
    if (authMode === 'cookie') {
      const backendCookieName = process.env.AUTH_BACKEND_COOKIE_NAME || 'sessionid'
      const cookieValue = backendSession || authToken
      headers['Cookie'] = `${backendCookieName}=${cookieValue}`
    }

    const controller = new AbortController()
    const timeoutMs = Number(process.env.HTTP_TIMEOUT_MS || 10000)
    const timeout = setTimeout(() => controller.abort(), timeoutMs)

    let res: Response | null = null
    const doRequest = async (h: HeadersInit) => fetch(url, {
      method: 'POST',
      headers: h,
      body: JSON.stringify(Object.keys(forwardBody).length ? forwardBody : body),
      cache: 'no-store',
      signal: controller.signal,
    })

    try {
      // Attempt 1: configured scheme + cookie (if any)
      res = await doRequest(headers)
      if (res.status === 401 || res.status === 403) {
        const clone = res.clone();
        const maybeJson = (await clone.text().catch(() => '')).trim();
        const detail = (() => { try { return JSON.parse(maybeJson)?.detail } catch { return undefined } })();
        // Attempt 2: alternative scheme (Token <t> vs Bearer <t>)
        const altScheme = (scheme || 'Bearer').toLowerCase() === 'bearer' ? 'Token' : 'Bearer'
        const altHeaders: HeadersInit = { ...headers, Authorization: `${altScheme} ${authToken}` }
        res = await doRequest(altHeaders)
        if ((res.status === 401 || res.status === 403) && authMode !== 'cookie') {
          // Attempt 3: try cookie-based session auth as last resort
          const backendCookieName = process.env.AUTH_BACKEND_COOKIE_NAME || 'sessionid'
          const cookieOnly: HeadersInit = { 'Content-Type': 'application/json', 'Cookie': `${backendCookieName}=${authToken}` }
          res = await doRequest(cookieOnly)
        }
      }
    } finally {
      clearTimeout(timeout)
    }

    const contentType = res.headers.get('content-type') || ''
    if (!contentType.includes('application/json')) {
      const text = await res.text().catch(() => '')
      return NextResponse.json({ message: text || 'Change password service invalid response' }, { status: 502 })
    }

    const data = await res.json()
    return NextResponse.json(data as any, { status: res.status })
  } catch (e: any) {
    const msg = e?.name === 'AbortError' ? 'Change password service timed out' : (e?.message || 'Change password proxy error')
    return NextResponse.json({ message: msg }, { status: 502 })
  }
}


