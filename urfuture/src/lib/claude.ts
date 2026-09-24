import Anthropic from '@anthropic-ai/sdk';
import type { MessageParam, Tool } from '@anthropic-ai/sdk/resources/messages';

// Model string is env-configurable on purpose: Anthropic ships new model
// generations regularly, and this value goes stale fast. Check
// https://docs.claude.com/en/docs/about-claude/models before deploying.
export const CLAUDE_MODEL = process.env.CLAUDE_MODEL || 'claude-sonnet-5';

export const anthropic = new Anthropic({
  // Keep routes loadable when local development uses the configured Groq provider.
  apiKey: process.env.ANTHROPIC_API_KEY || 'anthropic-key-configured-at-runtime',
});

// ---------------------------------------------------------------------------
// Tool (function-calling) definitions
// Each tool forces Claude to emit a strict JSON shape instead of free prose,
// per spec §3: "function calling to ... produce strict JSON response models."
// ---------------------------------------------------------------------------

export const ANALYZE_SKILL_GAP_TOOL: Tool = {
  name: 'analyze_skill_gap',
  description:
    "Report a structured skill-gap analysis between a student's current proficiencies and a target career's requirements. Only use proficiency numbers explicitly provided in context.",
  input_schema: {
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
};

export const GENERATE_STUDY_PLAN_TOOL: Tool = {
  name: 'generate_study_plan',
  description: 'Produce a multi-week personalized study plan targeting specific skill gaps.',
  input_schema: {
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
};

export const ANALYZE_JOB_FIT_TOOL: Tool = {
  name: 'analyze_job_fit',
  description: "Compare a pasted job description against the student's known skills.",
  input_schema: {
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
};

export const GENERATE_QUIZ_TOOL: Tool = {
  name: 'generate_quiz',
  description: "Generate diagnostic questions strictly from the student's parsed transcript courses. Mix multiple-choice, written-answer, and coding questions.",
  input_schema: {
    type: 'object',
    properties: {
      questions: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            questionType: { type: 'string', enum: ['MULTIPLE_CHOICE', 'WRITTEN', 'CODING'] },
            skillName: { type: 'string' },
            prompt: { type: 'string' },
            choices: { type: 'array', items: { type: 'string' }, minItems: 2, maxItems: 6 },
            correctIndex: { type: 'number' },
            expectedAnswer: { type: 'string' },
            difficulty: { type: 'string', enum: ['EASY', 'MEDIUM', 'HARD'] },
            sourceCourse: { type: 'string' },
          },
          required: ['questionType', 'skillName', 'prompt', 'difficulty'],
        },
      },
    },
    required: ['questions'],
  },
};

export const ALL_TOOLS: Tool[] = [
  ANALYZE_SKILL_GAP_TOOL,
  GENERATE_STUDY_PLAN_TOOL,
  ANALYZE_JOB_FIT_TOOL,
  GENERATE_QUIZ_TOOL,
];

/**
 * Non-streaming helper: force a single tool call and return its parsed input.
 * Used by the /api/career/recommend, /api/study-plan/generate,
 * /api/job/match and /api/quiz/generate routes, which all need one strict
 * JSON object back, not a chat stream.
 */
export async function runToolCall<T>(opts: {
  system: string;
  userMessage: string;
  tool: Tool;
}): Promise<T> {
  const response = await anthropic.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 4096,
    system: opts.system,
    tools: [opts.tool],
    tool_choice: { type: 'tool', name: opts.tool.name },
    messages: [{ role: 'user', content: opts.userMessage }],
  });

  const toolUse = response.content.find((b) => b.type === 'tool_use');
  if (!toolUse || toolUse.type !== 'tool_use') {
    throw new Error('Claude did not return the expected tool call.');
  }
  return toolUse.input as T;
}

export async function runGroqJson<T>(opts: { system: string; userMessage: string }): Promise<T> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey || apiKey.includes('...') || apiKey.includes('xxxx') || apiKey === 'gsk_...') {
    throw new Error('Valid GROQ_API_KEY is not configured in .env');
  }
  const rawModel = process.env.LLM_MODEL?.trim();
  const model = (!rawModel || rawModel.startsWith('openai/') || rawModel.includes('gpt-oss'))
    ? 'llama-3.3-70b-versatile'
    : rawModel;
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      temperature: 0,
      response_format: { type: 'json_object' },
      messages: [{ role: 'system', content: opts.system }, { role: 'user', content: opts.userMessage }],
    }),
  });
  const data = await response.json() as { choices?: Array<{ message?: { content?: string } }>; error?: { message?: string } };
  if (!response.ok) throw new Error(data.error?.message || `Groq request failed (${response.status})`);
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error('Groq returned an empty response.');
  return JSON.parse(content) as T;
}

/**
 * Streaming helper for the main chat panel. Returns the raw Anthropic
 * stream so the API route can pipe text deltas to the client as
 * Server-Sent Events.
 */
export function streamChat(opts: { system: string; messages: MessageParam[] }) {
  return anthropic.messages.stream({
    model: CLAUDE_MODEL,
    max_tokens: 2048,
    system: opts.system,
    tools: ALL_TOOLS,
    messages: opts.messages,
  });
}
