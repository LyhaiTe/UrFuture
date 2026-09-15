import crypto from 'node:crypto';

const GOOGLE_AUTH_ENDPOINT = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_TOKEN_ENDPOINT = 'https://oauth2.googleapis.com/token';
const GOOGLE_USERINFO_ENDPOINT = 'https://www.googleapis.com/oauth2/v3/userinfo';

export const OAUTH_STATE_COOKIE = 'g_oauth_state';
export const OAUTH_VERIFIER_COOKIE = 'g_oauth_verifier';
export const HANDOFF_TOKEN_TTL_SECONDS = 120; // one-time token is only valid for 2 minutes

function getEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required env var ${name} — see .env.example for Google OAuth setup.`);
  }
  return value;
}

function base64url(input: Buffer): string {
  const base64 = input.toString('base64').replaceAll('+', '-').replaceAll('/', '_');
  const paddingIndex = base64.indexOf('=');
  return paddingIndex === -1 ? base64 : base64.slice(0, paddingIndex);
}

export function generateState(): string {
  return base64url(crypto.randomBytes(24));
}

export function generatePkcePair(): { codeVerifier: string; codeChallenge: string } {
  const codeVerifier = base64url(crypto.randomBytes(32));
  const codeChallenge = base64url(crypto.createHash('sha256').update(codeVerifier).digest());
  return { codeVerifier, codeChallenge };
}

export function buildGoogleAuthUrl(params: { state: string; codeChallenge: string }): string {
  const url = new URL(GOOGLE_AUTH_ENDPOINT);
  url.searchParams.set('client_id', getEnv('GOOGLE_CLIENT_ID'));
  url.searchParams.set('redirect_uri', getEnv('GOOGLE_REDIRECT_URI'));
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('scope', 'openid email profile');
  url.searchParams.set('state', params.state);
  url.searchParams.set('code_challenge', params.codeChallenge);
  url.searchParams.set('code_challenge_method', 'S256');
  url.searchParams.set('prompt', 'select_account');
  return url.toString();
}

interface GoogleTokenResponse {
  access_token: string;
  id_token: string;
  expires_in: number;
  token_type: string;
  scope: string;
}

export async function exchangeCodeForTokens(code: string, codeVerifier: string): Promise<GoogleTokenResponse> {
  const res = await fetch(GOOGLE_TOKEN_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: getEnv('GOOGLE_CLIENT_ID'),
      client_secret: getEnv('GOOGLE_CLIENT_SECRET'),
      redirect_uri: getEnv('GOOGLE_REDIRECT_URI'),
      grant_type: 'authorization_code',
      code,
      code_verifier: codeVerifier,
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    throw new Error(`Google token exchange failed (${res.status}): ${detail}`);
  }
  return res.json();
}

export interface GoogleUserInfo {
  sub: string;
  email: string;
  email_verified: boolean;
  name: string;
  picture?: string;
}

export async function fetchGoogleUserInfo(accessToken: string): Promise<GoogleUserInfo> {
  const res = await fetch(GOOGLE_USERINFO_ENDPOINT, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) {
    throw new Error(`Google userinfo request failed (${res.status})`);
  }
  return res.json();
}

function getSessionSecret(): string {
  return getEnv('AUTH_SESSION_SECRET');
}

export function signHandoffToken(userId: string): string {
  const payload = { uid: userId, exp: Date.now() + HANDOFF_TOKEN_TTL_SECONDS * 1000 };
  const payloadB64 = base64url(Buffer.from(JSON.stringify(payload)));
  const signature = base64url(crypto.createHmac('sha256', getSessionSecret()).update(payloadB64).digest());
  return `${payloadB64}.${signature}`;
}

export function verifyHandoffToken(token: string): { userId: string } | null {
  const [payloadB64, signature] = (token || '').split('.');
  if (!payloadB64 || !signature) return null;

  const expectedSignature = base64url(crypto.createHmac('sha256', getSessionSecret()).update(payloadB64).digest());
  const sigBuf = Buffer.from(signature);
  const expectedBuf = Buffer.from(expectedSignature);
  if (sigBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(sigBuf, expectedBuf)) {
    return null; // tampered or forged
  }

  try {
    const payload = JSON.parse(Buffer.from(payloadB64, 'base64').toString('utf8'));
    if (typeof payload.uid !== 'string' || typeof payload.exp !== 'number') return null;
    if (Date.now() > payload.exp) return null; // expired
    return { userId: payload.uid };
  } catch {
    return null;
  }
}