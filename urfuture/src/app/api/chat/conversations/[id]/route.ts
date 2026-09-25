import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const runtime = 'nodejs';

interface Params {
  params: {
    id: string;
  };
}

export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = params;

  if (!id) {
    return NextResponse.json({ error: 'Conversation id is required' }, { status: 400 });
  }

  const conversation = await prisma.conversation.findUnique({
    where: { id },
    include: {
      messages: {
        orderBy: { createdAt: 'asc' },
      },
    },
  });

  if (!conversation) {
    return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
  }

  const formattedMessages = conversation.messages.map((m) => {
    let toolCallsParsed: unknown[] | undefined;
    if (m.toolCalls) {
      try {
        toolCallsParsed = typeof m.toolCalls === 'string' ? JSON.parse(m.toolCalls) : (m.toolCalls as unknown[]);
      } catch {
        toolCallsParsed = undefined;
      }
    }

    let citationsParsed: unknown[] | undefined;
    if (m.citations) {
      try {
        citationsParsed = typeof m.citations === 'string' ? JSON.parse(m.citations) : (m.citations as unknown[]);
      } catch {
        citationsParsed = undefined;
      }
    }

    return {
      id: m.id,
      role: m.role.toLowerCase() === 'assistant' ? 'assistant' : 'user',
      content: m.content,
      toolCalls: toolCallsParsed,
      citations: citationsParsed,
      createdAt: m.createdAt,
    };
  });

  return NextResponse.json({
    conversation: {
      id: conversation.id,
      title: conversation.title,
      userId: conversation.userId,
      createdAt: conversation.createdAt,
      updatedAt: conversation.updatedAt,
      messages: formattedMessages,
    },
  });
}

/**
 * DELETE /api/chat/conversations/[id]
 * Deletes a conversation and its cascaded messages.
 */
export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = params;

  if (!id) {
    return NextResponse.json({ error: 'Conversation id is required' }, { status: 400 });
  }

  try {
    await prisma.conversation.delete({
      where: { id },
    });
    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error('Failed to delete conversation:', error);
    return NextResponse.json({ error: 'Failed to delete conversation' }, { status: 500 });
  }
}
