import { NextRequest, NextResponse } from 'next/server';
import {
  createHash,
  randomUUID,
} from 'node:crypto';
import type { Prisma } from '@prisma/client';
import { prisma } from '@/lib/db';
import {
  anthropic,
  CLAUDE_MODEL,
} from '@/lib/claude';
import { uploadTranscript } from '@/lib/storage';
import {
  isValidApiKey,
  LLM_MODEL,
} from '@/lib/llm';
import { getAuthenticatedStudent } from '@/lib/studentSession';

export const runtime = 'nodejs';

const MAX_FILE_SIZE_BYTES =
  10 * 1024 * 1024;

const PARSER_VERSION = 'transcript-v1';

const SUPPORTED_TYPES = new Set([
  'application/pdf',
  'image/png',
  'image/jpeg',
]);

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
 *
 * multipart/form-data:
 * {
 *   yearLabel,
 *   file
 * }
 *
 * Student identity is derived from the
 * verified server session.
 */
export async function GET(req: NextRequest) {
  try {
    const student = await getAuthenticatedStudent(req);

    if (!student) {
      return NextResponse.json(
        { error: 'Unauthenticated' },
        { status: 401 }
      );
    }

    const [transcripts, transcriptSkills, user] =
      await Promise.all([
        prisma.transcript.findMany({
          where: {
            userId: student.id,
            status: 'PARSED',
          },
          orderBy: {
            uploadedAt: 'asc',
          },
          select: {
            id: true,
            fileName: true,
            yearLabel: true,
            parsedCourses: true,
            gpa: true,
            parsedAt: true,
          },
        }),
        prisma.userSkill.findMany({
          where: {
            userId: student.id,
            source: 'TRANSCRIPT',
          },
          include: {
            skill: {
              select: {
                name: true,
              },
            },
          },
          orderBy: {
            skill: {
              name: 'asc',
            },
          },
        }),
        prisma.user.findUnique({
          where: {
            id: student.id,
          },
          select: {
            selectedMajor: {
              select: {
                title: true,
              },
            },
          },
        }),
      ]);

    return NextResponse.json({
      transcripts,
      courses: transcripts.flatMap((transcript) =>
        Array.isArray(transcript.parsedCourses)
          ? transcript.parsedCourses
          : []
      ),
      skills: transcriptSkills.map((userSkill) => ({
        name: userSkill.skill.name,
        proficiency: userSkill.proficiency,
        source: userSkill.source,
      })),
      detectedMajor: user?.selectedMajor?.title ?? null,
    });
  } catch (error) {
    console.error('Could not load saved transcripts:', error);
    return NextResponse.json(
      { error: 'Could not load saved transcripts' },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest
) {
  let transcriptId: string | null = null;

  try {
    // --------------------------------------------------
    // 1. Authenticate student
    // --------------------------------------------------

    const student =
      await getAuthenticatedStudent(req);

    if (!student) {
      return NextResponse.json(
        { error: 'Unauthenticated' },
        { status: 401 }
      );
    }

    const userId = student.id;

    // --------------------------------------------------
    // 2. Read upload
    // --------------------------------------------------

    const form = await req.formData();

    const yearLabel =
      (form.get('yearLabel') as
        | string
        | null) ?? undefined;

    const file = form.get(
      'file'
    ) as File | null;

    if (!file) {
      return NextResponse.json(
        { error: 'File is required' },
        { status: 400 }
      );
    }

    // --------------------------------------------------
    // 3. Basic file validation
    // --------------------------------------------------

    if (file.size === 0) {
      return NextResponse.json(
        {
          error:
            'Transcript file cannot be empty',
        },
        { status: 400 }
      );
    }

    if (
      file.size > MAX_FILE_SIZE_BYTES
    ) {
      return NextResponse.json(
        {
          error:
            'Transcript files must be 10 MB or smaller',
        },
        { status: 400 }
      );
    }

    const bytes = Buffer.from(
      await file.arrayBuffer()
    );

    // --------------------------------------------------
    // 4. Validate actual file contents
    // --------------------------------------------------

    const detectedMimeType =
      detectMimeType(bytes);

    if (!detectedMimeType) {
      return NextResponse.json(
        {
          error:
            'Only valid PDF, PNG, and JPEG transcripts are supported',
        },
        { status: 400 }
      );
    }

    if (
      !SUPPORTED_TYPES.has(
        detectedMimeType
      )
    ) {
      return NextResponse.json(
        {
          error:
            'Unsupported transcript file type',
        },
        { status: 400 }
      );
    }

    const declaredMimeType =
      normalizeMimeType(file.type);

    if (
      declaredMimeType &&
      declaredMimeType !==
        detectedMimeType
    ) {
      return NextResponse.json(
        {
          error:
            'File content does not match its declared file type',
        },
        { status: 400 }
      );
    }

    if (
      !extensionMatchesMimeType(
        file.name,
        detectedMimeType
      )
    ) {
      return NextResponse.json(
        {
          error:
            'File extension does not match the uploaded file content',
        },
        { status: 400 }
      );
    }

    const mimeType = detectedMimeType;

    // --------------------------------------------------
    // 5. Duplicate detection
    // --------------------------------------------------

    const fileHash = createHash(
      'sha256'
    )
      .update(bytes)
      .digest('hex');

    const duplicate =
      await prisma.transcript.findFirst({
        where: {
          userId,
          fileHash,
        },
        select: {
          id: true,
          fileName: true,
          status: true,
          yearLabel: true,
          parsedCourses: true,
          gpa: true,
          parsedAt: true,
        },
      });

    if (duplicate) {
      if (duplicate.status === 'PARSED') {
        return NextResponse.json({
          transcript: duplicate,
          courses: Array.isArray(duplicate.parsedCourses)
            ? duplicate.parsedCourses
            : [],
          detectedMajor: null,
          duplicate: true,
        });
      }

      return NextResponse.json(
        {
          error:
            duplicate.status === 'PARSING'
              ? 'This transcript is already being processed. Please wait and refresh your profile.'
              : 'This transcript was already uploaded but could not be parsed. Please upload a clearer copy.',
          transcriptId: duplicate.id,
        },
        { status: 409 }
      );
    }

    // --------------------------------------------------
    // 6. Store raw file
    // --------------------------------------------------

    const safeName =
      file.name.replace(
        /[^a-zA-Z0-9._-]/g,
        '_'
      );

    const storageObjectKey =
      `transcripts/${userId}/` +
      `${randomUUID()}-${safeName}`;

    const storageUrl =
      await uploadTranscript(
        storageObjectKey,
        bytes,
        mimeType
      );

    // --------------------------------------------------
    // 7. Extract raw PDF text when possible
    // --------------------------------------------------

    let rawText = '';
    let pdfParseFailed = false;

    if (
      mimeType === 'application/pdf'
    ) {
      try {
        const parsePdf =
          loadPdfParser();

        const extracted =
          await parsePdf(bytes);

        if (
          extracted?.text &&
          extracted.text.trim().length > 0
        ) {
          rawText =
            extracted.text.slice(
              0,
              20000
            );
        } else {
          pdfParseFailed = true;
        }
      } catch (error) {
        pdfParseFailed = true;

        console.warn(
          '[transcript] PDF text extraction failed:',
          error
        );
      }
    }

    // --------------------------------------------------
    // 8. Create transcript record
    // --------------------------------------------------

    const transcript =
      await prisma.transcript.create({
        data: {
          userId,
          fileName: file.name,
          fileUrl: storageUrl,
          storageObjectKey,
          fileHash,
          mimeType,
          fileSizeBytes: file.size,
          yearLabel,
          status: 'PARSING',
          parserVersion:
            PARSER_VERSION,
          parserStatus: 'PARSING',
          rawText,
        },
      });

    transcriptId = transcript.id;

    // --------------------------------------------------
    // 9. Prepare extraction input
    // --------------------------------------------------

    let documentBlock:
      | {
          type: 'document';
          source: {
            type: 'base64';
            media_type:
              'application/pdf';
            data: string;
          };
        }
      | {
          type: 'text';
          text: string;
        }
      | {
          type: 'image';
          source: {
            type: 'base64';
            media_type:
              | 'image/png'
              | 'image/jpeg';
            data: string;
          };
        };

    if (
      mimeType === 'application/pdf' &&
      pdfParseFailed
    ) {
      documentBlock = {
        type: 'document',
        source: {
          type: 'base64',
          media_type:
            'application/pdf',
          data: bytes.toString(
            'base64'
          ),
        },
      };
    } else if (
      mimeType === 'application/pdf'
    ) {
      documentBlock = {
        type: 'text',
        text:
          rawText ||
          'No selectable text was found in this PDF.',
      };
    } else {
      documentBlock = {
        type: 'image',
        source: {
          type: 'base64',
          media_type:
            mimeType as
              | 'image/png'
              | 'image/jpeg',
          data: bytes.toString(
            'base64'
          ),
        },
      };
    }

    const extractionPrompt =
      'Extract the academic transcript. ' +
      'Return ONLY JSON with this shape: ' +
      '{"major": string|null, "courses": [' +
      '{"courseCode": string|null, ' +
      '"courseName": string, ' +
      '"grade": string|number|null, ' +
      '"credits": number|null, ' +
      '"term": string|null, ' +
      '"knowledgeArea": string|null}]}. ' +
      'Use only information visible in the document. ' +
      'Do not invent courses, grades, credits, terms, or a major.';

    let parsedResult: {
      major?: string | null;
      courses?: ParsedCourse[];
    } | null = null;

    // --------------------------------------------------
    // 10. Anthropic extraction
    // --------------------------------------------------

    if (
      isValidApiKey(
        process.env
          .ANTHROPIC_API_KEY
      )
    ) {
      try {
        const jsonText =
          await extractWithAnthropic(
            documentBlock,
            rawText,
            extractionPrompt
          );

        parsedResult =
          safeParseJson(jsonText);
      } catch (error) {
        console.warn(
          '[transcript] Anthropic extraction failed:',
          error
        );
      }
    }

    // --------------------------------------------------
    // 11. Groq extraction
    // --------------------------------------------------

    if (
      (!parsedResult ||
        !parsedResult.courses
          ?.length) &&
      isValidApiKey(
        process.env.GROQ_API_KEY
      ) &&
      rawText.trim().length > 0
    ) {
      try {
        const jsonText =
          await extractWithGroq(
            rawText,
            extractionPrompt
          );

        parsedResult =
          safeParseJson(jsonText);
      } catch (error) {
        console.warn(
          '[transcript] Groq extraction failed:',
          error
        );
      }
    }

    // --------------------------------------------------
    // 12. Local evidence-only fallback
    // --------------------------------------------------

    if (
      (!parsedResult ||
        !Array.isArray(
          parsedResult.courses
        ) ||
        parsedResult.courses
          .length === 0) &&
      rawText.trim().length > 0
    ) {
      console.log(
        '[transcript] Using local evidence-only parser'
      );

      parsedResult =
        extractCoursesLocally(
          rawText
        );
    }

    // --------------------------------------------------
    // 13. No trustworthy extraction
    // --------------------------------------------------

    if (
      !parsedResult ||
      !Array.isArray(
        parsedResult.courses
      ) ||
      parsedResult.courses.length ===
        0
    ) {
      await prisma.transcript.update({
        where: {
          id: transcript.id,
        },
        data: {
          status: 'FAILED',
          parserStatus: 'FAILED',
        },
      });

      return NextResponse.json(
        {
          error:
            'We could not reliably extract course information from this transcript. Please upload a clearer PDF, PNG, or JPEG.',
          transcriptId:
            transcript.id,
        },
        { status: 422 }
      );
    }

    // --------------------------------------------------
    // 14. Normalize parsed result
    // --------------------------------------------------

    const parsedCourses =
      parsedResult.courses.filter(
        isValidParsedCourse
      );

    if (
      parsedCourses.length === 0
    ) {
      await prisma.transcript.update({
        where: {
          id: transcript.id,
        },
        data: {
          status: 'FAILED',
          parserStatus: 'FAILED',
        },
      });

      return NextResponse.json(
        {
          error:
            'No valid courses could be extracted from this transcript.',
          transcriptId:
            transcript.id,
        },
        { status: 422 }
      );
    }

    const detectedMajor =
      typeof parsedResult.major ===
        'string' &&
      parsedResult.major.trim()
        .length > 0
        ? parsedResult.major.trim()
        : null;

    const gpa =
      calculateGPA(parsedCourses);

    // --------------------------------------------------
    // 15. Save successful parse
    // --------------------------------------------------

    const updated =
      await prisma.transcript.update({
        where: {
          id: transcript.id,
        },
        data: {
          status: 'PARSED',
          parserStatus: 'PARSED',
          parserVersion:
            PARSER_VERSION,
          parsedCourses:
            parsedCourses as unknown as Prisma.InputJsonValue,
          gpa,
          parsedAt: new Date(),
        },
      });

    // --------------------------------------------------
    // 16. Update selected major
    // --------------------------------------------------

    if (detectedMajor) {
      const careerPath =
        await prisma.careerPath.findFirst(
          {
            where: {
              OR: [
                {
                  title: {
                    equals:
                      detectedMajor,
                    mode: 'insensitive',
                  },
                },
                {
                  title: {
                    contains:
                      detectedMajor,
                    mode: 'insensitive',
                  },
                },
              ],
            },
          }
        );

      if (careerPath) {
        await prisma.user.update({
          where: {
            id: userId,
          },
          data: {
            selectedMajorId:
              careerPath.id,
          },
        });
      }
    }

    // --------------------------------------------------
    // 17. Update transcript-derived skills
    // --------------------------------------------------

    for (
      const course of parsedCourses
    ) {
      const label = [
        course.knowledgeArea,
        course.courseName,
        course.courseCode,
      ].find(
        (
          value
        ): value is string =>
          typeof value ===
            'string' &&
          value.trim().length > 0
      );

      const skillName =
        label?.trim() ?? '';

      if (!skillName) {
        continue;
      }

      const skill =
        await prisma.skill.upsert({
          where: {
            name: skillName,
          },
          update: {},
          create: {
            name: skillName,
            category:
              course.knowledgeArea ||
              'Transcript course',
          },
        });

      const proficiency =
        gradeToProficiency(
          course.grade
        );

      // Do not create proficiency
      // when the transcript had no grade.
      if (proficiency === null) {
        continue;
      }

      await prisma.userSkill.upsert({
        where: {
          userId_skillId_source: {
            userId,
            skillId: skill.id,
            source:
              'TRANSCRIPT',
          },
        },
        update: {
          proficiency,
        },
        create: {
          userId,
          skillId: skill.id,
          proficiency,
          source: 'TRANSCRIPT',
        },
      });
    }

    return NextResponse.json({
      transcript: updated,
      detectedMajor,
      courses: parsedCourses,
    });
  } catch (error) {
    if (transcriptId) {
      await prisma.transcript
        .update({
          where: {
            id: transcriptId,
          },
          data: {
            status: 'FAILED',
            parserStatus: 'FAILED',
          },
        })
        .catch(() => undefined);
    }

    console.error(
      'Transcript upload failed:',
      error
    );

    // Do not expose internal exception
    // messages to the client.
    return NextResponse.json(
      {
        error:
          'Transcript processing failed',
      },
      { status: 500 }
    );
  }
}

// --------------------------------------------------
// File validation
// --------------------------------------------------

function normalizeMimeType(
  type: string
): string | null {
  const normalized =
    type.trim().toLowerCase();

  if (!normalized) {
    return null;
  }

  if (
    normalized ===
    'image/jpg'
  ) {
    return 'image/jpeg';
  }

  return normalized;
}

function detectMimeType(
  bytes: Buffer
): string | null {
  if (bytes.length < 4) {
    return null;
  }

  // PDF: %PDF
  if (
    bytes[0] === 0x25 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x44 &&
    bytes[3] === 0x46
  ) {
    return 'application/pdf';
  }

  // PNG signature
  if (
    bytes.length >= 8 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a
  ) {
    return 'image/png';
  }

  // JPEG SOI
  if (
    bytes[0] === 0xff &&
    bytes[1] === 0xd8 &&
    bytes[2] === 0xff
  ) {
    return 'image/jpeg';
  }

  return null;
}

function extensionMatchesMimeType(
  fileName: string,
  mimeType: string
): boolean {
  const extension =
    fileName
      .toLowerCase()
      .split('.')
      .pop() ?? '';

  if (
    mimeType ===
    'application/pdf'
  ) {
    return extension === 'pdf';
  }

  if (
    mimeType === 'image/png'
  ) {
    return extension === 'png';
  }

  if (
    mimeType === 'image/jpeg'
  ) {
    return (
      extension === 'jpg' ||
      extension === 'jpeg'
    );
  }

  return false;
}

// --------------------------------------------------
// PDF parser
// --------------------------------------------------

function loadPdfParser() {
  const runtimeRequire = eval(
    'require'
  ) as (
    moduleName: string
  ) => (
    data: Buffer
  ) => Promise<{
    text: string;
  }>;

  return runtimeRequire(
    'pdf-parse/lib/pdf-parse.js'
  );
}

// --------------------------------------------------
// JSON parsing
// --------------------------------------------------

function safeParseJson(
  jsonText: string
): {
  major?: string | null;
  courses?: ParsedCourse[];
} | null {
  try {
    const cleaned =
      jsonText
        .replace(
          /```json|```/g,
          ''
        )
        .trim();

    const parsed =
      JSON.parse(cleaned);

    if (Array.isArray(parsed)) {
      return {
        major: null,
        courses: parsed,
      };
    }

    if (
      parsed &&
      typeof parsed === 'object'
    ) {
      return {
        major:
          typeof parsed.major ===
          'string'
            ? parsed.major
            : null,
        courses:
          Array.isArray(
            parsed.courses
          )
            ? parsed.courses
            : [],
      };
    }

    return null;
  } catch {
    return null;
  }
}

function isValidParsedCourse(
  course: ParsedCourse
): boolean {
  return (
    !!course &&
    typeof course.courseName ===
      'string' &&
    course.courseName.trim()
      .length >= 2
  );
}

// --------------------------------------------------
// Anthropic
// --------------------------------------------------

async function extractWithAnthropic(
  documentBlock: unknown,
  rawText: string,
  system: string
) {
  const response =
    await anthropic.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 2048,
      system,
      messages: [
        {
          role: 'user',
          content: [
            documentBlock as never,
            {
              type: 'text',
              text:
                rawText ||
                'Read the uploaded transcript document.',
            },
          ],
        },
      ],
    });

  const textBlock =
    response.content.find(
      (block) =>
        block.type === 'text'
    );

  return textBlock?.type ===
    'text'
    ? textBlock.text
    : '{"major":null,"courses":[]}';
}

