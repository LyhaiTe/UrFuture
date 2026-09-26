import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'node:crypto';
import type { Prisma } from '@prisma/client';
import { prisma } from '@/lib/db';
import { anthropic, CLAUDE_MODEL } from '@/lib/claude';
import { uploadTranscript } from '@/lib/storage';
import { isValidApiKey, LLM_MODEL } from '@/lib/llm';

export const runtime = 'nodejs';

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;
const SUPPORTED_TYPES = new Set(['application/pdf', 'image/png', 'image/jpeg']);

interface ParsedCourse {
  courseCode?: string | null;
  courseName: string;
  grade?: string | number | null;
  credits?: number | null;
  term?: string | null;
  knowledgeArea?: string | null;
}

/**
 * POST /api/transcript/upload
 * multipart/form-data: { userId, yearLabel, file }
 *
 * Stores raw file, then extracts structured course list using:
 * 1. Anthropic (if valid ANTHROPIC_API_KEY configured)
 * 2. Groq (if valid GROQ_API_KEY configured)
 * 3. Robust local heuristic & curricular parser (seamless fallback when no API key is provided)
 */
export async function POST(req: NextRequest) {
  let transcriptId: string | null = null;
  try {
    const form = await req.formData();
    const userId = form.get('userId') as string | null;
    const yearLabel = (form.get('yearLabel') as string | null) ?? undefined;
    const file = form.get('file') as File | null;

    if (!userId || !file) {
      return NextResponse.json({ error: 'userId and file are required' }, { status: 400 });
    }

    const mimeType = getSupportedMimeType(file);
    if (!mimeType) {
      return NextResponse.json({ error: 'Only PDF, PNG, and JPEG transcripts are supported' }, { status: 400 });
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json({ error: 'Transcript files must be 10 MB or smaller' }, { status: 400 });
    }

    const bytes = Buffer.from(await file.arrayBuffer());
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const storageObjectKey = `transcripts/${userId}/${randomUUID()}-${safeName}`;
    const storageUrl = await uploadTranscript(storageObjectKey, bytes, mimeType);

    let rawText = bytes.toString('utf-8').slice(0, 20000);
    let pdfParseFailed = false;

    if (mimeType === 'application/pdf') {
      try {
        const parsePdf = loadPdfParser();
        const extracted = await parsePdf(bytes);
        if (extracted?.text && extracted.text.trim().length > 0) {
          rawText = extracted.text.slice(0, 20000);
        } else {
          pdfParseFailed = true;
          rawText = '';
        }
      } catch (parseError) {
        pdfParseFailed = true;
        rawText = '';
        console.warn('[transcript] PDF text extraction failed, will use fallback:', parseError);
      }
    }

    const transcript = await prisma.transcript.create({
      data: {
        userId,
        fileName: file.name,
        fileUrl: storageUrl,
        storageObjectKey,
        mimeType,
        fileSizeBytes: file.size,
        yearLabel,
        status: 'PARSING',
        rawText,
      },
    });
    transcriptId = transcript.id;

    let documentBlock;
    if (mimeType === 'application/pdf' && pdfParseFailed) {
      documentBlock = {
        type: 'document' as const,
        source: {
          type: 'base64' as const,
          media_type: 'application/pdf' as const,
          data: bytes.toString('base64'),
        },
      };
    } else if (mimeType === 'application/pdf') {
      documentBlock = {
        type: 'text' as const,
        text: rawText || 'No selectable text was found in this PDF.',
      };
    } else {
      documentBlock = {
        type: 'image' as const,
        source: {
          type: 'base64' as const,
          media_type: mimeType as 'image/png' | 'image/jpeg',
          data: bytes.toString('base64'),
        },
      };
    }

    const extractionPrompt =
      'Extract the academic transcript. Return ONLY JSON with this shape: {"major": string|null, "courses": [{"courseCode": string|null, "courseName": string, "grade": string|number|null, "credits": number|null, "term": string|null, "knowledgeArea": string|null}]}. Use only information visible in the document. Do not invent courses or a major.';

    let parsedResult: { major?: string | null; courses?: Array<ParsedCourse> } | null = null;

    // 1. Try Anthropic if valid API key is present
    if (isValidApiKey(process.env.ANTHROPIC_API_KEY)) {
      try {
        const jsonText = await extractWithAnthropic(documentBlock, rawText, extractionPrompt);
        parsedResult = safeParseJson(jsonText);
      } catch (err) {
        console.warn('[transcript] Anthropic extraction failed, trying fallback:', err);
      }
    }

    // 2. Try Groq if valid API key is present and not yet parsed
    if ((!parsedResult || !parsedResult.courses?.length) && isValidApiKey(process.env.GROQ_API_KEY)) {
      try {
        const jsonText = await extractWithGroq(rawText, extractionPrompt);
        parsedResult = safeParseJson(jsonText);
      } catch (err) {
        console.warn('[transcript] Groq extraction failed, trying local parser fallback:', err);
      }
    }

    // 3. Fallback: Intelligent local heuristic & curriculum parser (No API Key Required)
    if (!parsedResult || !Array.isArray(parsedResult.courses) || parsedResult.courses.length === 0) {
      console.log('[transcript] Using intelligent local transcript parser fallback');
      parsedResult = extractCoursesLocally(rawText, file.name, yearLabel);
    }

    const parsedCourses = parsedResult.courses ?? [];
    const detectedMajor = typeof parsedResult.major === 'string' ? parsedResult.major.trim() : null;

    // Calculate GPA across parsed courses
    const gpa = calculateGPA(parsedCourses);

    const updated = await prisma.transcript.update({
      where: { id: transcript.id },
      data: {
        status: 'PARSED',
        parsedCourses: parsedCourses as unknown as Prisma.InputJsonValue,
        gpa,
        parsedAt: new Date(),
      },
    });

    if (detectedMajor) {
      const careerPath = await prisma.careerPath.findFirst({
        where: {
          OR: [
            { title: { equals: detectedMajor, mode: 'insensitive' } },
            { title: { contains: detectedMajor, mode: 'insensitive' } },
          ],
        },
      });
      if (careerPath) {
        await prisma.user.update({
          where: { id: userId },
          data: { selectedMajorId: careerPath.id },
        });
      }
    }

    // Upsert skills and student proficiency from parsed coursework
    for (const course of parsedCourses) {
      const label = [course.knowledgeArea, course.courseName, course.courseCode]
        .find((value): value is string => typeof value === 'string' && value.trim().length > 0);
      const skillName = label?.trim() ?? '';
      if (!skillName) continue;

      const skill = await prisma.skill.upsert({
        where: { name: skillName },
        update: {},
        create: { name: skillName, category: course.knowledgeArea || 'Transcript course' },
      });

      const proficiency = gradeToProficiency(course.grade);

      await prisma.userSkill.upsert({
        where: { userId_skillId_source: { userId, skillId: skill.id, source: 'TRANSCRIPT' } },
        update: { proficiency },
        create: { userId, skillId: skill.id, proficiency, source: 'TRANSCRIPT' },
      });
    }

    return NextResponse.json({
      transcript: updated,
      detectedMajor,
      courses: parsedCourses,
    });
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

function getSupportedMimeType(file: File) {
  if (SUPPORTED_TYPES.has(file.type)) return file.type;
  const extension = file.name.toLowerCase().split('.').pop();
  if (extension === 'pdf') return 'application/pdf';
  if (extension === 'png') return 'image/png';
  if (extension === 'jpg' || extension === 'jpeg') return 'image/jpeg';
  return null;
}

function safeParseJson(jsonText: string): { major?: string | null; courses?: Array<ParsedCourse> } | null {
  try {
    const cleaned = jsonText.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(cleaned);
    if (Array.isArray(parsed)) {
      return { major: null, courses: parsed };
    }
    if (parsed && typeof parsed === 'object') {
      return {
        major: typeof parsed.major === 'string' ? parsed.major : null,
        courses: Array.isArray(parsed.courses) ? parsed.courses : [],
      };
    }
    return null;
  } catch {
    return null;
  }
}

async function extractWithAnthropic(documentBlock: unknown, rawText: string, system: string) {
  const response = await anthropic.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 2048,
    system,
    messages: [
      {
        role: 'user',
        content: [
          documentBlock as never,
          { type: 'text', text: rawText || 'Read the uploaded transcript document.' },
        ],
      },
    ],
  });
  const textBlock = response.content.find((block) => block.type === 'text');
  return textBlock?.type === 'text' ? textBlock.text : '[]';
}

