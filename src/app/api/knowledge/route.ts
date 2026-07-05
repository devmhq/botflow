import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { generateEmbedding, storeEmbedding } from "@/lib/embeddings";
import { chunkText } from "@/lib/utils";

async function extractPdfText(base64Data: string): Promise<string> {
  const { PDFParse } = await import("pdf-parse");
  const buffer = Buffer.from(base64Data, "base64");
  const parser = new PDFParse({ data: buffer });
  try {
    const result = await parser.getText();
    return result.text;
  } finally {
    await parser.destroy();
  }
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.tenantId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { botId, content, sourceType, fileData, sourceUrl } = body;

  if (!botId) {
    return NextResponse.json({ error: "botId is required" }, { status: 400 });
  }

  // Verify the bot belongs to this tenant
  const bot = await prisma.chatbot.findFirst({
    where: { id: botId, tenantId: session.user.tenantId },
  });
  if (!bot) return NextResponse.json({ error: "Not found" }, { status: 404 });

  let text = content as string | undefined;

  if (sourceType === "pdf") {
    if (!fileData) {
      return NextResponse.json({ error: "fileData (base64) is required for PDF ingestion" }, { status: 400 });
    }
    try {
      text = await extractPdfText(fileData);
    } catch {
      return NextResponse.json({ error: "Failed to parse PDF" }, { status: 400 });
    }
  }

  if (!text || !text.trim()) {
    return NextResponse.json({ error: "content is required" }, { status: 400 });
  }

  const chunks = chunkText(text);
  const items = [];

  for (const chunk of chunks) {
    const item = await prisma.knowledgeItem.create({
      data: {
        content: chunk,
        sourceType: sourceType ?? "text",
        sourceUrl: sourceUrl ?? null,
        chatbotId: botId,
      },
    });
    items.push(item);

    try {
      const embedding = await generateEmbedding(chunk);
      await storeEmbedding(item.id, embedding);
    } catch {
      // Embedding generation is best-effort — the chunk still exists for keyword-free
      // ingestion even if the embedding provider is unavailable/misconfigured.
    }
  }

  return NextResponse.json({ count: items.length, items }, { status: 201 });
}