// --------------------------------------------------
// Groq
// --------------------------------------------------

async function extractWithGroq(
  rawText: string,
  system: string
) {
  const apiKey =
    process.env.GROQ_API_KEY;

  if (!isValidApiKey(apiKey)) {
    throw new Error(
      'Valid GROQ_API_KEY not configured'
    );
  }

  const response = await fetch(
    'https://api.groq.com/openai/v1/chat/completions',
    {
      method: 'POST',
      headers: {
        Authorization:
          `Bearer ${apiKey}`,
        'Content-Type':
          'application/json',
      },
      body: JSON.stringify({
        model: LLM_MODEL,
        temperature: 0,
        response_format: {
          type: 'json_object',
        },
        messages: [
          {
            role: 'system',
            content: system,
          },
          {
            role: 'user',
            content:
              rawText ||
              'No selectable text was found. Return an empty courses array.',
          },
        ],
      }),
    }
  );

  const data =
    (await response.json()) as {
      choices?: Array<{
        message?: {
          content?: string;
        };
      }>;
      error?: {
        message?: string;
      };
    };

  if (!response.ok) {
    throw new Error(
      data.error?.message ||
        `Groq request failed (${response.status})`
    );
  }

  return (
    data.choices?.[0]?.message
      ?.content ||
    '{"major":null,"courses":[]}'
  );
}

