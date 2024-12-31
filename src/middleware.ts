import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Protected routes
  if (req.nextUrl.pathname.startsWith('/business/dashboard') ||
      req.nextUrl.pathname.startsWith('/business/deals/new')) {
    if (!session) {
      return NextResponse.redirect(new URL('/auth', req.url));
    }

    // Check if business exists
    const { data: business } = await supabase
      .from('businesses')
      .select('id')
      .eq('id', session.user.id)
      .single();

    // If no business exists and not on onboarding page, redirect to onboarding
    if (!business && !req.nextUrl.pathname.startsWith('/business/onboarding')) {
      return NextResponse.redirect(new URL('/business/onboarding', req.url));
    }
  }

  // If already has business and trying to access onboarding, redirect to dashboard
  if (req.nextUrl.pathname.startsWith('/business/onboarding')) {
    if (!session) {
      return NextResponse.redirect(new URL('/auth', req.url));
    }

    const { data: business } = await supabase
      .from('businesses')
      .select('id')
      .eq('id', session.user.id)
      .single();

    if (business) {
      return NextResponse.redirect(new URL('/business/dashboard', req.url));
    }
  }

  return res;
}

export const config = {
  matcher: [
    '/business/dashboard/:path*',
    '/business/deals/:path*',
    '/business/onboarding/:path*',
    '/auth/callback',
  ],
}; 