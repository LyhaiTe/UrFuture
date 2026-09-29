import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { getAuthenticatedCounselor } from '@/lib/studentSession';

export const runtime = 'nodejs';

const updateReviewSchema = z.object({
  reviewId: z.string().trim().min(1),

  status: z.enum([
    'PENDING',
    'APPROVED',
    'REJECTED',
    'NEEDS_REVISION',
  ]),

  counselorNotes: z
    .string()
    .trim()
    .max(5000)
    .optional(),
});

/**
 * GET /api/counselor/reviews
 *
 * Returns the counselor review queue.
 * Only COUNSELOR and ADMIN users may access it.
 */
export async function GET(
  req: NextRequest,
) {
  try {
    const counselor =
      await getAuthenticatedCounselor(req);

    if (!counselor) {
      return NextResponse.json(
        {
          error: 'Unauthenticated or unauthorized',
        },
        {
          status: 401,
        },
      );
    }

    const reviews =
      await prisma.counselorReview.findMany({
        orderBy: [
          {
            status: 'asc',
          },
          {
            createdAt: 'desc',
          },
        ],

        include: {
          student: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },

          counselor: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },

          careerRecommendation: {
            include: {
              careerPath: {
                select: {
                  id: true,
                  title: true,
                },
              },
            },
          },
        },
      });

    return NextResponse.json({
      reviews,
    });
  } catch (error) {
    console.error(
      'Failed to load counselor reviews:',
      error,
    );

    return NextResponse.json(
      {
        error:
          'Could not load counselor reviews.',
      },
      {
        status: 500,
      },
    );
  }
}

/**
 * PATCH /api/counselor/reviews
 *
 * Claims/updates a review using the authenticated
 * counselor identity.
 *
 * counselorId is NEVER accepted from the client.
 */
export async function PATCH(
  req: NextRequest,
) {
  try {
    const counselor =
      await getAuthenticatedCounselor(req);

    if (!counselor) {
      return NextResponse.json(
        {
          error: 'Unauthenticated or unauthorized',
        },
        {
          status: 401,
        },
      );
    }

    const parsed =
      updateReviewSchema.safeParse(
        await req.json(),
      );

    if (!parsed.success) {
      return NextResponse.json(
        {
          error:
            parsed.error.flatten(),
        },
        {
          status: 400,
        },
      );
    }

    const {
      reviewId,
      status,
      counselorNotes,
    } = parsed.data;

    const existing =
      await prisma.counselorReview.findUnique({
        where: {
          id: reviewId,
        },
      });

    if (!existing) {
      return NextResponse.json(
        {
          error: 'Review not found',
        },
        {
          status: 404,
        },
      );
    }

    /*
     * A counselor cannot overwrite a review that
     * another counselor has already claimed.
     *
     * ADMIN users may manage any review.
     */
    if (
      existing.counselorId &&
      existing.counselorId !==
        counselor.id &&
      counselor.role !== 'ADMIN'
    ) {
      return NextResponse.json(
        {
          error:
            'This review is assigned to another counselor.',
        },
        {
          status: 403,
        },
      );
    }

    /*
     * Non-pending outcomes represent a completed
     * counselor decision and therefore require notes.
     */
    if (
      status !== 'PENDING' &&
      !counselorNotes
    ) {
      return NextResponse.json(
        {
          error:
            'Counselor notes are required when resolving a review.',
        },
        {
          status: 400,
        },
      );
    }

    const resolvedAt =
      status === 'PENDING'
        ? null
        : new Date();

    const updated =
      await prisma.counselorReview.update({
        where: {
          id: reviewId,
        },

        data: {
          counselorId:
            counselor.id,

          status,

          counselorNotes:
            counselorNotes ??
            existing.counselorNotes,

          resolvedAt,
        },

        include: {
          student: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },

          counselor: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },

          careerRecommendation: {
            include: {
              careerPath: {
                select: {
                  id: true,
                  title: true,
                },
              },
            },
          },
        },
      });

    return NextResponse.json({
      review: updated,
    });
  } catch (error) {
    console.error(
      'Failed to update counselor review:',
      error,
    );

    return NextResponse.json(
      {
        error:
          'Could not update counselor review.',
      },
      {
        status: 500,
      },
    );
  }
}