// --------------------------------------------------
// Evidence-only local parser
// --------------------------------------------------

function extractCoursesLocally(
  rawText: string
): {
  major: string | null;
  courses: ParsedCourse[];
} {
  const extractedCourses:
    ParsedCourse[] = [];

  const lines = rawText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(
      (line) => line.length > 0
    );

  let detectedMajor:
    string | null = null;

  const lowerText =
    rawText.toLowerCase();

  if (
    lowerText.includes(
      'software engineer'
    ) ||
    lowerText.includes(
      'computer science'
    )
  ) {
    detectedMajor =
      'Software Engineer';
  } else if (
    lowerText.includes(
      'electrical engineer'
    ) ||
    lowerText.includes(
      'electronic engineer'
    )
  ) {
    detectedMajor =
      'Electrical Engineer';
  } else if (
    lowerText.includes(
      'data analyst'
    ) ||
    lowerText.includes(
      'data analytics'
    )
  ) {
    detectedMajor =
      'Business / Data Analyst';
  }

  const courseCodeRegex =
    /\b([A-Z]{2,4}\s*[-]?\s*\d{3}[A-Z]?)\b/;

  const gradeRegex =
    /\b([A-D][+-]?|F|100|[5-9]\d(?:\.\d+)?)\b/;

  const creditRegex =
    /\b([1-6](?:\.0)?)\s*(?:cr(?:edits?)?|units?|hrs?)\b/i;

  for (const line of lines) {
    if (
      line.length < 5 ||
      line.length > 120
    ) {
      continue;
    }

    if (
      /(transcript|student id|academic record|page \d|gpa|registrar|university|date of birth)/i.test(
        line
      )
    ) {
      continue;
    }

    const codeMatch =
      line.match(
        courseCodeRegex
      );

    if (!codeMatch) {
      continue;
    }

    const courseCode =
      codeMatch[1].replace(
        /\s+/g,
        ''
      );

    let remaining =
      line
        .replace(
          codeMatch[0],
          ''
        )
        .trim();

    const gradeMatch =
      remaining.match(
        gradeRegex
      );

    let grade:
      | string
      | null = null;

    if (gradeMatch) {
      grade = gradeMatch[1];

      remaining =
        remaining
          .replace(
            gradeMatch[0],
            ''
          )
          .trim();
    }

    const creditMatch =
      remaining.match(
        creditRegex
      );

    let credits:
      | number
      | null = null;

    if (creditMatch) {
      credits = parseFloat(
        creditMatch[1]
      );

      remaining =
        remaining
          .replace(
            creditMatch[0],
            ''
          )
          .trim();
    }

    const courseName =
      remaining
        .replace(
          /^[-–—:| ]+|[-–—:| ]+$/g,
          ''
        )
        .trim();

    if (
      courseName.length < 3
    ) {
      continue;
    }

    extractedCourses.push({
      courseCode,
      courseName,
      grade,
      credits,
      term: null,
      knowledgeArea:
        inferKnowledgeArea(
          courseName,
          courseCode
        ),
    });
  }

  return {
    major: detectedMajor,
    courses: extractedCourses,
  };
}

