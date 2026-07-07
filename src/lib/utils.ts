import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/** Merges class names, resolving Tailwind class conflicts (later wins). */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Splits text into overlapping chunks for embedding. Splits on paragraph
 * boundaries first so related sentences stay together where possible.
 */
export function chunkText(text: string, chunkSize = 1000, overlap = 100): string[] {
  const paragraphs = text.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean)
  const chunks: string[] = []
  let current = ""

  for (const paragraph of paragraphs) {
    if ((current + "\n\n" + paragraph).length <= chunkSize) {
      current = current ? `${current}\n\n${paragraph}` : paragraph
      continue
    }

    if (current) chunks.push(current)

    if (paragraph.length <= chunkSize) {
      current = paragraph
    } else {
      // Paragraph itself exceeds chunkSize — split on a sliding window.
      let start = 0
      while (start < paragraph.length) {
        const end = Math.min(start + chunkSize, paragraph.length)
        chunks.push(paragraph.slice(start, end))
        start = end - overlap
        if (start <= 0 || end === paragraph.length) break
      }
      current = ""
    }
  }

  if (current) chunks.push(current)
  return chunks
}

/**
 * Checks whether a widget request's Origin is allowed for a chatbot. An
 * empty allowlist means the bot hasn't restricted domains yet, so any origin
 * is accepted (useful for local testing before going live).
 */
export function isOriginAllowed(origin: string | null, allowedDomains: string[]): boolean {
  if (allowedDomains.length === 0) return true
  if (!origin) return false

  let hostname: string
  try {
    hostname = new URL(origin).hostname
  } catch {
    return false
  }

  return allowedDomains.some((domain) => {
    const clean = domain.trim().replace(/^https?:\/\//, "").replace(/\/$/, "")
    return hostname === clean || hostname.endsWith(`.${clean}`)
  })
}

/** Builds permissive CORS headers for public widget-facing API routes. */
export function corsHeaders(origin: string | null): Record<string, string> {
  return {
    "Access-Control-Allow-Origin": origin ?? "*",
    "Access-Control-Allow-Methods": "GET, POST, PATCH, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  }
}
