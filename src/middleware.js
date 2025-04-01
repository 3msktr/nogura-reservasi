import { NextResponse } from 'next/server';

export function middleware(request) {
  const response = NextResponse.next();

  // Add cache control headers
  response.headers.set('Cache-Control', 'no-store, must-revalidate, max-age=0');
  response.headers.set('Pragma', 'no-cache');
  response.headers.set('Expires', '0');

  return response;
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};