// --------------------------------------------------
// Knowledge-area inference
// --------------------------------------------------

function inferKnowledgeArea(
  courseName: string,
  courseCode?: string
): string {
  const name =
    `${courseName} ${
      courseCode || ''
    }`.toLowerCase();

  if (
    name.includes('program') ||
    name.includes('java') ||
    name.includes('python') ||
    name.includes('code')
  ) {
    return 'Programming Fundamentals';
  }

  if (
    name.includes('algorithm') ||
    name.includes(
      'data structure'
    )
  ) {
    return 'Data Structures & Algorithms';
  }

  if (
    name.includes('database') ||
    name.includes('sql') ||
    name.includes('dbms')
  ) {
    return 'Database Management';
  }

  if (
    name.includes('network') ||
    name.includes('security') ||
    name.includes('system')
  ) {
    return 'Technical';
  }

  if (
    name.includes('math') ||
    name.includes('calculus') ||
    name.includes('algebra') ||
    name.includes('statistic')
  ) {
    return 'Quantitative';
  }

  if (
    name.includes('physics') ||
    name.includes('circuit')
  ) {
    return 'Science';
  }

  if (
    name.includes('english') ||
    name.includes(
      'communication'
    ) ||
    name.includes('writing')
  ) {
    return 'Communication';
  }

  return 'Technical';
}