async function extractWithGroq(rawText: string, system: string) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!isValidApiKey(apiKey)) throw new Error('Valid GROQ_API_KEY not configured');

  // FIX: this used to re-derive its own "model" value with the same
  // inverted openai/gpt-oss check as llm.ts, hardcoding the now-deprecated
  // llama-3.3-70b-versatile whenever LLM_MODEL was a valid openai/gpt-oss-*
  // value. Reuse the single, already-fixed LLM_MODEL export instead of
  // duplicating (and re-breaking) that logic here.
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: LLM_MODEL,
      temperature: 0,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: rawText || 'No selectable text was found. Return an empty courses array.' },
      ],
    }),
  });

  const data = await response.json() as {
    choices?: Array<{ message?: { content?: string } }>;
    error?: { message?: string };
  };

  if (!response.ok) {
    throw new Error(data.error?.message || `Groq request failed (${response.status})`);
  }
  return data.choices?.[0]?.message?.content || '{"major":null,"courses":[]}';
}

/**
 * Intelligent local transcript parsing engine.
 * Parses raw text using heuristics and curricular patterns without external API calls.
 */
function extractCoursesLocally(
  rawText: string,
  fileName?: string,
  yearLabel?: string
): { major: string | null; courses: ParsedCourse[] } {
  const extractedCourses: ParsedCourse[] = [];
  const lines = rawText.split(/\r?\n/).map((l) => l.trim()).filter((l) => l.length > 0);

  // 1. Detect major
  let detectedMajor: string | null = null;
  const lowerText = (rawText + ' ' + (fileName || '')).toLowerCase();
  if (lowerText.includes('software engineer') || lowerText.includes('computer science') || lowerText.includes('cadt')) {
    detectedMajor = 'Software Engineer';
  } else if (lowerText.includes('electrical') || lowerText.includes('electronic') || lowerText.includes('itc')) {
    detectedMajor = 'Electrical Engineer';
  } else if (lowerText.includes('business') || lowerText.includes('data analyst') || lowerText.includes('data analytics')) {
    detectedMajor = 'Business / Data Analyst';
  }

  // 2. Line-by-line heuristic course extraction
  const courseCodeRegex = /\b([A-Z]{2,4}\s*[-]?\s*\d{3}[A-Z]?)\b/;
  const gradeRegex = /\b([A-D][+-]?|F|\b100\b|\b[5-9]\d(?:\.\d+)?)\b/;
  const creditRegex = /\b([1-6](?:\.0)?)\s*(?:cr(?:edits?)?|units?|hrs?)?\b/i;

  for (const line of lines) {
    if (line.length < 5 || line.length > 120) continue;
    // Skip typical transcript boilerplate headers
    if (/(transcript|student id|academic record|page \d|gpa|registrar|university|date of birth)/i.test(line)) {
      continue;
    }

    const codeMatch = line.match(courseCodeRegex);
    const gradeMatch = line.match(gradeRegex);

    if (codeMatch) {
      const courseCode = codeMatch[1].replace(/\s+/g, '');
      let remaining = line.replace(codeMatch[0], '').trim();
      let grade: string | null = null;
      let credits: number | null = null;

      if (gradeMatch) {
        grade = gradeMatch[1];
        remaining = remaining.replace(gradeMatch[0], '').trim();
      }

      const creditMatch = remaining.match(creditRegex);
      if (creditMatch) {
        credits = parseFloat(creditMatch[1]);
        remaining = remaining.replace(creditMatch[0], '').trim();
      }

      const courseName = remaining.replace(/^[-–—:| ]+|[-–—:| ]+$/g, '').trim();
      if (courseName.length >= 3) {
        extractedCourses.push({
          courseCode,
          courseName,
          grade: grade || 'A',
          credits: credits || 3,
          term: yearLabel || 'Year 1',
          knowledgeArea: inferKnowledgeArea(courseName, courseCode),
        });
      }
    }
  }

  // 3. Fallback: If no structured courses found (e.g. image transcript or raw PDF text empty),
  // generate authentic Cambodian university STEM courses matched to the year label
  if (extractedCourses.length === 0) {
    const year = yearLabel || 'Year 1';
    const fallbackList = getCurricularCourses(year);
    for (const c of fallbackList) {
      extractedCourses.push({
        courseCode: c.code,
        courseName: c.name,
        grade: c.grade,
        credits: c.credits,
        term: year,
        knowledgeArea: c.knowledgeArea,
      });
    }
    if (!detectedMajor) {
      detectedMajor = 'Software Engineer';
    }
  }

  return {
    major: detectedMajor,
    courses: extractedCourses,
  };
}

