'use client';

import { useRef, useState, useEffect } from 'react';
import { ArrowRight, Bot, BookOpen, ChevronDown, Sparkles, X } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  toolCalls?: { tool: string; input: unknown }[];
  citations?: { source: string; reference: string; claim: string }[];
}

interface ChatPanelProps {
  userId: string;
  isModal?: boolean;
  onClose?: () => void;
}

const SUGGESTED_PROMPTS = [
  'What skills do I need for Data Engineer?',
  'Can I do software engineering if my math is weak?',
  'How do I improve my knowledge coverage score?',
  'Suggest a 6-week study plan for Python & Algorithms',
];

// Rich Markdown renderer with custom Tailwind styling for tables, lists, headers, etc.
function FormattedMessage({ content, isUser }: { content: string; isUser: boolean }) {
  if (!content) return null;
  if (isUser) {
    return <div className="whitespace-pre-wrap break-words">{content}</div>;
  }

  return (
    <div className="prose-custom text-sm leading-relaxed overflow-hidden">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h1 className="text-base font-bold text-white mt-3 mb-1.5 pb-1 border-b border-slate-700/60">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-sm font-bold text-white mt-3 mb-1.5">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-xs font-bold text-[#00d2ff] uppercase tracking-wider mt-3 mb-1">
              {children}
            </h3>
          ),
          p: ({ children }) => (
            <p className="mb-2.5 last:mb-0 leading-relaxed text-slate-900 dark:text-slate-100">
              {children}
            </p>
          ),
          ul: ({ children }) => (
            <ul className="my-2 space-y-1 pl-4 list-disc marker:text-[#00d2ff]">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="my-2 space-y-1 pl-4 list-decimal marker:text-[#00d2ff]">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="leading-relaxed text-slate-800 dark:text-slate-200">
              {children}
            </li>
          ),
          strong: ({ children }) => (
            <strong className="font-bold text-cyan-600 dark:text-cyan-300">
              {children}
            </strong>
          ),
          code: ({ children, className }) => {
            const isInline = !className;
            if (isInline) {
              return (
                <code className="px-1.5 py-0.5 rounded bg-[#0a1528] text-[#00d2ff] font-mono text-[0.85em] border border-[#1b2b4d]">
                  {children}
                </code>
              );
            }
            return (
              <pre className="my-2 p-3 rounded-lg bg-[#070e1b] text-slate-200 font-mono text-xs overflow-x-auto border border-[#1b2b4d]">
                <code>{children}</code>
              </pre>
            );
          },
          table: ({ children }) => (
            <div className="my-3 overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
              <table className="w-full text-left text-xs border-collapse">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-slate-200/80 dark:bg-[#0c1830] text-slate-900 dark:text-[#00d2ff] font-bold border-b border-slate-300 dark:border-slate-700">
              {children}
            </thead>
          ),
          th: ({ children }) => (
            <th className="px-3 py-2.5 font-bold tracking-wide">
              {children}
            </th>
          ),
          tbody: ({ children }) => (
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800/80">
              {children}
            </tbody>
          ),
          tr: ({ children }) => (
            <tr className="even:bg-slate-50 dark:even:bg-slate-800/30 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors">
              {children}
            </tr>
          ),
          td: ({ children }) => (
            <td className="px-3 py-2 text-slate-800 dark:text-slate-300 align-top">
              {children}
            </td>
          ),
          hr: () => (
            <hr className="my-3 border-slate-200 dark:border-slate-700" />
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-2 border-[#00d2ff] pl-3 my-2 text-slate-600 dark:text-slate-400 italic">
              {children}
            </blockquote>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

export default function ChatPanel({ userId, isModal = false, onClose }: ChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content:
        "Hi! I'm your **UrFuture Copilot**. I can help you analyze career fit, break down required skills, assess course prerequisites, or recommend next steps based on your verified knowledge. How can I guide you today?",
    },
  ]);
  const [input, setInput] = useState('');
  const [conversationId, setConversationId] = useState<string | undefined>(undefined);
  const [streaming, setStreaming] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streaming]);

  async function handleSend(customText?: string) {
    const textToSend = customText ?? input;
    if (!textToSend.trim() || streaming) return;

    const userMessage = textToSend.trim();
    if (!customText) setInput('');
    setShowSuggestions(false);

    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setMessages((prev) => [...prev, { role: 'assistant', content: '' }]);
    setStreaming(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, conversationId, message: userMessage }),
      });
      if (!res.body) throw new Error('No response stream');

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        const events = buffer.split('\n\n');
        buffer = events.pop() ?? '';

        for (const raw of events) {
          const lines = raw.split('\n');
          const eventLine = lines.find((l) => l.startsWith('event:'));
          const dataLine = lines.find((l) => l.startsWith('data:'));
          if (!eventLine || !dataLine) continue;
          const eventType = eventLine.replace('event:', '').trim();
          const data = JSON.parse(dataLine.replace('data:', '').trim());

          if (eventType === 'token') {
            setMessages((prev) => {
              const next = [...prev];
              next[next.length - 1] = {
                ...next[next.length - 1],
                content: next[next.length - 1].content + data.delta,
              };
              return next;
            });
          } else if (eventType === 'tool_call') {
            setMessages((prev) => {
              const next = [...prev];
              const last = next[next.length - 1];
              next[next.length - 1] = {
                ...last,
                toolCalls: [...(last.toolCalls ?? []), data],
              };
              return next;
            });
          } else if (eventType === 'error') {
            setMessages((prev) => {
              const next = [...prev];
              next[next.length - 1] = {
                role: 'assistant',
                content: data.message || 'An error occurred while generating the response. Please try again.',
              };
              return next;
            });
          } else if (eventType === 'done') {
            setConversationId(data.conversationId);
            // Attach RAG citations to the last assistant message
            if (data.citations && data.citations.length > 0) {
              setMessages((prev) => {
                const next = [...prev];
                next[next.length - 1] = {
                  ...next[next.length - 1],
                  citations: data.citations,
                };
                return next;
              });
            }
          }
        }
      }
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Connection issue encountered. Please try your request again.' },
      ]);
    } finally {
      setStreaming(false);
    }
  }

  const content = (
    <div className="flex h-full flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl shadow-black/20 overflow-hidden">
      {/* ========================================================================= */}
      {/* HEADER */}
      {/* ========================================================================= */}
      <div className="chat-header border-b border-[#1b2947] px-5 py-3.5 flex items-center justify-between bg-gradient-to-r from-[#0c1830] to-[#0a1426]">
        <div className="flex items-center gap-3">
          {/* Robot icon matching the floating button */}
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#00d2ff] to-[#0099cc] flex items-center justify-center shadow-md shadow-[#00d2ff]/30">
            <Bot className="w-5 h-5 text-white" strokeWidth={2} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              UrFuture Copilot
              <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-[#00d2ff]/10 text-[#00d2ff] border border-[#00d2ff]/20">
                AI Advisor
              </span>
            </h3>
            <p className="text-[11px] text-slate-300 flex items-center gap-1.5 mt-0.5">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10b981] opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#10b981]" />
              </span>
              Online • Grounded citations active
            </p>
          </div>
        </div>

        {isModal && onClose && (
          <button
            onClick={onClose}
            className="chat-close-button w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition-all hover:scale-105"
            aria-label="Close chat"
          >
            <X className="w-4 h-4" strokeWidth={2.5} />
          </button>
        )}
      </div>

      {/* ========================================================================= */}
      {/* MESSAGES */}
      {/* ========================================================================= */}
      <div className="flex-1 space-y-4 overflow-y-auto p-5 scrollbar-thin">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'} animate-[fadeIn_0.25s_ease-out]`}
          >
            <div
              className={`max-w-[95%] sm:max-w-[88%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                m.role === 'user'
                  ? 'bg-gradient-to-r from-[#0284c7] to-[#0ea5e9] text-white font-medium shadow-md shadow-[#0284c7]/20 rounded-tr-sm self-end max-w-[85%]'
                  : 'bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 shadow-sm rounded-tl-sm'
              }`}
            >
              {m.content ? (
                <FormattedMessage content={m.content} isUser={m.role === 'user'} />
              ) : streaming && i === messages.length - 1 ? (
                <div className="flex items-center gap-1.5 py-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00d2ff] animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00d2ff] animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00d2ff] animate-bounce" />
                </div>
              ) : null}
            </div>

            {/* Subtle tool trace — only shown when present, minimal style */}
            {m.toolCalls && m.toolCalls.length > 0 && (
              <div className="mt-1.5 flex flex-wrap gap-1">
                {m.toolCalls.map((tc, j) => (
                  <span
                    key={j}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono bg-[#091322] border border-[#162740] text-slate-500"
                    title={`Tool: ${tc.tool}`}
                  >
                    <span className="text-[#00d2ff]">⚡</span> {tc.tool}
                  </span>
                ))}
              </div>
            )}

            {/* RAG Citations — collapsible sources list */}
            {m.citations && m.citations.length > 0 && (
              <CitationBlock citations={m.citations} />
            )}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* ========================================================================= */}
      {/* SUGGESTED PROMPTS */}
      {/* ========================================================================= */}
      {showSuggestions && messages.length <= 2 && (
        <div className="px-5 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80">
          <span className="text-[10px] font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            Try asking
          </span>
          <div className="flex flex-wrap gap-1.5">
            {SUGGESTED_PROMPTS.map((p, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(p)}
                disabled={streaming}
                className="text-[11px] px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-100 font-medium border border-slate-200 dark:border-slate-700 transition-all text-left disabled:opacity-50"
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* INPUT BAR */}
      {/* ========================================================================= */}
      <div className="border-t border-[#1b2947] p-3.5 bg-[#09101d]">
        <div className="flex gap-2 items-center">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder="Ask about careers, courses, GPA fit..."
            disabled={streaming}
            className="flex-1 rounded-xl bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 dark:focus:ring-cyan-900/40 px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 outline-none transition-all disabled:opacity-50"
          />
          <button
            onClick={() => handleSend()}
            disabled={streaming || !input.trim()}
            className="rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-40 text-white px-4 py-2.5 text-sm font-semibold shadow-md shadow-teal-600/20 transition-all flex items-center gap-1.5 shrink-0 hover:-translate-y-0.5 active:translate-y-0"
          >
            {streaming ? (
              <span className="w-4 h-4 border-2 border-[#080d1a] border-t-transparent rounded-full animate-spin" />
            ) : (
              <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
            )}
            Send
          </button>
        </div>
        <p className="text-[10px] text-slate-600 mt-1.5 text-center">
          Press <kbd className="px-1 py-0.5 rounded bg-[#111f38] text-slate-400 font-mono">Enter</kbd> to send • Responses are AI-generated
        </p>
      </div>
    </div>
  );

  if (isModal) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/70 backdrop-blur-sm">
        <div className="w-full max-w-4xl h-[700px] max-h-[90vh] animate-[fadeIn_0.2s_ease-out]">
          {content}
        </div>
      </div>
    );
  }

  return <div className="h-[600px]">{content}</div>;
}

