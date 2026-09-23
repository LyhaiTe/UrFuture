import Groq from 'groq-sdk';

// ---------------------------------------------------------------------------
// Groq LLM client
// Uses the OpenAI-compatible Groq API with the model from .env
// ---------------------------------------------------------------------------

export const LLM_MODEL = process.env.LLM_MODEL || 'llama-3.3-70b-versatile';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// ---------------------------------------------------------------------------
// Tool (function-calling) definitions — OpenAI-compatible format
// Each tool forces the model to emit a strict JSON shape instead of free prose.
// ---------------------------------------------------------------------------

interface ToolFunction {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
}

export interface LLMTool {
  type: 'function';
  function: ToolFunction;
}

export const ANALYZE_SKILL_GAP_TOOL: LLMTool = {
  type: 'function',
  function: {
    name: 'analyze_skill_gap',
    description:
      "Report a structured skill-gap analysis between a student's current proficiencies and a target career's requirements. Only use proficiency numbers explicitly provided in context.",
    parameters: {
      type: 'object',
      properties: {
        careerTitle: { type: 'string' },
        fitScore: { type: 'number', description: '0-100 overall fit score' },
        matchedSkills: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              skillName: { type: 'string' },
              userProficiency: { type: 'number' },
              requiredImportance: { type: 'number' },
              gap: { type: 'number' },
            },
            required: ['skillName', 'userProficiency', 'requiredImportance', 'gap'],
          },
        },
        missingSkills: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              skillName: { type: 'string' },
              userProficiency: { type: 'number' },
              requiredImportance: { type: 'number' },
              gap: { type: 'number' },
            },
            required: ['skillName', 'userProficiency', 'requiredImportance', 'gap'],
          },
        },
        rationale: { type: 'string' },
        citations: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              source: { type: 'string' },
              reference: { type: 'string' },
              claim: { type: 'string' },
            },
            required: ['source', 'reference', 'claim'],
          },
        },
        groundednessScore: { type: 'number', description: 'Fraction (0-1) of factual claims that carry a citation' },
        requiresCounselorReview: { type: 'boolean' },
        reviewReason: { type: 'string' },
      },
      required: [
        'careerTitle',
        'fitScore',
        'matchedSkills',
        'missingSkills',
        'rationale',
        'citations',
        'groundednessScore',
        'requiresCounselorReview',
      ],
    },
  },
};

export const GENERATE_STUDY_PLAN_TOOL: LLMTool = {
  type: 'function',
  function: {
    name: 'generate_study_plan',
    description: 'Produce a multi-week personalized study plan targeting specific skill gaps.',
    parameters: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        targetSkills: { type: 'array', items: { type: 'string' } },
        weeks: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              weekNumber: { type: 'number' },
              focusSkill: { type: 'string' },
              tasks: { type: 'array', items: { type: 'string' } },
              resources: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    title: { type: 'string' },
                    type: { type: 'string', enum: ['video', 'reading', 'practice', 'course'] },
                  },
                  required: ['title', 'type'],
                },
              },
            },
            required: ['weekNumber', 'focusSkill', 'tasks', 'resources'],
          },
        },
        citations: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              source: { type: 'string' },
              reference: { type: 'string' },
              claim: { type: 'string' },
            },
            required: ['source', 'reference', 'claim'],
          },
        },
      },
      required: ['title', 'targetSkills', 'weeks', 'citations'],
    },
  },
};

export const ANALYZE_JOB_FIT_TOOL: LLMTool = {
  type: 'function',
  function: {
    name: 'analyze_job_fit',
    description: "Compare a pasted job description against the student's known skills.",
    parameters: {
      type: 'object',
      properties: {
        jobTitle: { type: 'string' },
        extractedSkills: { type: 'array', items: { type: 'string' } },
        matchedSkills: { type: 'array', items: { type: 'string' } },
        missingSkills: { type: 'array', items: { type: 'string' } },
        fitScorePercent: { type: 'number' },
        summary: { type: 'string' },
        needsPrep: { type: 'boolean' },
      },
      required: ['jobTitle', 'extractedSkills', 'matchedSkills', 'missingSkills', 'fitScorePercent', 'summary', 'needsPrep'],
    },
  },
};

