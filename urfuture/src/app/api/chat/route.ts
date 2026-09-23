import { NextRequest } from 'next/server';
import { z } from 'zod';
import { streamChat, LLM_MODEL } from '@/lib/llm';
import { BASE_SYSTEM_PROMPT } from '@/lib/prompts';
import { prisma } from '@/lib/db';
import { containsHighStakesSignal } from '@/lib/guardrails';
import { retrieveRelevantContext } from '@/lib/rag';
import type { Prisma } from '@prisma/client';

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
 *
 * RAG: embeds the user query via Voyage AI, retrieves relevant knowledge
 * chunks from pgvector, and injects them into the system prompt.
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

  // RAG retrieval: pull grounding context relevant to the user's latest
  // message from ingested NEA/ILOSTAT/university-curriculum chunks (see
  // src/lib/rag.ts + scripts/ingest-knowledge.ts). Retrieval failures
  // degrade gracefully to no context rather than failing the chat request.
  const { contextText, citations: ragCitations } = await retrieveRelevantContext(message);

  const system = [
    BASE_SYSTEM_PROMPT,
    contextText
      ? `\nRETRIEVED KNOWLEDGE BASE CONTEXT (cite these as [source] when you use them; do not cite a source that isn't listed here):\n${contextText}`
      : '',
    highStakes
      ? '\n\nNOTE: This message appears to involve a high-stakes academic/career transition. Follow the HIGH-STAKES FLAG guardrail exactly.'
      : '',
  ].join('');

  const encoder = new TextEncoder();
  let fullText = '';
  const toolCallsTrace: unknown[] = [];

  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: string, data: unknown) => {
        controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
      };

      try {
        const chatStream = streamChat({
          system,
          messages: history.map((m) => ({
            role: m.role === 'ASSISTANT' ? 'assistant' as const : 'user' as const,
            content: m.content,
          })),
        });

        for await (const event of chatStream) {
          if (event.type === 'text' && event.delta) {
            fullText += event.delta;
            send('token', { delta: event.delta });
          } else if (event.type === 'tool_call' && event.toolCall) {
            toolCallsTrace.push(event.toolCall);
            send('tool_call', { tool: event.toolCall.tool, input: event.toolCall.input });
          }
          // 'done' event is handled after loop
        }

        await prisma.message.create({
          data: {
            conversationId: conversationId!,
            role: 'ASSISTANT',
            content: fullText,
            toolCalls: toolCallsTrace.length ? JSON.stringify(toolCallsTrace) : undefined,
            // Persist the RAG citations available to the model for this
            // turn (chunk-level source/reference/claim), independent of
            // whether the model's prose explicitly referenced all of them —
            // this keeps an auditable record of what grounding context was
            // actually in play, per the citation-contract requirement.
            citations: ragCitations.length ? (ragCitations as unknown as Prisma.InputJsonValue) : undefined,
          },
        });

        send('done', { conversationId, model: LLM_MODEL, citations: ragCitations });
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