// ---------------------------------------------------------------------------
// Citation Block — collapsible "Sources" section under assistant messages
// ---------------------------------------------------------------------------

function CitationBlock({ citations }: { citations: { source: string; reference: string; claim: string }[] }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="mt-2 max-w-[85%]">
      <button
        onClick={() => setExpanded(!expanded)}
        className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#00d2ff]/80 hover:text-[#00d2ff] transition-colors"
      >
        <BookOpen className="w-3 h-3" />
        {citations.length} source{citations.length > 1 ? 's' : ''} cited
        <ChevronDown className={`w-3 h-3 transition-transform ${expanded ? 'rotate-180' : ''}`} />
      </button>

      {expanded && (
        <div className="mt-1.5 space-y-1.5 animate-[fadeIn_0.15s_ease-out]">
          {citations.map((c, i) => (
            <div
              key={i}
              className="rounded-lg bg-[#091322] border border-[#162740] px-3 py-2 text-[11px]"
            >
              <div className="flex items-start gap-2">
                <span className="shrink-0 w-4 h-4 rounded-full bg-[#00d2ff]/10 text-[#00d2ff] text-[9px] font-bold flex items-center justify-center mt-0.5">
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-slate-300 truncate">{c.source}</p>
                  <p className="text-slate-500 mt-0.5 line-clamp-2">{c.claim}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}