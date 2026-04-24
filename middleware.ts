import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Ambil cookie role (pastikan saat login kamu set cookie "user_role")
  const role = request.cookies.get('user_role')?.value;
  const { pathname } = request.nextUrl;

  // Proteksi folder /admin
  if (pathname.startsWith('/admin')) {
    if (role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  // Proteksi folder /employee
  if (pathname.startsWith('/employee')) {
    if (!role) {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return NextResponse.next();
}

// Tentukan halaman mana saja yang diproteksi
export const config = {
  matcher: ['/admin/:path*', '/employee/:path*'],
};