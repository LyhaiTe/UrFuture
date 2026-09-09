import { NextRequest } from 'next/server';
import { z } from 'zod';
import { streamChat, CLAUDE_MODEL } from '@/lib/claude';
import { BASE_SYSTEM_PROMPT } from '@/lib/prompts';
import { prisma } from '@/lib/db';
import { containsHighStakesSignal } from '@/lib/guardrails';

export const runtime = 'nodejs';

const bodySchema = z.object({
  userId: z.string(),
  conversationId: z.string().optional(),
  message: z.string().min(1),
});

/**
 * POST /api/chat
 * Streams the assistant's reply back as Server-Sent Events so the frontend
 * ChatPanel can render tokens in real time. Persists both the user message
 * and the final assistant message to the Conversation/Message tables.
 */
export async function POST(req: NextRequest) {
  const json = await req.json();
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return new Response(JSON.stringify({ error: parsed.error.flatten() }), { status: 400 });
  }
  const { userId, message } = parsed.data;

  let conversationId = parsed.data.conversationId;
  if (!conversationId) {
    const convo = await prisma.conversation.create({ data: { userId, title: message.slice(0, 60) } });
    conversationId = convo.id;
  }

  await prisma.message.create({
    data: { conversationId, role: 'USER', content: message },
  });

  const history = await prisma.message.findMany({
    where: { conversationId },
    orderBy: { createdAt: 'asc' },
    take: 20,
  });

  const highStakes = containsHighStakesSignal(message);
  const system = highStakes
    ? `${BASE_SYSTEM_PROMPT}\n\nNOTE: This message appears to involve a high-stakes academic/career transition. Follow the HIGH-STAKES FLAG guardrail exactly.`
    : BASE_SYSTEM_PROMPT;

  const encoder = new TextEncoder();
  let fullText = '';
  let toolCallsTrace: unknown[] = [];

  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: string, data: unknown) => {
        controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
      };

      try {
        const claudeStream = streamChat({
          system,
          messages: history.map((m) => ({
            role: m.role === 'ASSISTANT' ? 'assistant' : 'user',
            content: m.content,
          })),
        });

        claudeStream.on('text', (delta) => {
          fullText += delta;
          send('token', { delta });
        });

        claudeStream.on('contentBlock', (block) => {
          if (block.type === 'tool_use') {
            toolCallsTrace.push({ tool: block.name, input: block.input });
            send('tool_call', { tool: block.name, input: block.input });
          }
        });

        await claudeStream.finalMessage();

        await prisma.message.create({
          data: {
            conversationId: conversationId!,
            role: 'ASSISTANT',
            content: fullText,
            toolCalls: toolCallsTrace.length ? JSON.stringify(toolCallsTrace) : undefined,
          },
        });

        send('done', { conversationId, model: CLAUDE_MODEL });
        controller.close();
      } catch (err) {
        send('error', { message: err instanceof Error ? err.message : 'Unknown error' });
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}
