'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import {
  ArrowRight,
  Bot,
  BookOpen,
  ChevronDown,
  Sparkles,
  X,
  Plus,
  History,
  Square,
  Trash2,
  Copy,
  Check,
  AlertTriangle,
  Loader2,
  ExternalLink,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface ChatMessage {
  id?: string;
  role: 'user' | 'assistant';
  content: string;
  toolCalls?: { tool: string; input: unknown }[];
  citations?: { source: string; reference: string; claim: string }[];
}

interface ConversationSummary {
  id: string;
  title: string;
  createdAt: string | Date;
  updatedAt: string | Date;
  messageCount: number;
  preview?: string;
}

interface ChatPanelProps {
  userId: string;
  studentName?: string;
  userName?: string;
  isModal?: boolean;
  onClose?: () => void;
}

const SUGGESTED_PROMPTS = [
  'Based on my transcript courses, what should I take next semester?',
  'Can I graduate on time with my current coursework?',
  'What skills do I need for a Software Engineer role in Cambodia?',
  'Suggest a 6-week study plan to close my priority skill gaps',
];

function buildWelcomeMessage(name?: string) {
  const greetingName = name?.trim() ? name.trim().split(' ')[0] : 'there';
  return `Hi ${greetingName}! I'm your **UrFuture Copilot**. I have access to your uploaded transcript courses, GPA, verified skills, and Cambodian labor-market data. 

I can help you:
- Check prerequisite completion & graduation readiness
- Map your current skills to target careers in Cambodia
- Formulate personalized study plans based on your coursework

How can I assist your academic journey today?`;
}

