import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAuthenticatedStudent } from '@/lib/studentSession';

export const runtime = 'nodejs';

interface Params {
  params: {
    id: string;
  };
}

/**
 * GET /api/chat/conversations/[id]
 * Returns a conversation only when it belongs to
 * the authenticated student.
 */
export async function GET(
  req: NextRequest,
  { params }: Params
) {
  const student = await getAuthenticatedStudent(req);

  if (!student) {
    return NextResponse.json(
      { error: 'Unauthenticated' },
      { status: 401 }
    );
  }

  const { id } = params;

  if (!id) {
    return NextResponse.json(
      { error: 'Conversation id is required' },
      { status: 400 }
    );
  }

  const conversation =
    await prisma.conversation.findFirst({
      where: {
        id,
        userId: student.id,
      },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

  if (!conversation) {
    return NextResponse.json(
      { error: 'Conversation not found' },
      { status: 404 }
    );
  }

  const formattedMessages =
    conversation.messages.map((message) => {
      let toolCallsParsed:
        | unknown[]
        | undefined;

      if (message.toolCalls) {
        try {
          toolCallsParsed =
            typeof message.toolCalls === 'string'
              ? JSON.parse(message.toolCalls)
              : (message.toolCalls as unknown[]);
        } catch {
          toolCallsParsed = undefined;
        }
      }

      let citationsParsed:
        | unknown[]
        | undefined;

      if (message.citations) {
        try {
          citationsParsed =
            typeof message.citations === 'string'
              ? JSON.parse(message.citations)
              : (message.citations as unknown[]);
        } catch {
          citationsParsed = undefined;
        }
      }

      return {
        id: message.id,
        role:
          message.role.toLowerCase() ===
          'assistant'
            ? ('assistant' as const)
            : ('user' as const),
        content: message.content,
        toolCalls: toolCallsParsed,
        citations: citationsParsed,
        createdAt: message.createdAt,
      };
    });

  return NextResponse.json({
    conversation: {
      id: conversation.id,
      title: conversation.title,
      createdAt: conversation.createdAt,
      updatedAt: conversation.updatedAt,
      messages: formattedMessages,
    },
  });
}

/**
 * DELETE /api/chat/conversations/[id]
 * Deletes a conversation only when it belongs to
 * the authenticated student.
 */
export async function DELETE(
  req: NextRequest,
  { params }: Params
) {
  const student = await getAuthenticatedStudent(req);

  if (!student) {
    return NextResponse.json(
      { error: 'Unauthenticated' },
      { status: 401 }
    );
  }

  const { id } = params;

  if (!id) {
    return NextResponse.json(
      { error: 'Conversation id is required' },
      { status: 400 }
    );
  }

  const conversation =
    await prisma.conversation.findFirst({
      where: {
        id,
        userId: student.id,
      },
      select: {
        id: true,
      },
    });

  if (!conversation) {
    return NextResponse.json(
      { error: 'Conversation not found' },
      { status: 404 }
    );
  }

  try {
    await prisma.conversation.delete({
      where: {
        id: conversation.id,
      },
    });

    return NextResponse.json({
      success: true,
      id: conversation.id,
    });
  } catch (error) {
    console.error(
      'Failed to delete conversation:',
      error
    );

    return NextResponse.json(
      { error: 'Failed to delete conversation' },
      { status: 500 }
    );
  }
}