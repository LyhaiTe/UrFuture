'use client';

import { useRef, useState, useEffect } from 'react';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  toolCalls?: { tool: string; input: unknown }[];
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

// Simple markdown-like renderer (bold + inline code)
function renderContent(text: string) {
  if (!text) return null;
  // Bold **text**
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className="font-bold text-cyan-600 dark:text-cyan-400">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code
          key={i}
          className="px-1.5 py-0.5 rounded bg-[#0a1528] text-[#00d2ff] font-mono text-[0.85em] border border-[#1b2b4d]"
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

export default function ChatPanel({ userId, isModal = false, onClose }: ChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content:
        "Hi Alex! I'm your **UrFuture Copilot**. I can help you analyze career fit, break down required skills, assess course prerequisites, or recommend next steps based on your verified knowledge. How can I guide you today?",
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
          } else if (eventType === 'done') {
            setConversationId(data.conversationId);
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
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <rect x="5" y="8" width="14" height="10" rx="2" strokeWidth={2} />
              <circle cx="9" cy="12" r="1.5" fill="currentColor" />
              <circle cx="15" cy="12" r="1.5" fill="currentColor" />
              <path strokeLinecap="round" strokeWidth={2} d="M9 15c1.5 1 4.5 1 6 0" />
              <path strokeLinecap="round" strokeWidth={2} d="M12 8V5" />
              <circle cx="12" cy="4" r="1" fill="currentColor" />
              <path strokeLinecap="round" strokeWidth={2} d="M5 12H3M19 12h2" />
            </svg>
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
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
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
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                m.role === 'user'
                  ? 'bg-gradient-to-r from-[#0284c7] to-[#0ea5e9] text-white font-medium shadow-md shadow-[#0284c7]/20 rounded-tr-sm'
                  : 'bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 shadow-sm rounded-tl-sm'
              }`}
            >
              {m.content ? (
                <div className="whitespace-pre-wrap break-words">{renderContent(m.content)}</div>
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
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* ========================================================================= */}
      {/* SUGGESTED PROMPTS */}
      {/* ========================================================================= */}
      {showSuggestions && messages.length <= 2 && (
        <div className="px-5 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80">
          <span className="text-[10px] font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider block mb-2">
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
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
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
        <div className="w-full max-w-3xl h-[640px] max-h-[90vh] animate-[fadeIn_0.2s_ease-out]">
          {content}
        </div>
      </div>
    );
  }

  return <div className="h-[600px]">{content}</div>;
}