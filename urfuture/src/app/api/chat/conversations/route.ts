import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');
  const conversationId = searchParams.get('conversationId');

  if (!userId) {
    return NextResponse.json({ error: 'userId is required' }, { status: 400 });
  }

  const [user, conversations] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        educationLevel: true,
        university: true,
        institution: true,
      },
    }),
    prisma.conversation.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      include: {
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: {
            content: true,
            createdAt: true,
            role: true,
          },
        },
        _count: {
          select: { messages: true },
        },
      },
    }),
  ]);

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  // Determine active conversation:
  // 1. If conversationId explicitly passed, use it.
  // 2. Otherwise default to the most recent conversation if one exists.
  const targetConvoId = conversationId ?? conversations[0]?.id;

  let activeConversation: {
    id: string;
    title: string | null;
    createdAt: Date;
    updatedAt: Date;
    messages: {
      id: string;
      role: 'user' | 'assistant';
      content: string;
      toolCalls?: unknown[];
      citations?: unknown[];
      createdAt: Date;
    }[];
  } | null = null;

  if (targetConvoId) {
    const fullTarget = await prisma.conversation.findFirst({
      where: { id: targetConvoId, userId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (fullTarget) {
      activeConversation = {
        id: fullTarget.id,
        title: fullTarget.title,
        createdAt: fullTarget.createdAt,
        updatedAt: fullTarget.updatedAt,
        messages: fullTarget.messages.map((m) => {
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
        }),
      };
    }
  }

  const conversationSummaries = conversations.map((c) => ({
    id: c.id,
    title: c.title || 'Untitled conversation',
    createdAt: c.createdAt,
    updatedAt: c.updatedAt,
    messageCount: c._count.messages,
    preview: c.messages[0]?.content ? c.messages[0].content.slice(0, 80) : '',
  }));

  return NextResponse.json({
    user,
    conversations: conversationSummaries,
    activeConversation,
  });
}

const createSchema = z.object({
  userId: z.string(),
  title: z.string().optional(),
});

/**
 * POST /api/chat/conversations
 * Explicitly initializes a fresh conversation thread for the user.
 */
export async function POST(req: NextRequest) {
  const json = await req.json();
  const parsed = createSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { userId, title } = parsed.data;

  const conversation = await prisma.conversation.create({
    data: {
      userId,
      title: title ?? 'New Conversation',
    },
  });

  return NextResponse.json({
    conversation: {
      id: conversation.id,
      title: conversation.title,
      createdAt: conversation.createdAt,
      updatedAt: conversation.updatedAt,
      messages: [],
    },
  });
}
