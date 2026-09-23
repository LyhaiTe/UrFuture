import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'node:crypto';
import type { Prisma } from '@prisma/client';
import { prisma } from '@/lib/db';
import { anthropic, CLAUDE_MODEL } from '@/lib/claude';
import { uploadTranscript } from '@/lib/storage';

export const runtime = 'nodejs';

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;
const SUPPORTED_TYPES = new Set(['application/pdf', 'image/png', 'image/jpeg']);

/**
 * POST /api/transcript/upload
 * multipart/form-data: { userId, yearLabel, file }
 *
 * Stores the raw file in Google Cloud Storage, then asks Claude to extract a structured course list
 * (courseCode, courseName, grade, credits, term) from the raw text. This
 * parsed list is what later feeds quiz generation and skill inference —
 * directly implementing the sticky-note request: "upload all the classes
 * we took from year 1-4".
 */
export async function POST(req: NextRequest) {
  let transcriptId: string | null = null;
  try {
    const form = await req.formData();
    const userId = form.get('userId') as string | null;
    const yearLabel = (form.get('yearLabel') as string | null) ?? undefined;
    const file = form.get('file') as File | null;

    if (!userId || !file) return NextResponse.json({ error: 'userId and file are required' }, { status: 400 });
    if (!SUPPORTED_TYPES.has(file.type)) return NextResponse.json({ error: 'Only PDF, PNG, and JPEG transcripts are supported' }, { status: 400 });
    if (file.size > MAX_FILE_SIZE_BYTES) return NextResponse.json({ error: 'Transcript files must be 10 MB or smaller' }, { status: 400 });

    const bytes = Buffer.from(await file.arrayBuffer());
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const storageObjectKey = `transcripts/${userId}/${randomUUID()}-${safeName}`;
    const storageUrl = await uploadTranscript(storageObjectKey, bytes, file.type);
    let rawText = bytes.toString('utf-8').slice(0, 20000);
    if (file.type === 'application/pdf') {
      const parsePdf = loadPdfParser();
      const extracted = await parsePdf(bytes);
      rawText = extracted.text.slice(0, 20000);
    }

    const transcript = await prisma.transcript.create({
      data: { userId, fileName: file.name, fileUrl: storageUrl, storageObjectKey, mimeType: file.type, fileSizeBytes: file.size, yearLabel, status: 'PARSING', rawText },
    });
    transcriptId = transcript.id;

    const documentBlock = file.type === 'application/pdf'
      ? { type: 'text' as const, text: rawText || 'No selectable text was found in this PDF.' }
      : { type: 'image' as const, source: { type: 'base64' as const, media_type: file.type as 'image/png' | 'image/jpeg', data: bytes.toString('base64') } };
    const extractionPrompt = 'Extract the academic transcript. Return ONLY JSON with this shape: {"major": string|null, "courses": [{"courseCode": string|null, "courseName": string, "grade": string|number|null, "credits": number|null, "term": string|null, "knowledgeArea": string|null}]}. Use only information visible in the document. Do not invent courses or a major.';
    const jsonText = process.env.ANTHROPIC_API_KEY
      ? await extractWithAnthropic(documentBlock, rawText, extractionPrompt)
      : await extractWithGroq(rawText, extractionPrompt);
    const cleaned = jsonText.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(cleaned) as { major?: string | null; courses?: Array<Record<string, unknown>> };
    const parsedCourses: Array<Record<string, unknown>> = Array.isArray(parsed) ? parsed : (parsed.courses ?? []);
    const detectedMajor = typeof parsed.major === 'string' ? parsed.major.trim() : null;

    const gpaValues = parsedCourses
      .map((c: { grade?: string | number }) => (typeof c.grade === 'number' ? c.grade : null))
      .filter((g: number | null): g is number => g !== null);
    const gpa = gpaValues.length ? gpaValues.reduce((a: number, b: number) => a + b, 0) / gpaValues.length : null;

    const updated = await prisma.transcript.update({
      where: { id: transcript.id },
      data: { status: 'PARSED', parsedCourses: parsedCourses as Prisma.InputJsonValue, gpa, parsedAt: new Date() },
    });

    if (detectedMajor) {
      const careerPath = await prisma.careerPath.findUnique({ where: { title: detectedMajor } });
      if (careerPath) await prisma.user.update({ where: { id: userId }, data: { selectedMajorId: careerPath.id } });
    }

    for (const course of parsedCourses) {
      const label = [course.knowledgeArea, course.courseName, course.courseCode]
        .find((value): value is string => typeof value === 'string' && value.trim().length > 0);
      const skillName = label?.trim() ?? '';
      if (!skillName) continue;
      const skill = await prisma.skill.upsert({ where: { name: skillName }, update: {}, create: { name: skillName, category: 'Transcript course' } });
      const grade = typeof course.grade === 'string' || typeof course.grade === 'number' ? String(course.grade).toUpperCase() : '';
      let proficiency = 50;
      if (grade.startsWith('A')) proficiency = 90;
      else if (grade.startsWith('B')) proficiency = 75;
      else if (grade.startsWith('C')) proficiency = 60;
      else if (grade.startsWith('D')) proficiency = 45;
      await prisma.userSkill.upsert({
        where: { userId_skillId_source: { userId, skillId: skill.id, source: 'TRANSCRIPT' } },
        update: { proficiency },
        create: { userId, skillId: skill.id, proficiency, source: 'TRANSCRIPT' },
      });
    }

    return NextResponse.json({ transcript: updated, detectedMajor, courses: parsedCourses });
  } catch (err) {
    if (transcriptId) {
      await prisma.transcript.update({ where: { id: transcriptId }, data: { status: 'FAILED' } }).catch(() => undefined);
    }
    console.error('Transcript upload failed:', err);
    return NextResponse.json(
      { error: 'Transcript processing failed', detail: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}

function loadPdfParser() {
  const runtimeRequire = eval('require') as (moduleName: string) => (data: Buffer) => Promise<{ text: string }>;
  return runtimeRequire('pdf-parse/lib/pdf-parse.js');
}

async function extractWithAnthropic(documentBlock: unknown, rawText: string, system: string) {
  const response = await anthropic.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 2048,
    system,
    messages: [{ role: 'user', content: [documentBlock as never, { type: 'text', text: rawText || 'Read the uploaded transcript document.' }] }],
  });
  const textBlock = response.content.find((block) => block.type === 'text');
  return textBlock?.type === 'text' ? textBlock.text : '[]';
}

async function extractWithGroq(rawText: string, system: string) {
  if (!process.env.GROQ_API_KEY) throw new Error('Configure ANTHROPIC_API_KEY or GROQ_API_KEY in .env');
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.GROQ_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: process.env.LLM_MODEL || 'openai/gpt-oss-20b',
      temperature: 0,
      response_format: { type: 'json_object' },
      messages: [{ role: 'system', content: system }, { role: 'user', content: rawText || 'No selectable text was found. Return an empty courses array.' }],
    }),
  });
  const data = await response.json() as { choices?: Array<{ message?: { content?: string } }>; error?: { message?: string } };
  if (!response.ok) throw new Error(data.error?.message || `Groq request failed (${response.status})`);
  return data.choices?.[0]?.message?.content || '{"major":null,"courses":[]}';
}
