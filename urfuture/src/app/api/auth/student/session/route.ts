import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyHandoffToken } from '@/lib/googleAuth';
import { StudentUser } from '@/types';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json();
    if (typeof token !== 'string' || !token) {
      return NextResponse.json({ success: false, error: 'Missing token' }, { status: 400 });
    }

    const verified = verifyHandoffToken(token);
    if (!verified) {
      return NextResponse.json(
        { success: false, error: 'This sign-in link has expired or is invalid. Please try again.' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({ where: { id: verified.userId } });
    if (!user) {
      return NextResponse.json({ success: false, error: 'Account not found' }, { status: 404 });
    }

    const studentUser: StudentUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      educationLevel: user.educationLevel || undefined,
      institution: user.institution || undefined,
    };

    return NextResponse.json({ success: true, user: studentUser });
  } catch (err: any) {
    console.error('Session consume failed:', err);
    return NextResponse.json({ success: false, error: 'Sign-in failed' }, { status: 500 });
  }
}