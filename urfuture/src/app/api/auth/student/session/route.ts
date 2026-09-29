import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyHandoffToken } from '@/lib/googleAuth';
import {
  clearStudentSessionCookie,
  getAuthenticatedStudent,
  setStudentSessionCookie,
} from '@/lib/studentSession';
import { StudentUser } from '@/types';

export const runtime = 'nodejs';

function toStudentUser(user: {
  id: string;
  name: string;
  email: string;
  role: 'STUDENT' | 'COUNSELOR' | 'ADMIN';
  educationLevel: StudentUser['educationLevel'] | null;
  institution: string | null;
}): StudentUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    educationLevel: user.educationLevel || undefined,
    institution: user.institution || undefined,
  };
}

// Restore the current student from the signed HttpOnly cookie.
export async function GET(req: NextRequest) {
  try {
    const user = await getAuthenticatedStudent(req);

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthenticated',
        },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      user: toStudentUser(user),
    });
  } catch (error: unknown) {
    console.error('Session restore failed:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Unable to restore session',
      },
      { status: 500 }
    );
  }
}

// Consume the short-lived Google handoff token and create
// the normal student session cookie.
export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json();

    if (typeof token !== 'string' || !token) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing token',
        },
        { status: 400 }
      );
    }

    const verified = verifyHandoffToken(token);

    if (!verified) {
      return NextResponse.json(
        {
          success: false,
          error:
            'This sign-in link has expired or is invalid. Please try again.',
        },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: {
        id: verified.userId,
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: 'Account not found',
        },
        { status: 404 }
      );
    }

    if (user.role !== 'STUDENT') {
      return NextResponse.json(
        {
          success: false,
          error: 'This account is not a student account.',
        },
        { status: 403 }
      );
    }

    const response = NextResponse.json({
      success: true,
      user: toStudentUser(user),
    });

    setStudentSessionCookie(response, user.id);

    return response;
  } catch (error: unknown) {
    console.error('Session consume failed:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Sign-in failed',
      },
      { status: 500 }
    );
  }
}

// Clear the server session.
export async function DELETE() {
  const response = NextResponse.json({
    success: true,
  });

  clearStudentSessionCookie(response);

  return response;
}