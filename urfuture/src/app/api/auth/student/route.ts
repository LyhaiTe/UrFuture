import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { StudentUser } from '@/types';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    let body: any = {};
    try {
      body = await req.json();
    } catch {
      body = {};
    }
    const { action = 'demo', email, name, institution, educationLevel } = body || {};

    // 1. Instant Demo Student Login
    if (action === 'demo') {
      try {
        const user = await prisma.user.upsert({
          where: { email: 'sokha.demo@camtech.edu.kh' },
          update: {},
          create: {
            email: 'sokha.demo@camtech.edu.kh',
            name: 'Sokha Chea (Alex)',
            role: 'STUDENT',
            educationLevel: 'UNIVERSITY_YEAR_3',
            institution: 'CamTech / ITC',
          },
        });

        const studentUser: StudentUser = {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          educationLevel: user.educationLevel || 'UNIVERSITY_YEAR_3',
          institution: user.institution || 'CamTech / ITC',
        };

        return NextResponse.json({ success: true, user: studentUser });
      } catch (dbErr) {
        // Fallback for standalone/mock local running
        const fallbackUser: StudentUser = {
          id: 'demo-student-id',
          name: 'Sokha Chea (Alex)',
          email: 'sokha.demo@camtech.edu.kh',
          role: 'STUDENT',
          educationLevel: 'UNIVERSITY_YEAR_3',
          institution: 'CamTech / ITC',
        };
        return NextResponse.json({ success: true, user: fallbackUser });
      }
    }

    // 2. Custom Login / Registration
    const normalizedEmail = (email || 'student@urfuture.edu.kh').trim().toLowerCase();
    const displayName = (name || normalizedEmail.split('@')[0] || 'Student').trim();

    try {
      const user = await prisma.user.upsert({
        where: { email: normalizedEmail },
        update: {
          name: displayName,
          institution: institution || undefined,
          educationLevel: educationLevel || undefined,
        },
        create: {
          email: normalizedEmail,
          name: displayName,
          role: 'STUDENT',
          institution: institution || 'CamTech University',
          educationLevel: educationLevel || 'UNIVERSITY_YEAR_2',
        },
      });

      const studentUser: StudentUser = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        educationLevel: user.educationLevel || educationLevel || 'UNIVERSITY_YEAR_2',
        institution: user.institution || institution || 'CamTech University',
      };

      return NextResponse.json({ success: true, user: studentUser });
    } catch (dbErr) {
      // Local fallback without live DB
      const studentUser: StudentUser = {
        id: `user-${Date.now().toString(36)}`,
        name: displayName,
        email: normalizedEmail,
        role: 'STUDENT',
        educationLevel: educationLevel || 'UNIVERSITY_YEAR_2',
        institution: institution || 'Institute of Technology of Cambodia',
      };

      return NextResponse.json({ success: true, user: studentUser });
    }
  } catch (error: any) {
    console.error('Auth route error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Authentication failed' },
      { status: 500 }
    );
  }
}
