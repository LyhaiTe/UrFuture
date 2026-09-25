import { NextRequest } from 'next/server';
import { z } from 'zod';
import { streamChat, LLM_MODEL } from '@/lib/llm';
import { BASE_SYSTEM_PROMPT } from '@/lib/prompts';
import { prisma } from '@/lib/db';
import { containsHighStakesSignal } from '@/lib/guardrails';
import { retrieveRelevantContext } from '@/lib/rag';
import { getStudentSkillContext, getParsedTranscripts } from '@/lib/knowledgeBase';
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
 * Enriches the prompt with the student's profile, GPA, coursework, and verified skills,
 * logs a CounselorReview on high-stakes signals, and embeds user queries for RAG retrieval.
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
    const convo = await prisma.conversation.create({
      data: {
        userId,
        title: message.length > 50 ? `${message.slice(0, 50).trim()}…` : message.trim(),
      },
    });
    conversationId = convo.id;
  }

  // Persist user message
  await prisma.message.create({
    data: { conversationId, role: 'USER', content: message },
  });

  // Fetch recent conversation history
  const history = await prisma.message.findMany({
    where: { conversationId },
    orderBy: { createdAt: 'asc' },
    take: 20,
  });

  // Check for high-stakes signal
  const highStakes = containsHighStakesSignal(message);
  if (highStakes) {
    try {
      await prisma.counselorReview.create({
        data: {
          studentId: userId,
          reason: `Chat signal detected: "${message.slice(0, 100)}${message.length > 100 ? '…' : ''}"`,
          status: 'PENDING',
          counselorNotes: 'Automatically flagged by UrFuture Copilot chat guardrail.',
        },
      });
    } catch (err) {
      console.warn('[chat] Failed to log high-stakes counselor review:', err);
    }
  }
  const [user, skills, transcripts] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        name: true,
        educationLevel: true,
        university: true,
        institution: true,
        graduationYear: true,
        selectedMajor: { select: { title: true } },
      },
    }),
    getStudentSkillContext(userId),
    getParsedTranscripts(userId),
  ]);

  // Compute GPA and courses list
  const gpaValues = transcripts.map((t) => t.gpa).filter((g): g is number => typeof g === 'number' && !isNaN(g));
  const avgGpa = gpaValues.length > 0 ? (gpaValues.reduce((a, b) => a + b, 0) / gpaValues.length).toFixed(2) : null;
  const gpaText = avgGpa ? `${avgGpa} / 4.0` : 'Not recorded';

  const coursesList: string[] = [];
  for (const t of transcripts) {
    if (Array.isArray(t.parsedCourses)) {
      for (const c of t.parsedCourses as {
        courseCode?: string;
        courseName?: string;
        grade?: string | number;
        credits?: number;
      }[]) {
        if (c && c.courseName) {
          const parts = [
            c.courseCode ? `${c.courseCode}: ` : '',
            c.courseName,
            c.grade !== undefined && c.grade !== null ? ` (Grade: ${c.grade})` : '',
            c.credits ? ` [${c.credits} cr]` : '',
            t.yearLabel ? ` - ${t.yearLabel}` : '',
          ];
          coursesList.push(parts.join(''));
        }
      }
    }
  }

  const topSkillsList = skills.length > 0
    ? skills.slice(0, 12).map((s) => `${s.skill.name} (${s.proficiency}%, ${s.source})`).join(', ')
    : 'No verified skills on file yet';

  const studentContext = [
    'STUDENT PROFILE & ACADEMIC CONTEXT:',
    `- Student Name: ${user?.name || 'Student'}`,
    `- Current Level: ${user?.educationLevel ?? 'University Student'} at ${user?.university || user?.institution || 'Cambodian University'}`,
    `- Target / Selected Major: ${user?.selectedMajor?.title ?? 'Undeclared'}`,
    `- Cumulative GPA: ${gpaText}`,
    `- Top Verified Skills: ${topSkillsList}`,
    coursesList.length > 0
      ? `- Courses Completed on Transcript (${coursesList.length} total):\n  ${coursesList.slice(0, 25).map((c) => `• ${c}`).join('\n  ')}`
      : '- Courses Completed on Transcript: None uploaded yet',
  ].join('\n');

  const { contextText, citations: ragCitations } = await retrieveRelevantContext(message);

  const system = [
    BASE_SYSTEM_PROMPT,
    `\n\n${studentContext}`,
    contextText
      ? `\n\nRETRIEVED KNOWLEDGE BASE CONTEXT (cite these as [source] when you use them; do not cite a source that isn't listed here):\n${contextText}`
      : '',
    highStakes
      ? '\n\nNOTE: This message appears to involve a high-stakes academic/career transition (e.g., dropping out, academic probation, major/faculty transfer). Follow the HIGH-STAKES FLAG guardrail: provide helpful grounded advice, explicitly remind the student that counselor review and official institution sign-off is required, and notify them that an advisor review ticket has been flagged for human support.'
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
        if (highStakes) {
          send('high_stakes_alert', {
            message: 'High-stakes transition detected. A counselor review has been queued for your guidance.',
          });
        }

        const chatStream = streamChat({
          system,
          messages: history.map((m) => ({
            role: m.role === 'ASSISTANT' ? ('assistant' as const) : ('user' as const),
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
        }

        await prisma.message.create({
          data: {
            conversationId: conversationId!,
            role: 'ASSISTANT',
            content: fullText,
            toolCalls: toolCallsTrace.length ? JSON.stringify(toolCallsTrace) : undefined,
            citations: ragCitations.length ? (ragCitations as unknown as Prisma.InputJsonValue) : undefined,
          },
        });

        // Touch conversation updatedAt
        await prisma.conversation.update({
          where: { id: conversationId },
          data: { updatedAt: new Date() },
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