export const GENERATE_QUIZ_TOOL: LLMTool = {
  type: 'function',
  function: {
    name: 'generate_quiz',
    description: "Generate diagnostic multiple-choice questions strictly from the student's parsed transcript courses.",
    parameters: {
      type: 'object',
      properties: {
        questions: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              skillName: { type: 'string' },
              prompt: { type: 'string' },
              choices: { type: 'array', items: { type: 'string' } },
              correctIndex: { type: 'number' },
              difficulty: { type: 'string', enum: ['EASY', 'MEDIUM', 'HARD'] },
              sourceCourse: { type: 'string' },
            },
            required: ['skillName', 'prompt', 'choices', 'correctIndex', 'difficulty'],
          },
        },
      },
      required: ['questions'],
    },
  },
};

export const ALL_TOOLS: LLMTool[] = [
  ANALYZE_SKILL_GAP_TOOL,
  GENERATE_STUDY_PLAN_TOOL,
  ANALYZE_JOB_FIT_TOOL,
  GENERATE_QUIZ_TOOL,
];

// ---------------------------------------------------------------------------
// Message types (OpenAI-compatible)
// ---------------------------------------------------------------------------

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

// ---------------------------------------------------------------------------
// Non-streaming helper: force a single tool call and return its parsed input.
// Used by /api/career/recommend, /api/study-plan/generate,
// /api/job/match and /api/quiz/generate routes.
// ---------------------------------------------------------------------------

export async function runToolCall<T>(opts: {
  system: string;
  userMessage: string;
  tool: LLMTool;
}): Promise<T> {
  const response = await groq.chat.completions.create({
    model: LLM_MODEL,
    max_tokens: 4096,
    messages: [
      { role: 'system', content: opts.system },
      { role: 'user', content: opts.userMessage },
    ],
    tools: [opts.tool],
    tool_choice: { type: 'function', function: { name: opts.tool.function.name } },
  });

  const message = response.choices[0]?.message;
  const toolCall = message?.tool_calls?.[0];

  if (!toolCall || toolCall.type !== 'function') {
    throw new Error('LLM did not return the expected tool call.');
  }

  return JSON.parse(toolCall.function.arguments) as T;
}

// ---------------------------------------------------------------------------
// Streaming helper for the main chat panel. Returns an async iterable of
// text deltas and tool calls so the API route can pipe them to the client
// as Server-Sent Events.
// ---------------------------------------------------------------------------

export interface StreamEvent {
  type: 'text' | 'tool_call' | 'done';
  delta?: string;
  toolCall?: { tool: string; input: unknown };
  fullText?: string;
}

export async function* streamChat(opts: {
  system: string;
  messages: ChatMessage[];
}): AsyncGenerator<StreamEvent> {
  const stream = await groq.chat.completions.create({
    model: LLM_MODEL,
    max_tokens: 2048,
    stream: true,
    messages: [
      { role: 'system', content: opts.system },
      ...opts.messages,
    ],
    tools: ALL_TOOLS,
  });

  let fullText = '';
  // Track tool call assembly across streamed chunks
  const pendingToolCalls = new Map<number, { name: string; args: string }>();

  for await (const chunk of stream) {
    const delta = chunk.choices[0]?.delta;
    if (!delta) continue;

    // Text content
    if (delta.content) {
      fullText += delta.content;
      yield { type: 'text', delta: delta.content };
    }

    // Tool calls (streamed incrementally)
    if (delta.tool_calls) {
      for (const tc of delta.tool_calls) {
        const idx = tc.index;
        if (!pendingToolCalls.has(idx)) {
          pendingToolCalls.set(idx, { name: '', args: '' });
        }
        const pending = pendingToolCalls.get(idx)!;
        if (tc.function?.name) {
          pending.name = tc.function.name;
        }
        if (tc.function?.arguments) {
          pending.args += tc.function.arguments;
        }
      }
    }
  }

  // Emit assembled tool calls
  for (const [, tc] of pendingToolCalls) {
    if (tc.name && tc.args) {
      try {
        const input = JSON.parse(tc.args);
        yield { type: 'tool_call', toolCall: { tool: tc.name, input } };
      } catch {
        // Malformed tool call JSON — skip
      }
    }
  }

  yield { type: 'done', fullText };
}

