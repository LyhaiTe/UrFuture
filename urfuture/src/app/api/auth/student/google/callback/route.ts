import { NextRequest, NextResponse } from 'next/server';
import crypto from 'node:crypto';
import { prisma } from '@/lib/db';
import {
  exchangeCodeForTokens,
  fetchGoogleUserInfo,
  OAUTH_STATE_COOKIE,
  OAUTH_VERIFIER_COOKIE,
  signHandoffToken,
} from '@/lib/googleAuth';

export const runtime = 'nodejs';

function redirectWithError(req: NextRequest, code: string) {
  const res = NextResponse.redirect(new URL(`/?authError=${encodeURIComponent(code)}`, req.url));
  // Always clear the one-time OAuth cookies, success or failure.
  res.cookies.delete(OAUTH_STATE_COOKIE);
  res.cookies.delete(OAUTH_VERIFIER_COOKIE);
  return res;
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get('code');
  const returnedState = url.searchParams.get('state');
  const googleError = url.searchParams.get('error'); // e.g. "access_denied" when the user cancels

  if (googleError) {
    return redirectWithError(req, googleError === 'access_denied' ? 'google_cancelled' : 'google_denied');
  }

  const expectedState = req.cookies.get(OAUTH_STATE_COOKIE)?.value;
  const codeVerifier = req.cookies.get(OAUTH_VERIFIER_COOKIE)?.value;

  if (!code || !returnedState || !expectedState || !codeVerifier) {
    return redirectWithError(req, 'google_missing_params');
  }

  // Constant-time state comparison — this is our CSRF defense for the flow.
  const stateBuf = Buffer.from(returnedState);
  const expectedBuf = Buffer.from(expectedState);
  const stateMatches =
    stateBuf.length === expectedBuf.length && crypto.timingSafeEqual(stateBuf, expectedBuf);
  if (!stateMatches) {
    return redirectWithError(req, 'google_state_mismatch');
  }

  try {
    const tokens = await exchangeCodeForTokens(code, codeVerifier);
    const profile = await fetchGoogleUserInfo(tokens.access_token);

    if (!profile.email_verified) {
      return redirectWithError(req, 'google_email_unverified');
    }

    const normalizedEmail = profile.email.trim().toLowerCase();

    // The current Prisma schema stores the student identity by email, so we
    // reconcile Google sign-in against the existing local account instead of
    // writing unsupported fields that do not exist in the database model.
    const existing = await prisma.user.findFirst({
      where: { email: normalizedEmail },
    });

    const user = existing
      ? await prisma.user.update({
          where: { id: existing.id },
          data: {
            name: existing.name || profile.name,
          },
        })
      : await prisma.user.create({
          data: {
            email: normalizedEmail,
            name: profile.name || normalizedEmail.split('@')[0],
            role: 'STUDENT',
          },
        });

    const handoffToken = signHandoffToken(user.id);
    const res = NextResponse.redirect(new URL(`/?googleAuth=${encodeURIComponent(handoffToken)}`, req.url));
    res.cookies.delete(OAUTH_STATE_COOKIE);
    res.cookies.delete(OAUTH_VERIFIER_COOKIE);
    return res;
  } catch (err: any) {
    console.error('Google OAuth callback failed:', err);
    return redirectWithError(req, 'google_exchange_failed');
  }
}