import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function proxy(request: NextRequest) {
  /* 로그인이 되어 있으면 접근하면 안 되는 페이지 */
  const authPages = ['/login', '/signup', '/signup-success', '/forgot-password'];
  const isAuthPage = authPages.some((page) => request.nextUrl.pathname.startsWith(page));

  /* 로그인이 필요한 페이지 */
  const protectedPages = ['/mypage'];
  const isProtectedPage = protectedPages.some((page) => request.nextUrl.pathname.startsWith(page));

  if (!isAuthPage && !isProtectedPage) {
    return NextResponse.next();
  }

  try {
    const cookieHeader = request.headers.get('cookie') || '';
    
    const res = await fetch('http://localhost:8080/members/info', {
      headers: {
        Cookie: cookieHeader,
      },
      cache: 'no-store',
      redirect: 'manual',
    });
    const isLoggedIn = res.status === 200;

    if (isLoggedIn && isAuthPage) {
      return NextResponse.redirect(new URL('/', request.url));
    }

    if (!isLoggedIn && isProtectedPage) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', request.nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }

  } catch (error) {
    console.error('proxy auth check error:', error);
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/login', 
    '/signup', 
    '/signup-success', 
    '/forgot-password', 
    '/mypage/:path*'
  ],
};