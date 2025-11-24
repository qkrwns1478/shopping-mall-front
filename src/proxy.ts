import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function proxy(request: NextRequest) {
  /* 로그인이 되어 있으면 접근하면 안 되는 페이지 */
  const authPages = ['/login', '/signup', '/signup-success', '/forgot-password'];
  const isAuthPage = authPages.some((page) => request.nextUrl.pathname.startsWith(page));

  /* 로그인이 필요한 페이지 */
  const protectedPages = ['/mypage'];
  const isProtectedPage = protectedPages.some((page) => request.nextUrl.pathname.startsWith(page));

  /* 관리자 전용 페이지 */
  const adminPages = ['/admin'];
  const isAdminPage = adminPages.some((page) => request.nextUrl.pathname.startsWith(page));

  if (!isAuthPage && !isProtectedPage && !isAdminPage) {
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

    if (res.status !== 200) {
      if (isProtectedPage || isAdminPage) {
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('redirect', request.nextUrl.pathname);
        return NextResponse.redirect(loginUrl);
      }
      return NextResponse.next();
    }

    const userInfo = await res.json();
    const { role } = userInfo;

    if (isAuthPage) {
      const url = new URL('/', request.url);
      url.searchParams.set('alert', 'invalid_access');
      return NextResponse.redirect(url);
    }

    if (isAdminPage && role !== 'ADMIN') {
      const url = new URL('/', request.url);
      url.searchParams.set('alert', 'admin_required');
      return NextResponse.redirect(url);
    }

  } catch (error) {
    console.error('middleware auth check error:', error);
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
    '/mypage/:path*',
    '/admin/:path*'
  ],
};