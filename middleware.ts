import { NextRequest, NextResponse } from 'next/server';

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

  // If user is authenticated and tries to visit /login, redirect to home
  if (authCookie && /^\/login(?:\/.*)?$/.test(pathname)) {
    const url = req.nextUrl.clone();
    url.pathname = '/main/news';
    return NextResponse.redirect(url);
  }

  if (isPublic) return NextResponse.next();

  if (!authCookie) {
    // For API requests, return 403 instead of redirecting
    if (pathname.startsWith('/api')) {
      return new NextResponse('Forbidden', { status: 403 });
    }

    // Redirect unauthenticated users to /login
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    // preserve intended destination
    url.searchParams.set('next', pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};


