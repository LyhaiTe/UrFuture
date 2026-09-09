import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const runtime = 'nodejs';

/**
 * GET /api/dev/demo-user
 * Prototype-only convenience route: returns the seeded demo student's real
 * database id so the frontend doesn't have to hardcode a cuid. Replace with
 * real session auth before shipping (see README "Auth").
 */
export async function GET() {
  const user = await prisma.user.upsert({
    where: { email: 'sokha.demo@camtech.edu.kh' },
    update: {},
    create: {
      email: 'sokha.demo@camtech.edu.kh',
      name: 'Sokha (Demo Student)',
      role: 'STUDENT',
      educationLevel: 'HS_JUNIOR',
      institution: 'Demo High School',
    },
  });
  return NextResponse.json({ userId: user.id });
}