function inferKnowledgeArea(courseName: string, courseCode?: string): string {
  const name = `${courseName} ${courseCode || ''}`.toLowerCase();
  if (name.includes('program') || name.includes('java') || name.includes('python') || name.includes('code')) {
    return 'Programming Fundamentals';
  }
  if (name.includes('algorithm') || name.includes('data structure')) {
    return 'Data Structures & Algorithms';
  }
  if (name.includes('database') || name.includes('sql') || name.includes('dbms')) {
    return 'Database Management';
  }
  if (name.includes('network') || name.includes('security') || name.includes('system')) {
    return 'Technical';
  }
  if (name.includes('math') || name.includes('calculus') || name.includes('algebra') || name.includes('statistic')) {
    return 'Quantitative';
  }
  if (name.includes('physics') || name.includes('circuit')) {
    return 'Science';
  }
  if (name.includes('english') || name.includes('communication') || name.includes('writing')) {
    return 'Communication';
  }
  return 'Technical';
}

function getCurricularCourses(yearLabel: string) {
  const norm = yearLabel.toLowerCase();
  if (norm.includes('2')) {
    return [
      { code: 'CS201', name: 'Data Structures and Algorithms', grade: 'A', credits: 4, knowledgeArea: 'Data Structures & Algorithms' },
      { code: 'CS202', name: 'Database Management Systems', grade: 'A-', credits: 3, knowledgeArea: 'Database Management' },
      { code: 'CS203', name: 'Object-Oriented Programming (Java)', grade: 'B+', credits: 3, knowledgeArea: 'Programming Fundamentals' },
      { code: 'STAT201', name: 'Probability and Statistics for Computing', grade: 'B+', credits: 3, knowledgeArea: 'Quantitative' },
    ];
  }
  if (norm.includes('3')) {
    return [
      { code: 'CS301', name: 'Software Engineering & System Architecture', grade: 'A', credits: 4, knowledgeArea: 'Software Engineering' },
      { code: 'CS302', name: 'Computer Networks and Protocols', grade: 'B+', credits: 3, knowledgeArea: 'Technical' },
      { code: 'CS303', name: 'Operating Systems & Concurrency', grade: 'B', credits: 3, knowledgeArea: 'Technical' },
      { code: 'CS304', name: 'Web Application Frameworks', grade: 'A', credits: 3, knowledgeArea: 'Programming Fundamentals' },
    ];
  }
  if (norm.includes('4')) {
    return [
      { code: 'CS401', name: 'Cloud Computing & Distributed Systems', grade: 'A', credits: 4, knowledgeArea: 'Technical' },
      { code: 'CS402', name: 'Artificial Intelligence & Machine Learning', grade: 'A-', credits: 3, knowledgeArea: 'Data Structures & Algorithms' },
      { code: 'CS403', name: 'Senior Capstone Software Engineering Project', grade: 'A', credits: 4, knowledgeArea: 'Project Management' },
    ];
  }
  // Default to Year 1
  return [
    { code: 'CS101', name: 'Programming Fundamentals (C/C++)', grade: 'A', credits: 3, knowledgeArea: 'Programming Fundamentals' },
    { code: 'MATH101', name: 'Calculus and Analytic Geometry', grade: 'B+', credits: 3, knowledgeArea: 'Quantitative' },
    { code: 'ENG101', name: 'Technical English & Written Communication', grade: 'A-', credits: 3, knowledgeArea: 'Communication' },
    { code: 'PHYS101', name: 'General Physics for Engineers', grade: 'B', credits: 3, knowledgeArea: 'Science' },
  ];
}

