import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'node:crypto';
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
  const form = await req.formData();
  const userId = form.get('userId') as string | null;
  const yearLabel = (form.get('yearLabel') as string | null) ?? undefined;
  const file = form.get('file') as File | null;

  if (!userId || !file) {
    return NextResponse.json({ error: 'userId and file are required' }, { status: 400 });
  }

  if (!SUPPORTED_TYPES.has(file.type)) {
    return NextResponse.json({ error: 'Only PDF, PNG, and JPEG transcripts are supported' }, { status: 400 });
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return NextResponse.json({ error: 'Transcript files must be 10 MB or smaller' }, { status: 400 });
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const storageObjectKey = `transcripts/${userId}/${randomUUID()}-${safeName}`;
  const storageUrl = await uploadTranscript(storageObjectKey, bytes, file.type);

  const rawText = bytes.toString('utf-8').slice(0, 20000); // best-effort for text/CSV transcripts

  const transcript = await prisma.transcript.create({
    data: {
      userId,
      fileName: file.name,
      fileUrl: storageUrl,
      storageObjectKey,
      mimeType: file.type,
      fileSizeBytes: file.size,
      yearLabel,
      status: 'PARSING',
      rawText,
    },
  });

  try {
    const response = await anthropic.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 2048,
      system:
        'Extract a structured course list from this transcript text. Return ONLY a JSON array, no prose, of objects: {courseCode, courseName, grade, credits, term}. If a field is unavailable, use null. Do not invent courses not present in the text.',
      messages: [{ role: 'user', content: rawText || '(no extractable text found)' }],
    });
    const textBlock = response.content.find((b) => b.type === 'text');
    const jsonText = textBlock?.type === 'text' ? textBlock.text : '[]';
    const cleaned = jsonText.replace(/```json|```/g, '').trim();
    const parsedCourses = JSON.parse(cleaned);

    const gpaValues = parsedCourses
      .map((c: { grade?: string | number }) => (typeof c.grade === 'number' ? c.grade : null))
      .filter((g: number | null): g is number => g !== null);
    const gpa = gpaValues.length ? gpaValues.reduce((a: number, b: number) => a + b, 0) / gpaValues.length : null;

    const updated = await prisma.transcript.update({
      where: { id: transcript.id },
      data: { status: 'PARSED', parsedCourses, gpa, parsedAt: new Date() },
    });

    return NextResponse.json({ transcript: updated });
  } catch (err) {
    await prisma.transcript.update({ where: { id: transcript.id }, data: { status: 'FAILED' } });
    return NextResponse.json(
      { error: 'Parsing failed', detail: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