// --------------------------------------------------
// Grade helpers
// --------------------------------------------------

function gradeToProficiency(
  grade:
    | string
    | number
    | null
    | undefined
): number | null {
  if (
    grade === null ||
    grade === undefined
  ) {
    return null;
  }

  if (
    typeof grade === 'number'
  ) {
    return grade <= 4.0
      ? Math.round(
          (grade / 4.0) * 100
        )
      : Math.min(
          100,
          Math.max(0, grade)
        );
  }

  const str = String(grade)
    .trim()
    .toUpperCase();

  if (!str) {
    return null;
  }

  if (str.startsWith('A+'))
    return 95;
  if (str.startsWith('A-'))
    return 88;
  if (str.startsWith('A'))
    return 92;
  if (str.startsWith('B+'))
    return 82;
  if (str.startsWith('B-'))
    return 74;
  if (str.startsWith('B'))
    return 78;
  if (str.startsWith('C+'))
    return 68;
  if (str.startsWith('C-'))
    return 58;
  if (str.startsWith('C'))
    return 62;
  if (str.startsWith('D'))
    return 45;
  if (str.startsWith('F'))
    return 20;

  const num =
    parseFloat(str);

  if (!Number.isNaN(num)) {
    return num <= 4.0
      ? Math.round(
          (num / 4.0) * 100
        )
      : Math.min(
          100,
          Math.max(0, num)
        );
  }

  return null;
}

