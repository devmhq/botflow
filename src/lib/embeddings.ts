import { prisma } from "@/lib/prisma";

const EMBEDDING_MODEL = "text-embedding-3-small";
const EMBEDDING_DIMENSIONS = 1536;

/**
 * Anthropic has no embeddings endpoint, so RAG embeddings are generated via
 * OpenAI's text-embedding-3-small (1536 dims, matches the pgvector column).
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY is not configured");

  const res = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: EMBEDDING_MODEL,
      input: text,
      dimensions: EMBEDDING_DIMENSIONS,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Embedding request failed (${res.status}): ${body}`);
  }

  const data = await res.json();
  return data.data[0].embedding as number[];
}

function toVectorLiteral(embedding: number[]): string {
  return `[${embedding.join(",")}]`;
}

/**
 * Writes an embedding onto an existing KnowledgeItem. Uses a raw query since
 * Prisma's client treats `vector` as an Unsupported type.
 */
export async function storeEmbedding(knowledgeItemId: string, embedding: number[]) {
  const vector = toVectorLiteral(embedding);
  await prisma.$executeRaw`
    UPDATE "KnowledgeItem"
    SET embedding = ${vector}::vector
    WHERE id = ${knowledgeItemId}
  `;
}

/**
 * Embeds a query and returns the top-K most similar knowledge chunks for a
 * chatbot, ordered by cosine distance (pgvector `<=>` operator).
 */
export async function searchKnowledge(
  chatbotId: string,
  query: string,
  limit = 5
): Promise<{ id: string; content: string }[]> {
  const embedding = await generateEmbedding(query);
  const vector = toVectorLiteral(embedding);

  return prisma.$queryRaw<{ id: string; content: string }[]>`
    SELECT id, content
    FROM "KnowledgeItem"
    WHERE "chatbotId" = ${chatbotId} AND embedding IS NOT NULL
    ORDER BY embedding <=> ${vector}::vector
    LIMIT ${limit}
  `;
}