// ---------------------------------------------------------------------------
// Copyable Code Block for ReactMarkdown
// ---------------------------------------------------------------------------
function CodeBlock({ children, className }: { children: React.ReactNode; className?: string }) {
  const [copied, setCopied] = useState(false);
  const codeString = String(children).replace(/\n$/, '');
  const match = /language-(\w+)/.exec(className || '');
  const language = match ? match[1] : '';

  const handleCopy = () => {
    navigator.clipboard.writeText(codeString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-3 rounded-xl overflow-hidden border border-slate-700/80 bg-[#070e1b] shadow-md">
      <div className="flex items-center justify-between px-3.5 py-1.5 bg-[#0e1a30] border-b border-slate-700/60 text-xs text-slate-400">
        <span className="font-mono text-[11px] text-[#00d2ff]">{language || 'code'}</span>
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1 text-[11px] hover:text-white transition-colors py-0.5 px-2 rounded hover:bg-slate-700/50"
        >
          {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
          <span>{copied ? 'Copied!' : 'Copy'}</span>
        </button>
      </div>
      <pre className="p-3.5 text-xs text-slate-200 font-mono overflow-x-auto leading-relaxed">
        <code>{children}</code>
      </pre>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Rich Markdown renderer with custom Tailwind styling
// ---------------------------------------------------------------------------
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
          h4: ({ children }) => (
            <h4 className="text-xs font-semibold text-slate-200 mt-2 mb-1">
              {children}
            </h4>
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
          em: ({ children }) => (
            <em className="italic text-slate-300">
              {children}
            </em>
          ),
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#00d2ff] hover:underline font-medium inline-flex items-center gap-0.5"
            >
              {children}
              <ExternalLink className="w-2.5 h-2.5 inline opacity-70" />
            </a>
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
            return <CodeBlock className={className}>{children}</CodeBlock>;
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
            <blockquote className="border-l-2 border-[#00d2ff] pl-3 my-2 text-slate-600 dark:text-slate-400 italic bg-[#0c1830]/40 py-1 rounded-r">
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

// ---------------------------------------------------------------------------
// Citation Block — collapsible "Sources" pill and tray
// ---------------------------------------------------------------------------
function CitationBlock({ citations }: { citations: { source: string; reference: string; claim: string }[] }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="mt-2 max-w-[90%]">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-950/40 border border-cyan-800/40 text-[11px] font-semibold text-[#00d2ff] hover:bg-cyan-900/50 hover:border-cyan-700 transition-all shadow-sm"
      >
        <BookOpen className="w-3 h-3 text-[#00d2ff]" />
        <span>{citations.length} verified source{citations.length > 1 ? 's' : ''}</span>
        <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`} />
      </button>

      {expanded && (
        <div className="mt-2 space-y-1.5 animate-[fadeIn_0.15s_ease-out]">
          {citations.map((c, i) => (
            <div
              key={i}
              className="rounded-xl bg-[#091322] border border-[#162740] px-3.5 py-2.5 text-[11px] shadow-sm"
            >
              <div className="flex items-start gap-2.5">
                <span className="shrink-0 w-4 h-4 rounded-full bg-[#00d2ff]/15 text-[#00d2ff] text-[9px] font-bold flex items-center justify-center mt-0.5">
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-slate-200 truncate">{c.source}</p>
                  <p className="text-[10px] text-cyan-400/80 truncate mt-0.5">{c.reference}</p>
                  <p className="text-slate-400 mt-1 line-clamp-3 leading-relaxed">{c.claim}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main ChatPanel Component
// ---------------------------------------------------------------------------
export default function ChatPanel({
  userId,
  studentName,
  userName,
  isModal = false,
  onClose,
}: ChatPanelProps) {
  const effectiveName = studentName || userName;
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: buildWelcomeMessage(effectiveName),
    },
  ]);
  const [input, setInput] = useState('');
  const [conversationId, setConversationId] = useState<string | undefined>(undefined);
  const [conversationsList, setConversationsList] = useState<ConversationSummary[]>([]);
  const [streaming, setStreaming] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [showHistoryDropdown, setShowHistoryDropdown] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [highStakesAlert, setHighStakesAlert] = useState<string | null>(null);
  const [showScrollBottomBtn, setShowScrollBottomBtn] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isNearBottomRef = useRef(true);
  const abortControllerRef = useRef<AbortController | null>(null);

  // -------------------------------------------------------------------------
  // Hydrate conversation history on mount
  // -------------------------------------------------------------------------
  const hydrateHistory = useCallback(async () => {
    setIsLoadingHistory(true);
    try {
      const res = await fetch(`/api/chat/conversations?userId=${encodeURIComponent(userId)}`);
      if (!res.ok) throw new Error('Failed to fetch conversations');
      const data = await res.json();

      if (data.conversations) {
        setConversationsList(data.conversations);
      }

      if (data.activeConversation && data.activeConversation.messages.length > 0) {
        setConversationId(data.activeConversation.id);
        setMessages(data.activeConversation.messages);
        setShowSuggestions(false);
      } else {
        const studentGreetingName = effectiveName || data.user?.name;
        setMessages([
          {
            role: 'assistant',
            content: buildWelcomeMessage(studentGreetingName),
          },
        ]);
        setShowSuggestions(true);
      }
    } catch (err) {
      console.warn('Could not load chat history:', err);
      setMessages([
        {
          role: 'assistant',
          content: buildWelcomeMessage(effectiveName),
        },
      ]);
    } finally {
      setIsLoadingHistory(false);
    }
  }, [userId, effectiveName]);

  useEffect(() => {
    hydrateHistory();
  }, [hydrateHistory]);

  // -------------------------------------------------------------------------
  // Smart auto-scroll handling
  // -------------------------------------------------------------------------
  const handleScroll = () => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const threshold = 70;
    const isBottom = el.scrollHeight - el.scrollTop - el.clientHeight <= threshold;
    isNearBottomRef.current = isBottom;
    setShowScrollBottomBtn(!isBottom && messages.length > 2);
  };

  const scrollToBottom = (smooth = true) => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' });
    }
  };

  useEffect(() => {
    if (isNearBottomRef.current) {
      scrollToBottom(false);
    }
  }, [messages, streaming]);

  // -------------------------------------------------------------------------
  // New Chat Handler
  // -------------------------------------------------------------------------
  const handleNewChat = () => {
    if (streaming) {
      abortControllerRef.current?.abort();
      setStreaming(false);
    }
    setConversationId(undefined);
    setHighStakesAlert(null);
    setShowSuggestions(true);
    setShowHistoryDropdown(false);
    setMessages([
      {
        role: 'assistant',
        content: buildWelcomeMessage(effectiveName),
      },
    ]);
  };

  // -------------------------------------------------------------------------
  // Select past conversation thread
  // -------------------------------------------------------------------------
  const handleSelectConversation = async (selectedId: string) => {
    if (selectedId === conversationId) {
      setShowHistoryDropdown(false);
      return;
    }

    if (streaming) {
      abortControllerRef.current?.abort();
      setStreaming(false);
    }

    setShowHistoryDropdown(false);
    setIsLoadingHistory(true);
    try {
      const res = await fetch(`/api/chat/conversations/${selectedId}`);
      if (!res.ok) throw new Error('Failed to load conversation');
      const data = await res.json();
      if (data.conversation) {
        setConversationId(data.conversation.id);
        setMessages(
          data.conversation.messages.length > 0
            ? data.conversation.messages
            : [{ role: 'assistant', content: buildWelcomeMessage(effectiveName) }]
        );
        setShowSuggestions(data.conversation.messages.length === 0);
      }
    } catch (err) {
      console.error('Error switching conversation:', err);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  // -------------------------------------------------------------------------
  // Delete past conversation thread
  // -------------------------------------------------------------------------
  const handleDeleteConversation = async (e: React.MouseEvent, delId: string) => {
    e.stopPropagation();
    try {
      await fetch(`/api/chat/conversations/${delId}`, { method: 'DELETE' });
      setConversationsList((prev) => prev.filter((c) => c.id !== delId));
      if (conversationId === delId) {
        handleNewChat();
      }
    } catch (err) {
      console.error('Error deleting conversation:', err);
    }
  };

  // -------------------------------------------------------------------------
  // Stop Generating button
  // -------------------------------------------------------------------------
  const handleStopGenerating = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setStreaming(false);
  };

  // -------------------------------------------------------------------------
  // Send message & stream response
  // -------------------------------------------------------------------------
  async function handleSend(customText?: string) {
    const textToSend = customText ?? input;
    if (!textToSend.trim() || streaming) return;

    const userMessage = textToSend.trim();
    if (!customText) setInput('');
    setShowSuggestions(false);

    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setMessages((prev) => [...prev, { role: 'assistant', content: '' }]);
    setStreaming(true);

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    // Force scroll down when sending a new message
    isNearBottomRef.current = true;
    setTimeout(() => scrollToBottom(true), 50);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, conversationId, message: userMessage }),
        signal: abortController.signal,
      });

      if (!res.body) throw new Error('No response stream');

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        // Split on SSE block separators
        const events = buffer.split(/\r?\n\r?\n/);
        buffer = events.pop() ?? '';

        for (const raw of events) {
          if (!raw.trim()) continue;
          const lines = raw.split(/\r?\n/);
          let eventType = 'message';
          let dataString = '';

          for (const line of lines) {
            if (line.startsWith('event:')) {
              eventType = line.replace('event:', '').trim();
            } else if (line.startsWith('data:')) {
              dataString = line.replace('data:', '').trim();
            }
          }

          if (!dataString) continue;

          let data: any;
          try {
            data = JSON.parse(dataString);
          } catch {
            // Drop unparseable chunk safely without killing the stream
            continue;
          }

          if (eventType === 'token') {
            setMessages((prev) => {
              const next = [...prev];
              const last = next[next.length - 1];
              if (last && last.role === 'assistant') {
                next[next.length - 1] = {
                  ...last,
                  content: last.content + (data.delta || ''),
                };
              }
              return next;
            });
          } else if (eventType === 'tool_call') {
            setMessages((prev) => {
              const next = [...prev];
              const last = next[next.length - 1];
              if (last && last.role === 'assistant') {
                next[next.length - 1] = {
                  ...last,
                  toolCalls: [...(last.toolCalls ?? []), data],
                };
              }
              return next;
            });
          } else if (eventType === 'high_stakes_alert') {
            setHighStakesAlert(
              data.message ||
                'This topic touches on high-stakes academic transitions. An advisory review ticket has been queued to ensure you have verified advice from your university counselor.'
            );
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
            if (data.conversationId) {
              setConversationId(data.conversationId);
              // Update local conversations list title if new
              setConversationsList((prev) => {
                const existing = prev.find((c) => c.id === data.conversationId);
                if (existing) {
                  return prev.map((c) =>
                    c.id === data.conversationId
                      ? { ...c, updatedAt: new Date().toISOString(), messageCount: c.messageCount + 2 }
                      : c
                  );
                }
                return [
                  {
                    id: data.conversationId,
                    title: userMessage.slice(0, 50),
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    messageCount: 2,
                    preview: userMessage.slice(0, 80),
                  },
                  ...prev,
                ];
              });
            }

            if (data.citations && data.citations.length > 0) {
              setMessages((prev) => {
                const next = [...prev];
                const last = next[next.length - 1];
                if (last && last.role === 'assistant') {
                  next[next.length - 1] = {
                    ...last,
                    citations: data.citations,
                  };
                }
                return next;
              });
            }
          }
        }
      }
    } catch (e: any) {
      if (e.name === 'AbortError') {
        // User clicked Stop Generating — keep generated partial message cleanly
      } else {
        console.error('Chat error:', e);
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: 'Connection issue encountered. Please verify your connection and try your request again.',
          },
        ]);
      }
    } finally {
      setStreaming(false);
      abortControllerRef.current = null;
    }
  }

  // -------------------------------------------------------------------------
  // Main Panel Content
  // -------------------------------------------------------------------------
  const content = (
    <div className="flex h-full flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl shadow-black/20 overflow-hidden relative">
      {/* ========================================================================= */}
      {/* HEADER */}
      {/* ========================================================================= */}
      <div className="chat-header border-b border-[#1b2947] px-4 sm:px-5 py-3.5 flex items-center justify-between bg-gradient-to-r from-[#0c1830] to-[#0a1426] select-none">
        <div className="flex items-center gap-3">
          {/* Bot Avatar */}
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#00d2ff] to-[#0099cc] flex items-center justify-center shadow-md shadow-[#00d2ff]/30 shrink-0">
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
              Online • Academic profile &amp; RAG active
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* New Chat Button */}
          <button
            type="button"
            onClick={handleNewChat}
            title="Start new conversation"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-[#00d2ff] border border-cyan-500/30 text-xs font-semibold transition-all hover:scale-105 active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">New Chat</span>
          </button>

          {/* History Button */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowHistoryDropdown(!showHistoryDropdown)}
              title="Chat history"
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                showHistoryDropdown
                  ? 'bg-[#1b2b4d] text-white border-cyan-500/50'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700 hover:text-white'
              }`}
            >
              <History className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">History</span>
              {conversationsList.length > 0 && (
                <span className="ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] bg-cyan-500/20 text-cyan-300">
                  {conversationsList.length}
                </span>
              )}
            </button>

            {/* Past Conversations Dropdown */}
            {showHistoryDropdown && (
              <div className="absolute right-0 mt-2 w-72 sm:w-80 rounded-2xl border border-[#203454] bg-[#0d1627] shadow-2xl shadow-black/70 z-50 overflow-hidden animate-[fadeIn_0.15s_ease-out]">
                <div className="px-4 py-3 border-b border-[#203454] flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <History className="w-3.5 h-3.5 text-[#00d2ff]" />
                    Past Conversations
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowHistoryDropdown(false)}
                    className="text-slate-400 hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="max-h-64 overflow-y-auto divide-y divide-slate-800/60 p-1">
                  {conversationsList.length === 0 ? (
                    <div className="p-4 text-center text-xs text-slate-400">
                      No saved conversation history yet.
                    </div>
                  ) : (
                    conversationsList.map((c) => (
                      <div
                        key={c.id}
                        onClick={() => handleSelectConversation(c.id)}
                        className={`group flex items-center justify-between p-2.5 rounded-xl cursor-pointer text-xs transition-colors ${
                          c.id === conversationId
                            ? 'bg-[#152542] text-white font-medium border border-cyan-500/30'
                            : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                        }`}
                      >
                        <div className="min-w-0 flex-1 pr-2">
                          <p className="truncate font-semibold text-slate-200 group-hover:text-cyan-300">
                            {c.title}
                          </p>
                          <p className="text-[10px] text-slate-500 mt-0.5">
                            {new Date(c.updatedAt).toLocaleDateString([], {
                              month: 'short',
                              day: 'numeric',
                            })}{' '}
                            • {c.messageCount} messages
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => handleDeleteConversation(e, c.id)}
                          title="Delete thread"
                          className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Close Modal Button */}
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
      </div>

      {/* ========================================================================= */}
      {/* HIGH-STAKES ADVISORY NOTICE */}
      {/* ========================================================================= */}
      {highStakesAlert && (
        <div className="mx-4 mt-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex items-start gap-2.5 animate-[fadeIn_0.2s_ease-out] shadow-md shadow-amber-950/20">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-bold text-amber-300">High-Stakes Academic Transition Advisory</p>
            <p className="text-amber-200/90 mt-0.5 text-[11px] leading-relaxed">{highStakesAlert}</p>
          </div>
          <button
            type="button"
            onClick={() => setHighStakesAlert(null)}
            className="text-amber-400 hover:text-white transition-colors"
            aria-label="Dismiss alert"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MESSAGES VIEW */}
      {/* ========================================================================= */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 space-y-4 overflow-y-auto p-4 sm:p-5 scrollbar-thin relative"
      >
        {isLoadingHistory ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-[#00d2ff]" />
            <p className="text-xs font-medium">Restoring conversation &amp; student context…</p>
          </div>
        ) : (
          messages.map((m, i) => (
            <div
              key={m.id || i}
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

              {/* Tool Execution Trace */}
              {m.toolCalls && m.toolCalls.length > 0 && (
                <div className="mt-1.5 flex flex-wrap gap-1">
                  {m.toolCalls.map((tc, j) => (
                    <span
                      key={j}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono bg-[#091322] border border-[#162740] text-slate-400"
                      title={`Tool: ${tc.tool}`}
                    >
                      <span className="text-[#00d2ff]">⚡</span> {tc.tool}
                    </span>
                  ))}
                </div>
              )}

              {/* Verified Citations Badge & Block */}
              {m.citations && m.citations.length > 0 && (
                <CitationBlock citations={m.citations} />
              )}
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {/* Scroll to bottom button */}
      {showScrollBottomBtn && (
        <button
          type="button"
          onClick={() => scrollToBottom(true)}
          className="absolute bottom-20 right-6 z-20 p-2 rounded-full bg-[#0c1830] border border-[#1b2b4d] text-cyan-400 shadow-lg shadow-black/40 hover:bg-[#14233e] hover:text-white transition-all animate-bounce"
          title="Scroll to latest message"
        >
          <ChevronDown className="w-4 h-4" />
        </button>
      )}

      {/* ========================================================================= */}
      {/* SUGGESTED PROMPTS */}
      {/* ========================================================================= */}
      {showSuggestions && messages.length <= 2 && (
        <div className="px-5 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80">
          <span className="text-[10px] font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            Try asking
          </span>
          <div className="flex flex-wrap gap-1.5">
            {SUGGESTED_PROMPTS.map((p, idx) => (
              <button
                key={idx}
                type="button"
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
            placeholder="Ask about your transcript courses, graduation timeline, skills..."
            disabled={streaming}
            className="flex-1 rounded-xl bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 dark:focus:ring-cyan-900/40 px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 outline-none transition-all disabled:opacity-75"
          />

          {streaming ? (
            <button
              type="button"
              onClick={handleStopGenerating}
              className="rounded-xl bg-rose-600 hover:bg-rose-700 text-white px-3.5 py-2.5 text-xs font-semibold shadow-md shadow-rose-600/20 transition-all flex items-center gap-1.5 shrink-0 animate-pulse active:scale-95"
              title="Stop generating response"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
              Stop
            </button>
          ) : (
            <button
              type="button"
              onClick={() => handleSend()}
              disabled={!input.trim()}
              className="rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-40 text-white px-4 py-2.5 text-sm font-semibold shadow-md shadow-teal-600/20 transition-all flex items-center gap-1.5 shrink-0 hover:-translate-y-0.5 active:translate-y-0"
            >
              <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
              Send
            </button>
          )}
        </div>
        <p className="text-[10px] text-slate-500 mt-1.5 text-center">
          Press <kbd className="px-1 py-0.5 rounded bg-[#111f38] text-slate-400 font-mono">Enter</kbd> to send • UrFuture Copilot is grounded in Cambodian academic &amp; career data
        </p>
      </div>
    </div>
  );

  if (isModal) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-sm animate-[fadeIn_0.15s_ease-out]">
        <div className="w-full max-w-4xl h-[700px] max-h-[92vh]">
          {content}
        </div>
      </div>
    );
  }

  return <div className="h-[600px]">{content}</div>;
}