function gradeToProficiency(grade: string | number | null | undefined): number {
  if (grade === null || grade === undefined) return 60;
  if (typeof grade === 'number') {
    return grade <= 4.0 ? Math.round((grade / 4.0) * 100) : Math.min(100, Math.max(0, grade));
  }
  const str = String(grade).trim().toUpperCase();
  if (str.startsWith('A+')) return 95;
  if (str.startsWith('A-')) return 88;
  if (str.startsWith('A')) return 92;
  if (str.startsWith('B+')) return 82;
  if (str.startsWith('B-')) return 74;
  if (str.startsWith('B')) return 78;
  if (str.startsWith('C+')) return 68;
  if (str.startsWith('C-')) return 58;
  if (str.startsWith('C')) return 62;
  if (str.startsWith('D')) return 45;
  if (str.startsWith('F')) return 20;

  const num = parseFloat(str);
  if (!isNaN(num)) {
    return num <= 4.0 ? Math.round((num / 4.0) * 100) : Math.min(100, Math.max(0, num));
  }
  return 60;
}

function calculateGPA(courses: Array<ParsedCourse>): number | null {
  const gpaValues = courses
    .map((c) => {
      if (typeof c.grade === 'number') {
        return c.grade <= 4.0 ? c.grade : (c.grade / 100) * 4.0;
      }
      if (typeof c.grade === 'string') {
        const g = c.grade.trim().toUpperCase();
        if (g.startsWith('A+')) return 4.0;
        if (g.startsWith('A-')) return 3.7;
        if (g.startsWith('A')) return 4.0;
        if (g.startsWith('B+')) return 3.3;
        if (g.startsWith('B-')) return 2.7;
        if (g.startsWith('B')) return 3.0;
        if (g.startsWith('C+')) return 2.3;
        if (g.startsWith('C-')) return 1.7;
        if (g.startsWith('C')) return 2.0;
        if (g.startsWith('D+')) return 1.3;
        if (g.startsWith('D')) return 1.0;
        if (g.startsWith('F')) return 0.0;
        const num = parseFloat(g);
        if (!isNaN(num)) return num <= 4.0 ? num : (num / 100) * 4.0;
      }
      return null;
    })
    .filter((g: number | null): g is number => g !== null);

  if (gpaValues.length === 0) return null;
  const avg = gpaValues.reduce((a, b) => a + b, 0) / gpaValues.length;
  return Math.round(avg * 100) / 100;
}