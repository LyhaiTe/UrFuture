import { NextRequest, NextResponse } from 'next/server';
import {
  buildGoogleAuthUrl,
  generatePkcePair,
  generateState,
  OAUTH_STATE_COOKIE,
  OAUTH_VERIFIER_COOKIE,
} from '@/lib/googleAuth';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  try {
    const state = generateState();
    const { codeVerifier, codeChallenge } = generatePkcePair();
    const authUrl = buildGoogleAuthUrl({ state, codeChallenge });

    const res = NextResponse.redirect(authUrl);
    const cookieOpts = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      path: '/',
      maxAge: 300,
    };
    res.cookies.set(OAUTH_STATE_COOKIE, state, cookieOpts);
    res.cookies.set(OAUTH_VERIFIER_COOKIE, codeVerifier, cookieOpts);
    return res;
  } catch (err: any) {
    console.error('Failed to start Google OAuth flow:', err);
    return NextResponse.redirect(new URL('/?authError=google_not_configured', req.url));
  }
}