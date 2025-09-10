import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(req: Request) {
  try {
    const url = process.env.API_BASE_URL + '/api/users/change_password/';
    if (!url) {
      return new NextResponse('Сервис смены пароля недоступен. Попробуйте позже.', { status: 500 })
    }
    const body = await req.json().catch(() => ({}))
    const current = body.current_password ?? body.old_password ?? body.password
    const nextPwd = body.new_password ?? body.new_password1 ?? body.new_password2

    const cookieStore = await cookies()
    const authToken = cookieStore.get('auth')?.value
    const authMode = cookieStore.get('auth_mode')?.value
    const backendSession = cookieStore.get('backend_session')?.value
    if (!authToken) {
      return new NextResponse('Требуется авторизация. Войдите в систему.', { status: 403 })
    }

    // 1) Verify current password by re-authenticating
    if (!current) {
      return new NextResponse('Введите текущий пароль.', { status: 400 })
    }

    // Fetch username from profile
    const profileUrl = process.env.API_BASE_URL + '/api/users/me/'
    const profileHeaders: HeadersInit = {
      'Content-Type': 'application/json',
      ...(authMode === 'cookie'
        ? {}
        : { 'Authorization': `${process.env.AUTH_TOKEN_SCHEME || 'Bearer'} ${authToken}` }),
      ...(authMode === 'cookie'
        ? { 'Cookie': `${process.env.AUTH_BACKEND_COOKIE_NAME || 'sessionid'}=${backendSession || authToken}` }
        : {}),
    }

    const profileRes = await fetch(profileUrl, { method: 'GET', headers: profileHeaders, cache: 'no-store' })
    if (!profileRes.ok) {
      const status = profileRes.status
      const friendly = status === 401 || status === 403
        ? 'Требуется авторизация. Войдите в систему.'
        : 'Не удалось проверить текущий пароль. Попробуйте ещё раз.'
      return new NextResponse(friendly, { status: status || 502 })
    }
    const profileJson = await profileRes.json().catch(() => ({}))
    const username = profileJson?.username

    if (!username) {
      return new NextResponse('Не удалось получить данные пользователя. Попробуйте войти заново.', { status: 502 })
    }

    // Try to log in with provided current password
    const loginUrl = process.env.API_BASE_URL + '/api/users/login/'
    const loginRes = await fetch(loginUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password: current }),
      cache: 'no-store',
    })

    if (!(loginRes.ok)) {
      return new NextResponse('Вы ввели текущий пароль неверно.', { status: 400 })
    }

    // 2) Forward change password to backend only after verification
    const forwardBody: Record<string, string> = {}
    forwardBody.current_password = current
    forwardBody.old_password = current
    if (nextPwd) {
      forwardBody.new_password = nextPwd
      forwardBody.new_password1 = nextPwd
      forwardBody.new_password2 = nextPwd
      forwardBody.password = nextPwd
      forwardBody.password1 = nextPwd
      forwardBody.password2 = nextPwd
    }

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    }
    const scheme = process.env.AUTH_TOKEN_SCHEME || 'Bearer'
    headers['Authorization'] = `${scheme} ${authToken}`
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
      body: JSON.stringify(forwardBody),
      cache: 'no-store',
      signal: controller.signal,
    })

    try {
      res = await doRequest(headers)
      if (res.status === 401 || res.status === 403) {
        const altScheme = (scheme || 'Bearer').toLowerCase() === 'bearer' ? 'Token' : 'Bearer'
        const altHeaders: HeadersInit = { ...headers, Authorization: `${altScheme} ${authToken}` }
        res = await doRequest(altHeaders)
        if ((res.status === 401 || res.status === 403) && authMode !== 'cookie') {
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
      return new NextResponse('Сервис смены пароля временно недоступен. Попробуйте позже.', { status: 502 })
    }

    const data = await res.json()
    return NextResponse.json(data as any, { status: res.status })
  } catch (e: any) {
    const msg = e?.name === 'AbortError' ? 'Превышено время ожидания. Попробуйте ещё раз.' : 'Ошибка при смене пароля. Попробуйте позже.'
    return new NextResponse(msg, { status: 502 })
  }
}