function calculateGPA(
  courses: ParsedCourse[]
): number | null {
  const gpaValues = courses
    .map((course) => {
      if (
        typeof course.grade ===
        'number'
      ) {
        return course.grade <= 4.0
          ? course.grade
          : (course.grade /
              100) *
              4.0;
      }

      if (
        typeof course.grade ===
        'string'
      ) {
        const grade =
          course.grade
            .trim()
            .toUpperCase();

        if (
          grade.startsWith('A+')
        )
          return 4.0;

        if (
          grade.startsWith('A-')
        )
          return 3.7;

        if (
          grade.startsWith('A')
        )
          return 4.0;

        if (
          grade.startsWith('B+')
        )
          return 3.3;

        if (
          grade.startsWith('B-')
        )
          return 2.7;

        if (
          grade.startsWith('B')
        )
          return 3.0;

        if (
          grade.startsWith('C+')
        )
          return 2.3;

        if (
          grade.startsWith('C-')
        )
          return 1.7;

        if (
          grade.startsWith('C')
        )
          return 2.0;

        if (
          grade.startsWith('D+')
        )
          return 1.3;

        if (
          grade.startsWith('D')
        )
          return 1.0;

        if (
          grade.startsWith('F')
        )
          return 0.0;

        const numeric =
          parseFloat(grade);

        if (
          !Number.isNaN(numeric)
        ) {
          return numeric <= 4.0
            ? numeric
            : (numeric /
                100) *
                4.0;
        }
      }

      return null;
    })
    .filter(
      (
        value
      ): value is number =>
        value !== null
    );

  if (
    gpaValues.length === 0
  ) {
    return null;
  }

  const average =
    gpaValues.reduce(
      (sum, value) =>
        sum + value,
      0
    ) / gpaValues.length;

  return (
    Math.round(
      average * 100
    ) / 100
  );
}