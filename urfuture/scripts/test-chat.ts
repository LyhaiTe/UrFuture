import { streamChat } from '../src/lib/llm';
import { retrieveRelevantContext } from '../src/lib/rag';

async function main() {
  process.env.LLM_MODEL = 'openai/gpt-oss-120b';
  const query = 'What skills do I need for Data Engineer?';
  console.log('1. Testing RAG retrieval for:', query);
  const rag = await retrieveRelevantContext(query);
  console.log('RAG retrieved chunks:', rag.chunks.length);

  console.log('\n2. Testing streamChat with openai/gpt-oss-120b...');
  const stream = streamChat({
    system: 'You are an advisor.\n' + (rag.contextText ? `Context:\n${rag.contextText}` : ''),
    messages: [{ role: 'user', content: query }],
  });

  for await (const event of stream) {
    if (event.type === 'text') {
      process.stdout.write(event.delta || '');
    } else if (event.type === 'tool_call') {
      console.log('\n[TOOL CALL]:', event.toolCall);
    } else if (event.type === 'done') {
      console.log('\n[DONE]');
    }
  }
}

main().catch(console.error);

