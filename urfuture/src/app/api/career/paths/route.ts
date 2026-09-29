import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const runtime = 'nodejs';

/**
 * GET /api/career/paths
 *
 * Returns the available career paths that can be selected
 * as a major before generating a diagnostic quiz.
 */
export async function GET() {
  try {
    const careerPaths =
      await prisma.careerPath.findMany({
        select: {
          id: true,
          title: true,
        },
        orderBy: {
          title: 'asc',
        },
      });

    return NextResponse.json({
      careerPaths,
    });
  } catch (error) {
    console.error(
      'Failed to load career paths:',
      error,
    );

    return NextResponse.json(
      {
        error:
          'Could not load available majors. Please try again.',
      },
      {
        status: 500,
      },
    );
  }
}