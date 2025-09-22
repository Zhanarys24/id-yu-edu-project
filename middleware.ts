import { NextRequest, NextResponse } from 'next/server';

// 🔧 ФЛАГ ДЛЯ ВРЕМЕННОГО ОТКЛЮЧЕНИЯ АУТЕНТИФИКАЦИИ
// Установите в false, чтобы разрешить доступ всем пользователям
const AUTH_REQUIRED = true;

// Public paths that do NOT require auth
const PUBLIC_PATHS: RegExp[] = [
  /^\/login(?:\/.*)?$/,
  /^\/public(?:\/.*)?$/,
  /^\/locales(?:\/.*)?$/,
  /^\/_next(?:\/.*)?$/,
  /^\/favicon\.ico$/,
  /^\/images(?:\/.*)?$/,
  /^\/api\/public(?:\/.*)?$/,
  /^\/api\/auth(?:\/.*)?$/,
];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isPublic = PUBLIC_PATHS.some((re) => re.test(pathname));
  const authCookie = req.cookies.get('auth')?.value;
  
  // Debug logging for API calendar routes
  if (pathname.startsWith('/api/calendar')) {
    console.log(' === MIDDLEWARE DEBUG ===');
    console.log(' Path:', pathname);
    console.log('🔍 Is public:', isPublic);
    console.log('🔍 Auth cookie exists:', !!authCookie);
    console.log(' Auth cookie value:', authCookie?.substring(0, 20) + '...');
    console.log('🔍 All cookies:', req.cookies.getAll().map(c => `${c.name}=${c.value?.substring(0, 20)}...`));
  }

  // If user is authenticated and tries to visit /login, redirect to home
  if (authCookie && /^\/login(?:\/.*)?$/.test(pathname)) {
    const url = req.nextUrl.clone();
    url.pathname = '/main/news';
    return NextResponse.redirect(url);
  }

  // 🔒 ВКЛЮЧАЕМ АУТЕНТИФИКАЦИЮ
  if (!AUTH_REQUIRED) {
    console.log('🔓 Auth disabled - allowing access to:', pathname);
    return NextResponse.next();
  }

  if (isPublic) {
    console.log('✅ Public path, allowing access to:', pathname);
    return NextResponse.next();
  }

  if (!authCookie) {
    console.log('❌ No auth cookie found for:', pathname);
    // For API requests, return 403 instead of redirecting
    if (pathname.startsWith('/api')) {
      console.log('❌ Blocking API request due to missing auth cookie');
      return new NextResponse('Forbidden', { status: 403 });
    }

    // Redirect unauthenticated users to /login
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    // preserve intended destination
    url.searchParams.set('next', pathname);
    return NextResponse.redirect(url);
  }

  console.log('✅ Auth cookie found, allowing access to:', pathname);
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};


