import { NextResponse } from 'next/server';

export async function POST() {
  const res = NextResponse.json({ ok: true });
  
  // Очищаем все cookies
  const domain = process.env.NODE_ENV === 'production' ? '.id.yu.edu.kz' : undefined;
  
  res.cookies.set('auth', '', { path: '/', maxAge: 0 });
  res.cookies.set('backend_session', '', { path: '/', maxAge: 0 });
  res.cookies.set('auth_mode', '', { path: '/', maxAge: 0 });
  
  // 🔧 ГЛАВНОЕ: Очищаем sessionid для домена id.yu.edu.kz
  res.cookies.set('sessionid', '', { 
    path: '/', 
    domain,
    maxAge: 0 
  });
  
  return res;
}


