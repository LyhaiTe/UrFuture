import crypto from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const STUDENT_SESSION_COOKIE = 'urfuture_student_session';

const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days

interface SessionPayload {
  uid: string;
  exp: number;
}

function getSessionSecret(): string {
  const secret = process.env.AUTH_SESSION_SECRET;

  if (!secret) {
    throw new Error('Missing AUTH_SESSION_SECRET');
  }

  return secret;
}

function base64url(input: Buffer): string {
  return input
    .toString('base64')
    .replaceAll('+', '-')
    .replaceAll('/', '_')
    .replace(/=+$/, '');
}

function sign(payloadB64: string): string {
  return base64url(
    crypto
      .createHmac('sha256', getSessionSecret())
      .update(payloadB64)
      .digest()
  );
}

export function createStudentSessionToken(userId: string): string {
  const payload: SessionPayload = {
    uid: userId,
    exp: Date.now() + SESSION_TTL_SECONDS * 1000,
  };

  const payloadB64 = base64url(
    Buffer.from(JSON.stringify(payload))
  );

  return `${payloadB64}.${sign(payloadB64)}`;
}

export function verifyStudentSessionToken(
  token: string
): { userId: string } | null {
  const [payloadB64, signature] = token.split('.');

  if (!payloadB64 || !signature) {
    return null;
  }

  const expectedSignature = sign(payloadB64);

  const actualBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);

  if (
    actualBuffer.length !== expectedBuffer.length ||
    !crypto.timingSafeEqual(actualBuffer, expectedBuffer)
  ) {
    return null;
  }

  try {
    const payload = JSON.parse(
      Buffer.from(payloadB64, 'base64url').toString('utf8')
    ) as SessionPayload;

    if (
      typeof payload.uid !== 'string' ||
      typeof payload.exp !== 'number' ||
      Date.now() > payload.exp
    ) {
      return null;
    }

    return { userId: payload.uid };
  } catch {
    return null;
  }
}

export function setStudentSessionCookie(
  response: NextResponse,
  userId: string
): void {
  response.cookies.set(
    STUDENT_SESSION_COOKIE,
    createStudentSessionToken(userId),
    {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: SESSION_TTL_SECONDS,
    }
  );
}

export function clearStudentSessionCookie(
  response: NextResponse
): void {
  response.cookies.set(STUDENT_SESSION_COOKIE, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
}

export async function getAuthenticatedStudent(
  request: NextRequest
) {
  const token =
    request.cookies.get(STUDENT_SESSION_COOKIE)?.value;

  if (!token) {
    return null;
  }

  const session = verifyStudentSessionToken(token);

  if (!session) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: {
      id: session.userId,
    },
  });

  if (!user || user.role !== 'STUDENT') {
    return null;
  }

  return user;
}