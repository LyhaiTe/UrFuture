'use client';

import { useRef, useState } from 'react';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  toolCalls?: { tool: string; input: unknown }[];
}

export default function ChatPanel({ userId }: { userId: string }) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content:
        "Hi! I'm your career and study advisor. Ask me anything — like whether you can succeed in engineering with weak math, or what careers fit your skills. I'll always tell you where my facts come from.",
    },
  ]);
  const [input, setInput] = useState('');
  const [conversationId, setConversationId] = useState<string | undefined>(undefined);
  const [streaming, setStreaming] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  async function sendMessage() {
    if (!input.trim() || streaming) return;
    const userMessage = input.trim();
    setInput('');
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
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
      }
    } catch (e) {
      setMessages((prev) => [...prev, { role: 'assistant', content: 'Something went wrong. Please try again.' }]);
    } finally {
      setStreaming(false);
    }
  }

  return (
    <div className="card flex h-[540px] flex-col">
      <div className="border-b border-black/10 px-4 py-2 text-sm font-medium text-angkor-maroon">Ask Phlouv</div>
      <div className="flex-1 space-y-3 overflow-y-auto scrollbar-thin p-4">
        {messages.map((m, i) => (
          <div key={i} className={m.role === 'user' ? 'text-right' : 'text-left'}>
            <div
              className={
                'inline-block max-w-[85%] rounded-lg px-3 py-2 text-sm ' +
                (m.role === 'user' ? 'bg-angkor-maroon text-white' : 'bg-black/5 text-black')
              }
            >
              {m.content || (streaming && i === messages.length - 1 ? '…' : '')}
            </div>
            {m.toolCalls?.map((tc, j) => (
              <div key={j} className="mt-1 text-[11px] text-black/40">
                🔧 called {tc.tool}
              </div>
            ))}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <div className="flex gap-2 border-t border-black/10 p-3">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Type a question…"
          className="flex-1 rounded-md border border-black/15 px-3 py-2 text-sm"
        />
        <button
          onClick={sendMessage}
          disabled={streaming}
          className="rounded-md bg-angkor-maroon px-4 py-2 text-sm font-medium text-white disabled:opacity-40"
        >
          Send
        </button>
      </div>
    </div>
  );
}
