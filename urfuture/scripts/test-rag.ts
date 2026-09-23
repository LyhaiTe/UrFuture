import { embedText, toVectorLiteral } from '../src/lib/embeddings';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testRAG() {
  const query = "What are the salary expectations and top skills in Cambodia?";
  console.log(`\n🔍 Searching database for: "${query}"\n`);

  // 1. Generate query embedding via Voyage AI
  const embedding = await embedText(query);

  // 2. Query Postgres via pgvector cosine distance (<=>)
  const vectorStr = toVectorLiteral(embedding);
  const results = await prisma.$queryRawUnsafe<Array<{
    content: string;
    source: string;
    title: string;
    similarity: number;
  }>>(`
    SELECT 
      c.content, 
      d.source, 
      d.title,
      1 - (c.embedding <=> '${vectorStr}'::vector) AS similarity
    FROM "KnowledgeChunk" c
    JOIN "KnowledgeDocument" d ON c."documentId" = d.id
    ORDER BY c.embedding <=> '${vectorStr}'::vector
    LIMIT 3;
  `);

  // 3. Output results
  results.forEach((match, i) => {
    console.log(`--- [Match ${i + 1}] Similarity: ${(match.similarity * 100).toFixed(2)}% ---`);
    console.log(`Source: ${match.source} (${match.title})`);
    console.log(`Content: ${match.content.slice(0, 150)}...\n`);
  });
}

testRAG()
  .catch(console.error)
  .finally(() => prisma.$disconnect());